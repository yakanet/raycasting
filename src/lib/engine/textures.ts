import {
	TEX_WALL_BRICK, TEX_WALL_STONE, TEX_WALL_BLUE, TEX_WALL_WOOD, TEX_WALL_MOSS,
	TEX_FLOOR, TEX_CEILING,
	TEX_BARREL, TEX_PILLAR, TEX_COIN, TEX_BOMB,
	TEX_COUNT
} from './types';
import type { TextureDef, AtlasManifest } from './types';
import atlasManifest from 'virtual:texture-atlas';

/**
 * Generate procedural textures for walls, floor, ceiling, and sprites.
 * Each texture is a Uint8ClampedArray of RGBA pixels (size x size x 4).
 * Textures are assigned by constant index so the order here doesn't matter.
 */
export function generateTextures(size: number): Uint8ClampedArray[] {
	const textures = new Array<Uint8ClampedArray>(TEX_COUNT);

	// Walls
	textures[TEX_WALL_BRICK] = generateBrickTexture(size, [180, 50, 40], [120, 30, 25]);
	textures[TEX_WALL_STONE] = generateStoneTexture(size, [140, 140, 140], [100, 100, 100]);
	textures[TEX_WALL_BLUE] = generateStripeTexture(size, [50, 60, 150], [30, 40, 100]);
	textures[TEX_WALL_WOOD] = generateWoodTexture(size, [160, 110, 60], [120, 80, 40]);
	textures[TEX_WALL_MOSS] = generateStoneTexture(size, [80, 130, 80], [60, 100, 60]);

	// Floor & ceiling
	textures[TEX_FLOOR] = generateTileTexture(size, [100, 100, 110], [80, 80, 90]);
	textures[TEX_CEILING] = generateTileTexture(size, [70, 70, 90], [55, 55, 75]);

	// Sprites
	textures[TEX_BARREL] = generateBarrelSprite(size);
	textures[TEX_PILLAR] = generatePillarSprite(size);
	textures[TEX_COIN] = generateCoinSprite(size);
	textures[TEX_BOMB] = generateBombSprite(size);

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

function generateCoinSprite(size: number): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const cx = size / 2;
	const cy = size / 2;
	const r = size * 0.2;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = x - cx;
			const dy = y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const i = (y * size + x) * 4;

			if (dist <= r) {
				const shine = (1 - (dx * dx + dy * dy) / (r * r)) * 0.4 + 0.6;
				const noise = (Math.random() * 10 - 5) | 0;
				data[i] = Math.min(255, ((255 * shine + noise) | 0));
				data[i + 1] = Math.min(255, ((210 * shine + noise) | 0));
				data[i + 2] = Math.min(255, ((40 * shine + noise) | 0));
				data[i + 3] = 255;
			} else {
				data[i + 3] = 0;
			}
		}
	}
	return data;
}

function generateBombSprite(size: number): Uint8ClampedArray {
	const data = new Uint8ClampedArray(size * size * 4);
	const cx = size / 2;
	const cy = size * 0.55;
	const r = size * 0.3;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = x - cx;
			const dy = y - cy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			const i = (y * size + x) * 4;

			if (dist <= r) {
				const shine = (1 - dist / r) * 0.5;
				const noise = (Math.random() * 6 - 3) | 0;
				const base = (40 * shine + 15 + noise) | 0;
				data[i] = Math.max(0, Math.min(255, base));
				data[i + 1] = Math.max(0, Math.min(255, base));
				data[i + 2] = Math.max(0, Math.min(255, base + 5));
				data[i + 3] = 255;
			} else {
				const fuseBaseY = cy - r;
				const fuseX = cx + (fuseBaseY - y) * 0.3;
				if (y < fuseBaseY && y > fuseBaseY - size * 0.15 && Math.abs(x - fuseX) < 1.5) {
					data[i] = 200;
					data[i + 1] = 120;
					data[i + 2] = 30;
					data[i + 3] = 255;
				} else if (
					y < fuseBaseY - size * 0.12 &&
					y > fuseBaseY - size * 0.2 &&
					Math.abs(x - fuseX) < 3
				) {
					const sparkNoise = (Math.random() * 30) | 0;
					data[i] = 255;
					data[i + 1] = 200 + sparkNoise;
					data[i + 2] = 50 + sparkNoise;
					data[i + 3] = 255;
				} else {
					data[i + 3] = 0;
				}
			}
		}
	}
	return data;
}

export function loadImageAsTexture(url: string, targetSize: number): Promise<Uint8ClampedArray> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = targetSize;
			canvas.height = targetSize;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0, targetSize, targetSize);
			resolve(ctx.getImageData(0, 0, targetSize, targetSize).data);
		};
		img.onerror = () => reject(new Error(`Failed to load texture image: ${url}`));
		img.src = url;
	});
}

export async function loadAtlasTextures(size: number): Promise<Uint8ClampedArray[]> {
	const manifest = atlasManifest as AtlasManifest;
	if (!manifest.atlas || manifest.entries.length === 0) {
		throw new Error('No atlas available');
	}

	const maxSlot = manifest.entries.reduce((max, e) => Math.max(max, e.slot), 0);
	const count = Math.max(TEX_COUNT, maxSlot + 1);
	const textures = new Array<Uint8ClampedArray>(count);
	const purple = generatePurpleTexture(size);
	for (let i = 0; i < count; i++) {
		textures[i] = purple;
	}

	// Load the single atlas image
	const img = await new Promise<HTMLImageElement>((resolve, reject) => {
		const el = new Image();
		el.crossOrigin = 'anonymous';
		el.onload = () => resolve(el);
		el.onerror = () => reject(new Error(`Failed to load atlas image: ${manifest.atlas}`));
		el.src = manifest.atlas;
	});

	// Draw atlas onto a temporary canvas
	const canvas = document.createElement('canvas');
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0);

	const atlasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const atlasPixels = atlasData.data;
	const atlasWidth = canvas.width;

	// Extract each texture from the atlas strip
	for (const entry of manifest.entries) {
		const tex = new Uint8ClampedArray(size * size * 4);
		for (let y = 0; y < size; y++) {
			const srcOffset = (y * atlasWidth + entry.x) * 4;
			const dstOffset = y * size * 4;
			tex.set(atlasPixels.subarray(srcOffset, srcOffset + size * 4), dstOffset);
		}
		textures[entry.slot] = tex;
	}

	return textures;
}

function generatePurpleTexture(size: number): Uint8ClampedArray {
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

export async function buildTextures(
	size: number,
	textureDefs: TextureDef[] = []
): Promise<Uint8ClampedArray[]> {
	// Try atlas loading first (single HTTP request)
	try {
		const atlasTextures = await loadAtlasTextures(size);
		console.log('[textures] Loaded from atlas');
		return atlasTextures;
	} catch (e) {
		console.warn('[textures] Atlas loading failed, falling back to individual images', e);
	}

	// Fallback: load individual images
	const entries = textureDefs.filter((t) => t.path);

	const maxSlot = entries.reduce((max, t) => Math.max(max, t.id), 0);
	const count = Math.max(TEX_COUNT, maxSlot + 1);
	const textures = new Array<Uint8ClampedArray>(count);
	const purple = generatePurpleTexture(size);

	// Pre-fill all slots with purple fallback
	for (let i = 0; i < count; i++) {
		textures[i] = purple;
	}

	await Promise.all(
		entries.map(async (tex) => {
			try {
				textures[tex.id] = await loadImageAsTexture(tex.path, size);
			} catch (e) {
				console.warn(`Texture slot ${tex.id}: falling back to purple`, e);
			}
		})
	);

	return textures;
}
