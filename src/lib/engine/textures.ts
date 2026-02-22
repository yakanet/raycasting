import type { AtlasManifest } from './types';
import atlasManifest from 'virtual:texture-atlas';

export async function loadAtlasTextures(size: number): Promise<Uint8ClampedArray[]> {
	const manifest = atlasManifest as AtlasManifest;
	if (!manifest.atlas || manifest.entries.length === 0) {
		throw new Error('No atlas available');
	}

	const maxSlot = manifest.entries.reduce((max, e) => Math.max(max, e.slot), 0);
	const count = maxSlot + 1;
	const textures = new Array<Uint8ClampedArray>(count);
	const purple = generateUnknownTexture(size);
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

export function generateUnknownTexture(size: number): Uint8ClampedArray {
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

export async function buildTextures(size: number): Promise<Uint8ClampedArray[]> {
	return loadAtlasTextures(size);
}
