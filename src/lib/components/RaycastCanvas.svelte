<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Raycaster,
		InputHandler,
		generateTextures,
		createDefaultMap,
		createDefaultSprites,
		DEFAULT_CONFIG
	} from '$lib/engine';
	import type { Player } from '$lib/engine';
	import Minimap from './Minimap.svelte';

	const config = { ...DEFAULT_CONFIG };
	const map = createDefaultMap();
	const sprites = createDefaultSprites();
	const textures = generateTextures(config.textureSize);

	const player: Player = {
		pos: { x: 2, y: 2 },
		dir: { x: 1, y: 0 },
		plane: { x: 0, y: 0.66 }
	};

	let canvas: HTMLCanvasElement;
	let fps = $state(0);
	let showMinimap = $state(true);

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const raycaster = new Raycaster(config, textures);
		const input = new InputHandler(canvas);

		let lastTime = performance.now();
		let frameCount = 0;
		let fpsTimer = 0;
		let running = true;

		function gameLoop(now: number): void {
			if (!running) return;

			const dt = now - lastTime;
			lastTime = now;
			frameCount++;
			fpsTimer += dt;

			if (fpsTimer >= 1000) {
				fps = frameCount;
				frameCount = 0;
				fpsTimer = 0;
			}

			input.update(player, map, config);
			raycaster.render(ctx, player, map, sprites);

			requestAnimationFrame(gameLoop);
		}

		requestAnimationFrame(gameLoop);

		return () => {
			running = false;
			input.destroy();
		};
	});
</script>

<div class="game-container">
	<canvas
		bind:this={canvas}
		width={config.screenWidth}
		height={config.screenHeight}
	></canvas>

	<div class="hud">
		<span class="fps">{fps} FPS</span>
		<button class="minimap-toggle" onclick={() => (showMinimap = !showMinimap)}>
			{showMinimap ? 'Hide' : 'Show'} Map
		</button>
	</div>

	{#if showMinimap}
		<Minimap {map} {player} {sprites} />
	{/if}

	<div class="controls-hint">
		<p>Click to capture mouse | WASD / Arrows to move | ESC to release mouse</p>
	</div>
</div>

<style>
	.game-container {
		position: relative;
		display: inline-block;
	}

	canvas {
		display: block;
		background: #000;
		cursor: crosshair;
		image-rendering: pixelated;
	}

	.hud {
		position: absolute;
		top: 8px;
		left: 8px;
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.fps {
		color: #0f0;
		font-family: monospace;
		font-size: 14px;
		text-shadow: 1px 1px 2px #000;
	}

	.minimap-toggle {
		background: rgba(0, 0, 0, 0.6);
		color: #fff;
		border: 1px solid #555;
		padding: 2px 8px;
		font-size: 12px;
		cursor: pointer;
		font-family: monospace;
	}

	.controls-hint {
		position: absolute;
		bottom: 8px;
		left: 0;
		right: 0;
		text-align: center;
	}

	.controls-hint p {
		color: rgba(255, 255, 255, 0.6);
		font-family: monospace;
		font-size: 12px;
		margin: 0;
		text-shadow: 1px 1px 2px #000;
	}
</style>
