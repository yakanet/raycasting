import type { Player, WorldMap, EngineConfig } from './types';

export class InputHandler {
	private keys = new Set<string>();
	private mouseLocked = false;
	private mouseRotation = 0;
	private canvas: HTMLCanvasElement;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.setup();
	}

	private setup(): void {
		const onKeyDown = (e: KeyboardEvent) => {
			this.keys.add(e.code);
			e.preventDefault();
		};
		const onKeyUp = (e: KeyboardEvent) => {
			this.keys.delete(e.code);
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

		window.addEventListener('keydown', onKeyDown);
		window.addEventListener('keyup', onKeyUp);
		this.canvas.addEventListener('mousemove', onMouseMove);
		this.canvas.addEventListener('click', onClick);
		document.addEventListener('pointerlockchange', onPointerLockChange);

		this._cleanup = () => {
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			this.canvas.removeEventListener('mousemove', onMouseMove);
			this.canvas.removeEventListener('click', onClick);
			document.removeEventListener('pointerlockchange', onPointerLockChange);
		};
	}

	private _cleanup: (() => void) | null = null;

	destroy(): void {
		this._cleanup?.();
	}

	update(player: Player, map: WorldMap, config: EngineConfig): void {
		const { moveSpeed, rotSpeed } = config;

		// Mouse rotation
		if (this.mouseRotation !== 0) {
			this.rotate(player, this.mouseRotation);
			this.mouseRotation = 0;
		}

		// Keyboard movement
		if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) {
			this.moveForward(player, map, moveSpeed);
		}
		if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) {
			this.moveForward(player, map, -moveSpeed);
		}
		if (this.keys.has('KeyA')) {
			this.strafe(player, map, -moveSpeed);
		}
		if (this.keys.has('KeyD')) {
			this.strafe(player, map, moveSpeed);
		}
		if (this.keys.has('ArrowLeft')) {
			this.rotate(player, -rotSpeed);
		}
		if (this.keys.has('ArrowRight')) {
			this.rotate(player, rotSpeed);
		}
	}

	private moveForward(player: Player, map: WorldMap, speed: number): void {
		const margin = 0.2;
		const newX = player.pos.x + player.dir.x * speed;
		const newY = player.pos.y + player.dir.y * speed;

		if (this.isWalkable(map, newX, player.pos.y, margin)) {
			player.pos.x = newX;
		}
		if (this.isWalkable(map, player.pos.x, newY, margin)) {
			player.pos.y = newY;
		}
	}

	private strafe(player: Player, map: WorldMap, speed: number): void {
		const margin = 0.2;
		const newX = player.pos.x + player.plane.x * speed;
		const newY = player.pos.y + player.plane.y * speed;

		if (this.isWalkable(map, newX, player.pos.y, margin)) {
			player.pos.x = newX;
		}
		if (this.isWalkable(map, player.pos.x, newY, margin)) {
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

	private isWalkable(map: WorldMap, x: number, y: number, margin: number): boolean {
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
					// Check if within margin
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
		return true;
	}
}
