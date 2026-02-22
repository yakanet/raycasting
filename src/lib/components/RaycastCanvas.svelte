<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Raycaster,
		InputHandler,
		buildTextures,
		getEntityBehavior
	} from '$lib/engine';
	import type { Player, Sprite, WorldMap, EngineConfig, TeleportTarget } from '$lib/engine';
	import { inventoryState, addToInventory } from '$lib/stores/inventory.svelte';
	import { playTeleportSound } from '$lib/engine/audio';
	import Minimap from './Minimap.svelte';

	interface Props {
		map: WorldMap;
		sprites: Sprite[];
		player: Player;
		config: EngineConfig;
		preloadedTextures?: Uint8ClampedArray[];
		onTeleport?: (target: TeleportTarget) => void;
	}

	const { map, sprites, player, config, preloadedTextures, onTeleport }: Props = $props();

	function getPreloaded() { return preloadedTextures; }
	const initialPreloaded = getPreloaded();

	let canvas: HTMLCanvasElement;
	let fps = $state(0);
	let showMinimap = $state(true);
	let loading = $state(!initialPreloaded);

	onMount(() => {
		let running = true;
		let input: InputHandler | null = null;

		(async () => {
			const loadedTextures = initialPreloaded ?? await buildTextures(config.textureSize);
			if (!running) return;
			loading = false;
			if (!initialPreloaded) {
				await new Promise((r) => requestAnimationFrame(r));
				if (!running) return;
			}

			const ctx = canvas.getContext('2d')!;
			const raycaster = new Raycaster(config, loadedTextures);
			input = new InputHandler(canvas);

			let lastTime = performance.now();
			let frameCount = 0;
			let fpsTimer = 0;

			function gameLoop(now: number): void {
				if (!running) return;

				const dtMs = now - lastTime;
				lastTime = now;
				frameCount++;
				fpsTimer += dtMs;

				if (fpsTimer >= 1000) {
					fps = frameCount;
					frameCount = 0;
					fpsTimer = 0;
				}

				const dt = Math.min(dtMs / 1000, 0.1);

				input!.update(player, map, sprites, config, dt, (sprite) => {
					if (sprite.entityType) {
						const behavior = getEntityBehavior(sprite.entityType);
						if (behavior) {
							if (behavior.inventoryKey) {
								addToInventory(behavior.inventoryKey);
							}
							behavior.playSound();
						}
					}
				}, (sprite) => {
					if (sprite.teleportTarget) {
						playTeleportSound();
						onTeleport?.(sprite.teleportTarget);
					}
				});
				raycaster.render(ctx, player, map, sprites);

				requestAnimationFrame(gameLoop);
			}

			requestAnimationFrame(gameLoop);
		})();

		return () => {
			running = false;
			input?.destroy();
		};
	});
</script>

<div class="game-container">
	{#if loading}
		<div class="loading">Loading textures...</div>
	{/if}
	<canvas
		bind:this={canvas}
		width={config.screenWidth}
		height={config.screenHeight}
		class:hidden={loading}
	></canvas>

	<div class="hud">
		<span class="fps">{fps} FPS</span>
		<button class="minimap-toggle" onclick={() => (showMinimap = !showMinimap)}>
			{showMinimap ? 'Hide' : 'Show'} Map
		</button>
		{#if Object.keys(inventoryState).length > 0}
			<div class="inventory">
				{#each Object.entries(inventoryState) as [key, count]}
					<span>{key}: {count}</span>
				{/each}
			</div>
		{/if}
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
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.loading {
		color: #fff;
		font-family: monospace;
		font-size: 18px;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	canvas.hidden {
		visibility: hidden;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
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

	.inventory {
		display: flex;
		gap: 12px;
		background: rgba(0, 0, 0, 0.6);
		padding: 2px 8px;
		border-radius: 3px;
		border: 1px solid #555;
		color: #ff0;
		font-family: monospace;
		font-size: 14px;
		text-shadow: 1px 1px 2px #000;
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
