import type { Player, WorldMap, EngineConfig, Sprite } from './types';

export class InputHandler {
	private keys = new Set<string>();
	private mouseLocked = false;
	private mouseRotation = 0;
	private canvas: HTMLCanvasElement;
	private activeTeleporters = new Set<Sprite>();

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.setup();
	}

	private setup(): void {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey) return;
			this.keys.add(e.code);
			e.preventDefault();
		};
		const onKeyUp = (e: KeyboardEvent) => {
			this.keys.delete(e.code);
			// macOS swallows individual keyup events while Meta is held,
			// so when Meta itself is released, clear everything.
			if (e.key === 'Meta') {
				this.keys.clear();
			}
			e.preventDefault();
		};
		const onMouseMove = (e: MouseEvent) => {
			if (this.mouseLocked) {
				this.mouseRotation += e.movementX * 0.002;
			}
		};
		const onClick = () => {
			if (!this.mouseLocked) {
				this.canvas.requestPointerLock();
			}
		};
		const onPointerLockChange = () => {
			this.mouseLocked = document.pointerLockElement === this.canvas;
		};
		const onBlur = () => {
			this.keys.clear();
		};

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		window.addEventListener('blur', onBlur);
		this.canvas.addEventListener('mousemove', onMouseMove);
		this.canvas.addEventListener('click', onClick);
		document.addEventListener('pointerlockchange', onPointerLockChange);

		this._cleanup = () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);
			this.canvas.removeEventListener('mousemove', onMouseMove);
			this.canvas.removeEventListener('click', onClick);
			document.removeEventListener('pointerlockchange', onPointerLockChange);
		};
	}

	private _cleanup: (() => void) | null = null;

	destroy(): void {
		this._cleanup?.();
	}

	update(player: Player, map: WorldMap, sprites: Sprite[], config: EngineConfig, onCollect?: (sprite: Sprite) => void, onTeleport?: (sprite: Sprite) => void): void {
		const { moveSpeed, rotSpeed } = config;

		// Mouse rotation
		if (this.mouseRotation !== 0) {
			this.rotate(player, this.mouseRotation);
			this.mouseRotation = 0;
		}

		// Keyboard movement
		if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
			this.moveForward(player, map, sprites, moveSpeed);
		}
		if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
			this.moveForward(player, map, sprites, -moveSpeed);
		}
		if (this.keys.has('KeyA')) {
			this.strafe(player, map, sprites, -moveSpeed);
		}
		if (this.keys.has('KeyD')) {
			this.strafe(player, map, sprites, moveSpeed);
		}
		if (this.keys.has('ArrowLeft')) {
			this.rotate(player, -rotSpeed);
		}
		if (this.keys.has('ArrowRight')) {
			this.rotate(player, rotSpeed);
		}

		// Collectible pickup
		if (onCollect) {
			for (let i = sprites.length - 1; i >= 0; i--) {
				const sprite = sprites[i];
				if (!sprite.collectible) continue;
				const dx = player.pos.x - sprite.pos.x;
				const dy = player.pos.y - sprite.pos.y;
				if (dx * dx + dy * dy < 0.25) {
					onCollect(sprite);
					sprites.splice(i, 1);
				}
			}
		}

		// Teleporter detection (non-destructive, with cooldown)
		for (const sprite of sprites) {
			if (sprite.entityType !== 'teleporter' || !sprite.teleportTarget) continue;
			const dx = player.pos.x - sprite.pos.x;
			const dy = player.pos.y - sprite.pos.y;
			const distSq = dx * dx + dy * dy;
			if (distSq < 0.25) {
				if (!this.activeTeleporters.has(sprite)) {
					this.activeTeleporters.add(sprite);
					onTeleport?.(sprite);
				}
			} else if (distSq > 0.49) {
				this.activeTeleporters.delete(sprite);
			}
		}
	}

	private moveForward(player: Player, map: WorldMap, sprites: Sprite[], speed: number): void {
		const margin = 0.2;
		const newX = player.pos.x + player.dir.x * speed;
		const newY = player.pos.y + player.dir.y * speed;

		if (this.isWalkable(map, sprites, newX, player.pos.y, margin)) {
			player.pos.x = newX;
		}
		if (this.isWalkable(map, sprites, player.pos.x, newY, margin)) {
			player.pos.y = newY;
		}
	}

	private strafe(player: Player, map: WorldMap, sprites: Sprite[], speed: number): void {
		const margin = 0.2;
		const newX = player.pos.x + player.plane.x * speed;
		const newY = player.pos.y + player.plane.y * speed;

		if (this.isWalkable(map, sprites, newX, player.pos.y, margin)) {
			player.pos.x = newX;
		}
		if (this.isWalkable(map, sprites, player.pos.x, newY, margin)) {
			player.pos.y = newY;
		}
	}

	private rotate(player: Player, angle: number): void {
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);

		const oldDirX = player.dir.x;
		player.dir.x = player.dir.x * cos - player.dir.y * sin;
		player.dir.y = oldDirX * sin + player.dir.y * cos;

		const oldPlaneX = player.plane.x;
		player.plane.x = player.plane.x * cos - player.plane.y * sin;
		player.plane.y = oldPlaneX * sin + player.plane.y * cos;
	}

	private isWalkable(map: WorldMap, sprites: Sprite[], x: number, y: number, margin: number): boolean {
		const mx = Math.floor(x);
		const my = Math.floor(y);
		if (mx < 0 || mx >= map.width || my < 0 || my >= map.height) return false;

		// Check surrounding cells for collision margin
		for (let dy = -1; dy <= 1; dy++) {
			for (let dx = -1; dx <= 1; dx++) {
				const cx = mx + dx;
				const cy = my + dy;
				if (cx < 0 || cx >= map.width || cy < 0 || cy >= map.height) continue;
				if (map.tiles[cy][cx] > 0) {
					const closestX = Math.max(cx, Math.min(x, cx + 1));
					const closestY = Math.max(cy, Math.min(y, cy + 1));
					const distX = x - closestX;
					const distY = y - closestY;
					if (distX * distX + distY * distY < margin * margin) {
						return false;
					}
				}
			}
		}

		// Check solid sprites
		for (const sprite of sprites) {
			if (!sprite.solid) continue;
			const dx = x - sprite.pos.x;
			const dy = y - sprite.pos.y;
			const minDist = margin + sprite.radius;
			if (dx * dx + dy * dy < minDist * minDist) {
				return false;
			}
		}

		return true;
	}
}
