/**
 * Generates default procedural textures as PNG files in static/textures/.
 * Run with: npx tsx scripts/generate-textures.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';

// --- Inline the constants to avoid $lib alias resolution issues ---
const TEX_COUNT = 11;
const TEX_NAMES: Record<number, string> = {
	0: 'wall_brick',
	1: 'wall_stone',
	2: 'wall_blue',
	3: 'wall_wood',
	4: 'wall_moss',
	5: 'floor',
	6: 'ceiling',
	7: 'barrel',
	8: 'pillar',
	9: 'coin',
	10: 'bomb'
};

// --- Minimal PNG encoder (RGBA → PNG) ---
function encodePNG(rgba: Uint8ClampedArray, width: number, height: number): Buffer {
	// Build raw data: for each row, prepend filter byte (0 = None)
	const rowLen = width * 4;
	const raw = Buffer.alloc((rowLen + 1) * height);
	for (let y = 0; y < height; y++) {
		raw[(rowLen + 1) * y] = 0; // filter: None
		rgba.buffer
		raw.set(rgba.subarray(y * rowLen, (y + 1) * rowLen), (rowLen + 1) * y + 1);
	}

	const compressed = deflateSync(raw);

	const chunks: Buffer[] = [];

	// Signature
	chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

	function writeChunk(type: string, data: Buffer) {
		const len = Buffer.alloc(4);
		len.writeUInt32BE(data.length);
		const typeBuffer = Buffer.from(type, 'ascii');
		const crcData = Buffer.concat([typeBuffer, data]);
		const crc = crc32(crcData);
		const crcBuf = Buffer.alloc(4);
		crcBuf.writeUInt32BE(crc >>> 0);
		chunks.push(len, typeBuffer, data, crcBuf);
	}

	// IHDR
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // color type: RGBA
	ihdr[10] = 0; // compression
	ihdr[11] = 0; // filter
	ihdr[12] = 0; // interlace
	writeChunk('IHDR', ihdr);

	// IDAT
	writeChunk('IDAT', compressed);

	// IEND
	writeChunk('IEND', Buffer.alloc(0));

	return Buffer.concat(chunks);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
	let c = n;
	for (let k = 0; k < 8; k++) {
		c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	}
	crcTable[n] = c;
}

function crc32(buf: Buffer): number {
	let crc = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

// --- Import texture generation (copy logic to avoid alias issues) ---
// We dynamically import using relative path to the compiled source
// Instead, just inline the generation call via tsx which can handle TS imports

async function main() {
	// tsx can resolve relative .ts imports
	const { generateTextures } = await import('../src/lib/engine/textures.ts');

	const size = 64;
	const textures = generateTextures(size);
	const outDir = resolve('static/textures');
	mkdirSync(outDir, { recursive: true });

	for (let i = 0; i < TEX_COUNT; i++) {
		const name = TEX_NAMES[i] ?? `tex_${i}`;
		const png = encodePNG(textures[i], size, size);
		const filePath = resolve(outDir, `${name}.png`);
		writeFileSync(filePath, png);
		console.log(`  ✓ ${name}.png (${png.length} bytes)`);
	}

	console.log(`\nGenerated ${TEX_COUNT} textures in static/textures/`);
}

main().catch(console.error);
