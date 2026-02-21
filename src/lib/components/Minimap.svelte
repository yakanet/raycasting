<script lang="ts">
	import type { WorldMap, Player, Sprite } from '$lib/engine';
	import { onMount } from 'svelte';

	interface Props {
		map: WorldMap;
		player: Player;
		sprites: Sprite[];
	}

	let { map, player, sprites }: Props = $props();

	const cellSize = 8;
	let canvas: HTMLCanvasElement;
	let animFrame: number;

	onMount(() => {
		const ctx = canvas.getContext('2d')!;

		function draw() {
			const w = map.width * cellSize;
			const h = map.height * cellSize;
			ctx.clearRect(0, 0, w, h);

			// Draw tiles
			for (let y = 0; y < map.height; y++) {
				for (let x = 0; x < map.width; x++) {
					const tile = map.tiles[y][x];
					if (tile > 0) {
						const colors = ['#b03020', '#888', '#3040a0', '#a07030', '#508050'];
						ctx.fillStyle = colors[(tile - 1) % colors.length];
					} else {
						ctx.fillStyle = '#222';
					}
					ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
				}
			}

			// Draw sprites
			for (const s of sprites) {
				ctx.fillStyle = '#ff0';
				ctx.beginPath();
				ctx.arc(s.pos.x * cellSize, s.pos.y * cellSize, 2, 0, Math.PI * 2);
				ctx.fill();
			}

			// Draw player
			const px = player.pos.x * cellSize;
			const py = player.pos.y * cellSize;
			ctx.fillStyle = '#0f0';
			ctx.beginPath();
			ctx.arc(px, py, 3, 0, Math.PI * 2);
			ctx.fill();

			// Draw direction
			ctx.strokeStyle = '#0f0';
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(px, py);
			ctx.lineTo(px + player.dir.x * 12, py + player.dir.y * 12);
			ctx.stroke();

			// FOV lines
			ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(px, py);
			ctx.lineTo(px + (player.dir.x + player.plane.x) * 16, py + (player.dir.y + player.plane.y) * 16);
			ctx.moveTo(px, py);
			ctx.lineTo(px + (player.dir.x - player.plane.x) * 16, py + (player.dir.y - player.plane.y) * 16);
			ctx.stroke();

			animFrame = requestAnimationFrame(draw);
		}

		animFrame = requestAnimationFrame(draw);
		return () => cancelAnimationFrame(animFrame);
	});
</script>

<canvas
	bind:this={canvas}
	class="minimap"
	width={map.width * cellSize}
	height={map.height * cellSize}
></canvas>

<style>
	.minimap {
		position: absolute;
		top: 8px;
		right: 8px;
		border: 1px solid #555;
		background: #111;
		opacity: 0.85;
	}
</style>
