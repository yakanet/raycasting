import type { Player, WorldMap, RayHit, EngineConfig, Sprite } from './types';

/**
 * Core raycasting engine - renders walls, textured floor/ceiling, and sprites.
 */
export class Raycaster {
	private config: EngineConfig;
	private textures: Uint8ClampedArray[];
	private imageData!: ImageData;
	private zBuffer!: Float64Array;

	constructor(config: EngineConfig, textures: Uint8ClampedArray[]) {
		this.config = config;
		this.textures = textures;
	}

	render(ctx: CanvasRenderingContext2D, player: Player, map: WorldMap, sprites: Sprite[]): void {
		const { screenWidth, screenHeight } = this.config;

		if (!this.imageData || this.imageData.width !== screenWidth) {
			this.imageData = ctx.createImageData(screenWidth, screenHeight);
			this.zBuffer = new Float64Array(screenWidth);
		}

		const buf = this.imageData.data;
		buf.fill(0);

		// Render floor and ceiling
		this.renderFloorCeiling(buf, player);

		// Render walls via DDA raycasting
		for (let x = 0; x < screenWidth; x++) {
			const hit = this.castRay(x, player, map);
			this.zBuffer[x] = hit.wallDist;
			this.renderWallStripe(buf, x, hit);
		}

		// Render sprites
		this.renderSprites(buf, player, sprites);

		ctx.putImageData(this.imageData, 0, 0);
	}

	/**
	 * DDA raycasting algorithm - cast a single ray for column x.
	 */
	private castRay(x: number, player: Player, map: WorldMap): RayHit {
		const { screenWidth } = this.config;
		const cameraX = (2 * x) / screenWidth - 1;
		const rayDirX = player.dir.x + player.plane.x * cameraX;
		const rayDirY = player.dir.y + player.plane.y * cameraX;

		let mapX = Math.floor(player.pos.x);
		let mapY = Math.floor(player.pos.y);

		const deltaDistX = Math.abs(1 / rayDirX);
		const deltaDistY = Math.abs(1 / rayDirY);

		let stepX: number, stepY: number;
		let sideDistX: number, sideDistY: number;

		if (rayDirX < 0) {
			stepX = -1;
			sideDistX = (player.pos.x - mapX) * deltaDistX;
		} else {
			stepX = 1;
			sideDistX = (mapX + 1 - player.pos.x) * deltaDistX;
		}
		if (rayDirY < 0) {
			stepY = -1;
			sideDistY = (player.pos.y - mapY) * deltaDistY;
		} else {
			stepY = 1;
			sideDistY = (mapY + 1 - player.pos.y) * deltaDistY;
		}

		let side: 0 | 1 = 0;

		// DDA loop
		while (true) {
			if (sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
				sideDistY += deltaDistY;
				mapY += stepY;
				side = 1;
			}

			if (mapX < 0 || mapX >= map.width || mapY < 0 || mapY >= map.height) break;
			if (map.tiles[mapY][mapX] > 0) break;
		}

		let wallDist: number;
		if (side === 0) {
			wallDist = sideDistX - deltaDistX;
		} else {
			wallDist = sideDistY - deltaDistY;
		}

		let wallX: number;
		if (side === 0) {
			wallX = player.pos.y + wallDist * rayDirY;
		} else {
			wallX = player.pos.x + wallDist * rayDirX;
		}
		wallX -= Math.floor(wallX);

		const texNum =
			mapX >= 0 && mapX < map.width && mapY >= 0 && mapY < map.height
				? map.tiles[mapY][mapX] - 1
				: 0;

		return { wallDist, side, mapX, mapY, wallX, texNum };
	}

	/**
	 * Render a single vertical wall stripe with texturing.
	 */
	private renderWallStripe(buf: Uint8ClampedArray, x: number, hit: RayHit): void {
		const { screenWidth, screenHeight, textureSize } = this.config;

		const lineHeight = Math.floor(screenHeight / hit.wallDist);
		let drawStart = Math.floor(-lineHeight / 2 + screenHeight / 2);
		let drawEnd = Math.floor(lineHeight / 2 + screenHeight / 2);

		if (drawStart < 0) drawStart = 0;
		if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;

		const tex = this.textures[hit.texNum];
		if (!tex) return;

		let texX = Math.floor(hit.wallX * textureSize);
		if (texX >= textureSize) texX = textureSize - 1;

		const step = textureSize / lineHeight;
		let texPos = (drawStart - screenHeight / 2 + lineHeight / 2) * step;

		for (let y = drawStart; y <= drawEnd; y++) {
			let texY = Math.floor(texPos) & (textureSize - 1);
			texPos += step;

			const texOffset = (texY * textureSize + texX) * 4;
			const bufOffset = (y * screenWidth + x) * 4;

			let r = tex[texOffset];
			let g = tex[texOffset + 1];
			let b = tex[texOffset + 2];

			// Darken y-side walls for depth effect
			if (hit.side === 1) {
				r = (r >> 1) & 0xff;
				g = (g >> 1) & 0xff;
				b = (b >> 1) & 0xff;
			}

			buf[bufOffset] = r;
			buf[bufOffset + 1] = g;
			buf[bufOffset + 2] = b;
			buf[bufOffset + 3] = 255;
		}
	}

	/**
	 * Render textured floor and ceiling using raycasting.
	 */
	private renderFloorCeiling(buf: Uint8ClampedArray, player: Player): void {
		const { screenWidth, screenHeight, textureSize } = this.config;
		const floorTex = this.textures[this.config.floorTexture];
		const ceilTex = this.textures[this.config.ceilingTexture];

		if (!floorTex || !ceilTex) return;

		for (let y = screenHeight / 2 + 1; y < screenHeight; y++) {
			// Ray direction for leftmost and rightmost column
			const rayDirX0 = player.dir.x - player.plane.x;
			const rayDirY0 = player.dir.y - player.plane.y;
			const rayDirX1 = player.dir.x + player.plane.x;
			const rayDirY1 = player.dir.y + player.plane.y;

			const p = y - screenHeight / 2;
			const rowDistance = screenHeight / (2 * p);

			const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / screenWidth;
			const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / screenWidth;

			let floorX = player.pos.x + rowDistance * rayDirX0;
			let floorY = player.pos.y + rowDistance * rayDirY0;

			for (let x = 0; x < screenWidth; x++) {
				const tx = Math.floor(floorX * textureSize) & (textureSize - 1);
				const ty = Math.floor(floorY * textureSize) & (textureSize - 1);

				floorX += floorStepX;
				floorY += floorStepY;

				const texIdx = (ty * textureSize + tx) * 4;

				// Floor
				const floorOffset = (y * screenWidth + x) * 4;
				buf[floorOffset] = floorTex[texIdx] >> 1;
				buf[floorOffset + 1] = floorTex[texIdx + 1] >> 1;
				buf[floorOffset + 2] = floorTex[texIdx + 2] >> 1;
				buf[floorOffset + 3] = 255;

				// Ceiling (mirrored)
				const ceilY = screenHeight - y - 1;
				const ceilOffset = (ceilY * screenWidth + x) * 4;
				buf[ceilOffset] = ceilTex[texIdx];
				buf[ceilOffset + 1] = ceilTex[texIdx + 1];
				buf[ceilOffset + 2] = ceilTex[texIdx + 2];
				buf[ceilOffset + 3] = 255;
			}
		}
	}

	/**
	 * Render sprites using painter's algorithm (sorted back to front).
	 */
	private renderSprites(buf: Uint8ClampedArray, player: Player, sprites: Sprite[]): void {
		const { screenWidth, screenHeight, textureSize } = this.config;

		// Calculate distances and sort
		const sorted = sprites
			.map((s, i) => ({
				sprite: s,
				dist: (player.pos.x - s.pos.x) ** 2 + (player.pos.y - s.pos.y) ** 2
			}))
			.sort((a, b) => b.dist - a.dist);

		const invDet =
			1.0 / (player.plane.x * player.dir.y - player.dir.x * player.plane.y);

		for (const { sprite } of sorted) {
			const spriteX = sprite.pos.x - player.pos.x;
			const spriteY = sprite.pos.y - player.pos.y;

			const transformX = invDet * (player.dir.y * spriteX - player.dir.x * spriteY);
			const transformY = invDet * (-player.plane.y * spriteX + player.plane.x * spriteY);

			if (transformY <= 0) continue;

			const spriteScreenX = Math.floor((screenWidth / 2) * (1 + transformX / transformY));
			const fullHeight = Math.abs(Math.floor(screenHeight / transformY));
			const spriteHeight = Math.abs(Math.floor(fullHeight * (sprite.scale ?? 1)));
			const spriteWidth = spriteHeight;

			const drawEndY = Math.floor(fullHeight / 2 + screenHeight / 2);
			let drawStartY = drawEndY - spriteHeight;
			let drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
			let drawEndX = Math.floor(spriteWidth / 2 + spriteScreenX);

			const clipStartY = Math.max(0, drawStartY);
			const clipEndY = Math.min(screenHeight - 1, drawEndY);
			const clipStartX = Math.max(0, drawStartX);
			const clipEndX = Math.min(screenWidth - 1, drawEndX);

			const tex = this.textures[sprite.texture];
			if (!tex) continue;

			for (let x = clipStartX; x <= clipEndX; x++) {
				if (transformY >= this.zBuffer[x]) continue;

				const texX =
					Math.floor(((x - drawStartX) * textureSize) / spriteWidth) & (textureSize - 1);

				for (let y = clipStartY; y <= clipEndY; y++) {
					const texY =
						Math.floor(((y - drawStartY) * textureSize) / spriteHeight) &
						(textureSize - 1);

					const texOffset = (texY * textureSize + texX) * 4;
					if (tex[texOffset + 3] === 0) continue; // skip transparent

					const bufOffset = (y * screenWidth + x) * 4;
					buf[bufOffset] = tex[texOffset];
					buf[bufOffset + 1] = tex[texOffset + 1];
					buf[bufOffset + 2] = tex[texOffset + 2];
					buf[bufOffset + 3] = 255;
				}
			}
		}
	}
}
