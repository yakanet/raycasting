<script lang="ts">
	import { TEX_COIN, TEX_BOMB } from '$lib/engine';
	import type { WorldMap, Sprite, Player } from '$lib/engine';

	interface Props {
		map: WorldMap;
		sprites: Sprite[];
		player: Player;
		mode: 'wall' | 'erase' | 'sprite' | 'player';
		wallTexture: number;
		spriteTexture: number;
		onspriteselect: (index: number) => void;
	}

	let { map, sprites, player, mode, wallTexture, spriteTexture, onspriteselect }: Props = $props();

	const CELL = 24;
	let canvas: HTMLCanvasElement;
	let painting = $state(false);

	const WALL_COLORS = ['#b03020', '#888', '#3040a0', '#a07030', '#508050'];

	function getCellFromEvent(e: PointerEvent): { x: number; y: number } {
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.floor((e.clientX - rect.left) / CELL),
			y: Math.floor((e.clientY - rect.top) / CELL)
		};
	}

	function handleCell(x: number, y: number) {
		if (x < 0 || x >= map.width || y < 0 || y >= map.height) return;

		if (mode === 'wall') {
			map.tiles[y][x] = wallTexture;
		} else if (mode === 'erase') {
			map.tiles[y][x] = 0;
		} else if (mode === 'sprite') {
			const isCollectible = spriteTexture === TEX_COIN || spriteTexture === TEX_BOMB;
			sprites.push({
				pos: { x: x + 0.5, y: y + 0.5 },
				texture: spriteTexture,
				solid: !isCollectible,
				radius: isCollectible ? 0 : 0.3,
				scale: spriteTexture === TEX_COIN ? 0.5 : spriteTexture === TEX_BOMB ? 0.8 : 1,
				...(isCollectible ? { collectible: true } : {})
			});
			onspriteselect(sprites.length - 1);
		} else if (mode === 'player') {
			player.pos.x = x + 0.5;
			player.pos.y = y + 0.5;
		}
	}

	function onpointerdown(e: PointerEvent) {
		painting = true;
		canvas.setPointerCapture(e.pointerId);
		const { x, y } = getCellFromEvent(e);
		if (mode === 'sprite' || mode === 'player') {
			handleCell(x, y);
		} else {
			handleCell(x, y);
		}
	}

	function onpointermove(e: PointerEvent) {
		if (!painting) return;
		if (mode === 'sprite' || mode === 'player') return;
		const { x, y } = getCellFromEvent(e);
		handleCell(x, y);
	}

	function onpointerup() {
		painting = false;
	}

	$effect(() => {
		const ctx = canvas?.getContext('2d');
		if (!ctx) return;

		// Access reactive state to track changes
		const _tiles = map.tiles;
		const _sprites = sprites;
		const _player = player.pos;

		const w = map.width * CELL;
		const h = map.height * CELL;
		ctx.clearRect(0, 0, w, h);

		// Draw tiles
		for (let y = 0; y < map.height; y++) {
			for (let x = 0; x < map.width; x++) {
				const tile = _tiles[y][x];
				if (tile > 0) {
					ctx.fillStyle = WALL_COLORS[(tile - 1) % WALL_COLORS.length];
				} else {
					ctx.fillStyle = '#222';
				}
				ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
			}
		}

		// Grid lines
		ctx.strokeStyle = '#444';
		ctx.lineWidth = 0.5;
		for (let x = 0; x <= map.width; x++) {
			ctx.beginPath();
			ctx.moveTo(x * CELL, 0);
			ctx.lineTo(x * CELL, h);
			ctx.stroke();
		}
		for (let y = 0; y <= map.height; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * CELL);
			ctx.lineTo(w, y * CELL);
			ctx.stroke();
		}

		// Draw sprites
		for (const s of _sprites) {
			ctx.fillStyle = '#ff0';
			ctx.beginPath();
			ctx.arc(s.pos.x * CELL, s.pos.y * CELL, 4, 0, Math.PI * 2);
			ctx.fill();
		}

		// Draw player
		const px = _player.x * CELL;
		const py = _player.y * CELL;
		ctx.fillStyle = '#0f0';
		ctx.beginPath();
		ctx.arc(px, py, 5, 0, Math.PI * 2);
		ctx.fill();

		// Player direction
		ctx.strokeStyle = '#0f0';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(px, py);
		ctx.lineTo(px + player.dir.x * 16, py + player.dir.y * 16);
		ctx.stroke();
	});
</script>

<canvas
	bind:this={canvas}
	width={map.width * CELL}
	height={map.height * CELL}
	class="grid-canvas"
	{onpointerdown}
	{onpointermove}
	{onpointerup}
></canvas>

<style>
	.grid-canvas {
		border: 1px solid #555;
		cursor: crosshair;
		display: block;
	}
</style>
