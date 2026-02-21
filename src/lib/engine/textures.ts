/**
 * Generate procedural textures for walls, floor, ceiling, and sprites.
 * Each texture is a Uint8ClampedArray of RGBA pixels (size x size x 4).
 */
export function generateTextures(size: number): Uint8ClampedArray[] {
	const textures: Uint8ClampedArray[] = [];

	// Texture 0: Red brick wall
	textures.push(generateBrickTexture(size, [180, 50, 40], [120, 30, 25]));

	// Texture 1: Grey stone wall
	textures.push(generateStoneTexture(size, [140, 140, 140], [100, 100, 100]));

	// Texture 2: Blue wall with stripe
	textures.push(generateStripeTexture(size, [50, 60, 150], [30, 40, 100]));

	// Texture 3: Wood planks
	textures.push(generateWoodTexture(size, [160, 110, 60], [120, 80, 40]));

	// Texture 4: Mossy stone
	textures.push(generateStoneTexture(size, [80, 130, 80], [60, 100, 60]));

	// Texture 5: Floor texture (stone tiles)
	textures.push(generateTileTexture(size, [100, 100, 110], [80, 80, 90]));

	// Texture 6: Ceiling texture (panels)
	textures.push(generateTileTexture(size, [70, 70, 90], [55, 55, 75]));

	// Texture 7: Sprite - barrel
	textures.push(generateBarrelSprite(size));

	// Texture 8: Sprite - pillar
	textures.push(generatePillarSprite(size));

	return textures;
}

function generateBrickTexture(
	size: number,
	color1: number[],
	color2: number[]
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const brickH = size / 8;
	const brickW = size / 4;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const row = Math.floor(y / brickH);
			const offset = row % 2 === 0 ? 0 : brickW / 2;
			const bx = (x + offset) % brickW;
			const by = y % brickH;

			const isMortar = bx < 1 || by < 1;
			const noise = (Math.random() * 20 - 10) | 0;
			const c = isMortar ? [80, 80, 80] : color1;
			const shade = isMortar ? 0 : noise;

			const i = (y * size + x) * 4;
			data[i] = Math.max(0, Math.min(255, c[0] + shade));
			data[i + 1] = Math.max(0, Math.min(255, c[1] + shade));
			data[i + 2] = Math.max(0, Math.min(255, c[2] + shade));
			data[i + 3] = 255;
		}
	}
	// Add some darker patches
	for (let k = 0; k < size * 2; k++) {
		const px = (Math.random() * size) | 0;
		const py = (Math.random() * size) | 0;
		const i = (py * size + px) * 4;
		data[i] = Math.max(0, data[i] - 30);
		data[i + 1] = Math.max(0, data[i + 1] - 30);
		data[i + 2] = Math.max(0, data[i + 2] - 30);
	}
	return data;
}

function generateStoneTexture(
	size: number,
	color1: number[],
	color2: number[]
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const noise = (Math.random() * 30 - 15) | 0;
			const t = ((x ^ y) * 7 + x * 3 + y * 5) % 256;
			const blend = t / 256;
			const i = (y * size + x) * 4;
			data[i] = Math.max(0, Math.min(255, (color1[0] * (1 - blend) + color2[0] * blend + noise) | 0));
			data[i + 1] = Math.max(
				0,
				Math.min(255, (color1[1] * (1 - blend) + color2[1] * blend + noise) | 0)
			);
			data[i + 2] = Math.max(
				0,
				Math.min(255, (color1[2] * (1 - blend) + color2[2] * blend + noise) | 0)
			);
			data[i + 3] = 255;
		}
	}
	return data;
}

function generateStripeTexture(
	size: number,
	color1: number[],
	color2: number[]
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const stripe = y > size * 0.4 && y < size * 0.6;
			const noise = (Math.random() * 10 - 5) | 0;
			const c = stripe ? [200, 200, 60] : color1;
			const i = (y * size + x) * 4;
			data[i] = Math.max(0, Math.min(255, c[0] + noise));
			data[i + 1] = Math.max(0, Math.min(255, c[1] + noise));
			data[i + 2] = Math.max(0, Math.min(255, c[2] + noise));
			data[i + 3] = 255;
		}
	}
	return data;
}

function generateWoodTexture(
	size: number,
	color1: number[],
	color2: number[]
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const plankW = size / 4;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const plank = Math.floor(x / plankW);
			const edge = x % plankW < 1;
			const grain = (Math.sin(y * 0.5 + plank * 10) * 15) | 0;
			const noise = (Math.random() * 10 - 5) | 0;
			const c = edge ? [60, 40, 20] : color1;
			const i = (y * size + x) * 4;
			data[i] = Math.max(0, Math.min(255, c[0] + grain + noise));
			data[i + 1] = Math.max(0, Math.min(255, c[1] + grain + noise));
			data[i + 2] = Math.max(0, Math.min(255, c[2] + noise));
			data[i + 3] = 255;
		}
	}
	return data;
}

function generateTileTexture(
	size: number,
	color1: number[],
	color2: number[]
): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const tileSize = size / 4;
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const tx = x % tileSize;
			const ty = y % tileSize;
			const isGrout = tx < 1 || ty < 1;
			const noise = (Math.random() * 12 - 6) | 0;
			const c = isGrout ? color2 : color1;
			const i = (y * size + x) * 4;
			data[i] = Math.max(0, Math.min(255, c[0] + noise));
			data[i + 1] = Math.max(0, Math.min(255, c[1] + noise));
			data[i + 2] = Math.max(0, Math.min(255, c[2] + noise));
			data[i + 3] = 255;
		}
	}
	return data;
}

function generateBarrelSprite(size: number): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const cx = size / 2;
	const cy = size / 2;
	const rx = size * 0.3;
	const ry = size * 0.45;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = (x - cx) / rx;
			const dy = (y - cy) / ry;
			const i = (y * size + x) * 4;

			if (dx * dx + dy * dy <= 1) {
				const isRim = Math.abs(dy) > 0.85 || (Math.abs(dy) > 0.3 && Math.abs(dy) < 0.35);
				const shade = (1 - dx * dx * 0.5) * 255;
				const noise = (Math.random() * 10 - 5) | 0;

				if (isRim) {
					data[i] = Math.min(255, (80 + noise) | 0);
					data[i + 1] = Math.min(255, (80 + noise) | 0);
					data[i + 2] = Math.min(255, (80 + noise) | 0);
				} else {
					data[i] = Math.min(255, ((shade * 0.55 + noise) | 0));
					data[i + 1] = Math.min(255, ((shade * 0.35 + noise) | 0));
					data[i + 2] = Math.min(255, ((shade * 0.15 + noise) | 0));
				}
				data[i + 3] = 255;
			} else {
				data[i + 3] = 0; // transparent
			}
		}
	}
	return data;
}

function generatePillarSprite(size: number): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const cx = size / 2;
	const halfW = size * 0.15;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = Math.abs(x - cx);
			const i = (y * size + x) * 4;

			// Wider at top and bottom (capital/base)
			const isCapital = y < size * 0.1 || y > size * 0.9;
			const w = isCapital ? halfW * 1.4 : halfW;

			if (dx <= w) {
				const shade = (1 - (dx / w) * 0.4) * 200;
				const noise = (Math.random() * 8 - 4) | 0;
				data[i] = Math.min(255, (shade + noise) | 0);
				data[i + 1] = Math.min(255, (shade + noise) | 0);
				data[i + 2] = Math.min(255, (shade * 0.9 + noise) | 0);
				data[i + 3] = 255;
			} else {
				data[i + 3] = 0;
			}
		}
	}
	return data;
}
