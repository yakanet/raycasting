import type { Player, WorldMap, RayHit, EngineConfig, Sprite } from './types';

/**
 * Core raycasting renderer — produces a Wolfenstein 3D-style first-person view
 * by writing directly into a single ImageData pixel buffer each frame.
 *
 * Rendering pipeline (per frame):
 *   1. Floor & ceiling  — horizontal raycasting, one scanline at a time
 *   2. Walls            — one vertical DDA ray per screen column
 *   3. Sprites          — sorted back-to-front (painter's algorithm), z-buffer culled
 *
 * All textures are square RGBA bitmaps whose side length is a power of two
 * (default 64). The bitmask `& (textureSize - 1)` replaces modulo for wrapping.
 */
export class Raycaster {
	private config: EngineConfig;
	/** Flat RGBA arrays, one per texture slot (length = textureSize² × 4). */
	private textures: Uint8ClampedArray[];
	/** Fallback texture used when a slot is out of range. */
	private unknownTex: Uint8ClampedArray;
	/** Pixel buffer reused across frames; recreated when screen width changes. */
	private imageData!: ImageData;
	/** Per-column perpendicular wall distance — used to depth-cull sprites. */
	private zBuffer!: Float64Array;

	constructor(config: EngineConfig, textures: Uint8ClampedArray[]) {
		this.config = config;
		this.textures = textures;
		this.unknownTex = Raycaster.generateUnknownTexture(config.textureSize);
	}

	private static generateUnknownTexture(size: number): Uint8ClampedArray {
		const data = new Uint8ClampedArray(size * size * 4);
		const half = size / 2;
		for (let y = 0; y < size; y++) {
			for (let x = 0; x < size; x++) {
				const checker = (Math.floor(x / half) + Math.floor(y / half)) % 2 === 0;
				const i = (y * size + x) * 4;
				data[i] = checker ? 160 : 80;
				data[i + 1] = 0;
				data[i + 2] = checker ? 200 : 100;
				data[i + 3] = 255;
			}
		}
		return data;
	}

	private getTexture(index: number): Uint8ClampedArray {
		return this.textures[index] ?? this.unknownTex;
	}

	/**
	 * Main entry point — clears the buffer, renders every layer, then
	 * flushes the result to the canvas in a single putImageData call.
	 */
	render(ctx: CanvasRenderingContext2D, player: Player, map: WorldMap, sprites: Sprite[]): void {
		const { screenWidth, screenHeight } = this.config;

		// (Re)allocate buffer and z-buffer when screen dimensions change
		if (!this.imageData || this.imageData.width !== screenWidth) {
			this.imageData = ctx.createImageData(screenWidth, screenHeight);
			this.zBuffer = new Float64Array(screenWidth);
		}

		const buf = this.imageData.data;
		buf.fill(0);

		// Layer 1 — textured floor and ceiling
		this.renderFloorCeiling(buf, player);

		// Layer 2 — walls via DDA raycasting (one ray per screen column)
		for (let x = 0; x < screenWidth; x++) {
			const hit = this.castRay(x, player, map);
			this.zBuffer[x] = hit.wallDist;
			this.renderWallStripe(buf, x, hit);
		}

		// Layer 3 — billboard sprites
		this.renderSprites(buf, player, sprites);

		ctx.putImageData(this.imageData, 0, 0);
	}

	// ---------------------------------------------------------------------------
	//  Wall raycasting (DDA)
	// ---------------------------------------------------------------------------

	/**
	 * Cast a single ray for screen column `x` using the DDA (Digital Differential
	 * Analyzer) algorithm. Walks through the tile grid until a non-zero tile is
	 * hit or the ray leaves the map bounds.
	 *
	 * Returns the perpendicular wall distance (avoids fisheye), which side of the
	 * wall was hit (0 = X-side, 1 = Y-side), and the exact texture coordinate.
	 */
	private castRay(x: number, player: Player, map: WorldMap): RayHit {
		const { screenWidth } = this.config;

		// Map screen column to camera-space X in [-1, 1]
		const cameraX = (2 * x) / screenWidth - 1;

		// Ray direction = forward direction + camera plane scaled by cameraX
		const rayDirX = player.dir.x + player.plane.x * cameraX;
		const rayDirY = player.dir.y + player.plane.y * cameraX;

		// Current tile coordinates
		let mapX = Math.floor(player.pos.x);
		let mapY = Math.floor(player.pos.y);

		// Distance the ray must travel to cross one full tile in each axis
		const deltaDistX = Math.abs(1 / rayDirX);
		const deltaDistY = Math.abs(1 / rayDirY);

		// Step direction (+1 or -1) and initial side-distance for each axis
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

		// 0 = last step was along X axis, 1 = along Y axis
		let side: 0 | 1 = 0;

		// DDA loop — advance to the next tile boundary on whichever axis is closer
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

		// Perpendicular distance (not Euclidean) to avoid fisheye distortion
		let wallDist: number;
		if (side === 0) {
			wallDist = sideDistX - deltaDistX;
		} else {
			wallDist = sideDistY - deltaDistY;
		}

		// Exact hit position along the wall surface, in [0, 1) — used as texture U
		let wallX: number;
		if (side === 0) {
			wallX = player.pos.y + wallDist * rayDirY;
		} else {
			wallX = player.pos.x + wallDist * rayDirX;
		}
		wallX -= Math.floor(wallX);

		// Tile value is 1-based; texture index is 0-based
		const texNum =
			mapX >= 0 && mapX < map.width && mapY >= 0 && mapY < map.height
				? map.tiles[mapY][mapX] - 1
				: 0;

		return { wallDist, side, mapX, mapY, wallX, texNum };
	}

	// ---------------------------------------------------------------------------
	//  Wall stripe rendering
	// ---------------------------------------------------------------------------

	/**
	 * Draw a single vertical stripe of a textured wall for screen column `x`.
	 * Y-side walls are darkened by 50 % (right-shift by 1) to simulate directional
	 * lighting and improve depth perception.
	 */
	private renderWallStripe(buf: Uint8ClampedArray, x: number, hit: RayHit): void {
		const { screenWidth, screenHeight, textureSize } = this.config;

		// Projected wall height in pixels
		const lineHeight = Math.floor(screenHeight / hit.wallDist);
		let drawStart = Math.floor(-lineHeight / 2 + screenHeight / 2);
		let drawEnd = Math.floor(lineHeight / 2 + screenHeight / 2);

		// Clamp to screen bounds
		if (drawStart < 0) drawStart = 0;
		if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;

		const tex = this.getTexture(hit.texNum);

		// Texture X coordinate from the fractional wall hit position
		let texX = Math.floor(hit.wallX * textureSize);
		if (texX >= textureSize) texX = textureSize - 1;

		// How much to advance in the texture per screen pixel
		const step = textureSize / lineHeight;
		let texPos = (drawStart - screenHeight / 2 + lineHeight / 2) * step;

		for (let y = drawStart; y <= drawEnd; y++) {
			// Bitmask wrap instead of modulo (requires power-of-2 texture size)
			let texY = Math.floor(texPos) & (textureSize - 1);
			texPos += step;

			const texOffset = (texY * textureSize + texX) * 4;
			const bufOffset = (y * screenWidth + x) * 4;

			let r = tex[texOffset];
			let g = tex[texOffset + 1];
			let b = tex[texOffset + 2];

			// Darken Y-side walls by halving RGB (>> 1) for pseudo-lighting
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

	// ---------------------------------------------------------------------------
	//  Floor & ceiling rendering
	// ---------------------------------------------------------------------------

	/**
	 * Render textured floor and ceiling using horizontal raycasting.
	 *
	 * For each scanline below the horizon (floor), we compute the world-space
	 * row distance, then step across columns. The ceiling is the vertically
	 * mirrored counterpart. Floor pixels are darkened by 50 % (>> 1) to
	 * distinguish them from walls.
	 */
	private static parseColor(hex: string): [number, number, number] {
		const c = parseInt(hex.replace('#', ''), 16);
		return [(c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff];
	}

	private renderFloorCeiling(buf: Uint8ClampedArray, player: Player): void {
		const { screenWidth, screenHeight, textureSize, floorColor, ceilingColor } = this.config;
		const floorTex = this.config.floorTexture > 0 ? this.getTexture(this.config.floorTexture - 1) : null;
		const ceilTex = this.config.ceilingTexture > 0 ? this.getTexture(this.config.ceilingTexture - 1) : null;

		// Fill with solid colors first (visible where no texture is applied)
		const [fr, fg, fb] = Raycaster.parseColor(floorColor);
		const [cr, cg, cb] = Raycaster.parseColor(ceilingColor);
		const halfH = Math.floor(screenHeight / 2);
		for (let y = 0; y < screenHeight; y++) {
			const isFloor = y > halfH;
			const r = isFloor ? fr : cr;
			const g = isFloor ? fg : cg;
			const b = isFloor ? fb : cb;
			for (let x = 0; x < screenWidth; x++) {
				const off = (y * screenWidth + x) * 4;
				buf[off] = r;
				buf[off + 1] = g;
				buf[off + 2] = b;
				buf[off + 3] = 255;
			}
		}

		if (!floorTex && !ceilTex) return;

		for (let y = screenHeight / 2 + 1; y < screenHeight; y++) {
			// Ray direction at the leftmost and rightmost screen columns
			const rayDirX0 = player.dir.x - player.plane.x;
			const rayDirY0 = player.dir.y - player.plane.y;
			const rayDirX1 = player.dir.x + player.plane.x;
			const rayDirY1 = player.dir.y + player.plane.y;

			// Vertical position relative to the horizon (center of the screen)
			const p = y - screenHeight / 2;
			// Horizontal distance from the camera to this floor row
			const rowDistance = screenHeight / (2 * p);

			// World-space step per screen column for this row
			const floorStepX = (rowDistance * (rayDirX1 - rayDirX0)) / screenWidth;
			const floorStepY = (rowDistance * (rayDirY1 - rayDirY0)) / screenWidth;

			// World-space position of the leftmost pixel in this row
			let floorX = player.pos.x + rowDistance * rayDirX0;
			let floorY = player.pos.y + rowDistance * rayDirY0;

			for (let x = 0; x < screenWidth; x++) {
				// Bitmask wrap the texture coordinates
				const tx = Math.floor(floorX * textureSize) & (textureSize - 1);
				const ty = Math.floor(floorY * textureSize) & (textureSize - 1);

				floorX += floorStepX;
				floorY += floorStepY;

				const texIdx = (ty * textureSize + tx) * 4;

				// Floor pixel (darkened by 50 %)
				if (floorTex) {
					const floorOffset = (y * screenWidth + x) * 4;
					buf[floorOffset] = floorTex[texIdx] >> 1;
					buf[floorOffset + 1] = floorTex[texIdx + 1] >> 1;
					buf[floorOffset + 2] = floorTex[texIdx + 2] >> 1;
					buf[floorOffset + 3] = 255;
				}

				// Ceiling pixel (vertically mirrored, full brightness)
				if (ceilTex) {
					const ceilY = screenHeight - y - 1;
					const ceilOffset = (ceilY * screenWidth + x) * 4;
					buf[ceilOffset] = ceilTex[texIdx];
					buf[ceilOffset + 1] = ceilTex[texIdx + 1];
					buf[ceilOffset + 2] = ceilTex[texIdx + 2];
					buf[ceilOffset + 3] = 255;
				}
			}
		}
	}

	// ---------------------------------------------------------------------------
	//  Sprite rendering
	// ---------------------------------------------------------------------------

	/**
	 * Render all sprites as camera-facing billboards.
	 *
	 * Steps:
	 *   1. Sort sprites by squared distance (farthest first — painter's algorithm).
	 *   2. For each sprite, project its position into screen space using the
	 *      inverse camera matrix.
	 *   3. Draw textured columns, skipping pixels that are behind a wall
	 *      (z-buffer comparison) or that have alpha = 0 (transparent).
	 *
	 * Sprite scale is applied to height only; width matches height (square).
	 * The vertical anchor stays at the bottom of the un-scaled projection so
	 * that scaled sprites "grow upward" from the ground.
	 */
	private renderSprites(buf: Uint8ClampedArray, player: Player, sprites: Sprite[]): void {
		const { screenWidth, screenHeight, textureSize } = this.config;

		// Sort by distance, farthest first, so closer sprites overwrite farther ones
		const sorted = sprites
			.map((s, i) => ({
				sprite: s,
				dist: (player.pos.x - s.pos.x) ** 2 + (player.pos.y - s.pos.y) ** 2
			}))
			.sort((a, b) => b.dist - a.dist);

		// Inverse of the 2×2 camera matrix [plane.x dir.x ; plane.y dir.y]
		// Used to transform sprite positions from world space to camera space
		const invDet =
			1.0 / (player.plane.x * player.dir.y - player.dir.x * player.plane.y);

		for (const { sprite } of sorted) {
			// Sprite position relative to the camera
			const spriteX = sprite.pos.x - player.pos.x;
			const spriteY = sprite.pos.y - player.pos.y;

			// Transform to camera space:
			//   transformX = lateral offset (left/right on screen)
			//   transformY = depth (distance along the view direction)
			const transformX = invDet * (player.dir.y * spriteX - player.dir.x * spriteY);
			const transformY = invDet * (-player.plane.y * spriteX + player.plane.x * spriteY);

			// Skip sprites behind the camera
			if (transformY <= 0) continue;

			// Screen X position of the sprite center
			const spriteScreenX = Math.floor((screenWidth / 2) * (1 + transformX / transformY));

			// Full (unscaled) projected size, and then apply per-sprite scale
			const fullHeight = Math.abs(Math.floor(screenHeight / transformY));
			const spriteHeight = Math.abs(Math.floor(fullHeight * (sprite.scale ?? 1)));
			const spriteWidth = spriteHeight;

			// Vertical draw range — anchored at the bottom of the full projection
			const drawEndY = Math.floor(fullHeight / 2 + screenHeight / 2);
			let drawStartY = drawEndY - spriteHeight;

			// Horizontal draw range — centered on spriteScreenX
			let drawStartX = Math.floor(-spriteWidth / 2 + spriteScreenX);
			let drawEndX = Math.floor(spriteWidth / 2 + spriteScreenX);

			// Clip to screen boundaries
			const clipStartY = Math.max(0, drawStartY);
			const clipEndY = Math.min(screenHeight - 1, drawEndY);
			const clipStartX = Math.max(0, drawStartX);
			const clipEndX = Math.min(screenWidth - 1, drawEndX);

			const tex = this.getTexture(sprite.texture);

			for (let x = clipStartX; x <= clipEndX; x++) {
				// Z-buffer test: skip columns where a wall is closer
				if (transformY >= this.zBuffer[x]) continue;

				const texX =
					Math.floor(((x - drawStartX) * textureSize) / spriteWidth) & (textureSize - 1);

				for (let y = clipStartY; y <= clipEndY; y++) {
					const texY =
						Math.floor(((y - drawStartY) * textureSize) / spriteHeight) &
						(textureSize - 1);

					const texOffset = (texY * textureSize + texX) * 4;
					// Alpha = 0 means transparent — skip this pixel
					if (tex[texOffset + 3] === 0) continue;

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
