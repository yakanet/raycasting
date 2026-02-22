import { resolve, join, basename } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import type { AtlasEntry } from '../engine/types';

const TEXTURES_DIR_REL = 'static/textures';
const VIRTUAL_MODULE_ID = 'virtual:texture-atlas';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_MODULE_ID;
const ATLAS_SERVE_PATH = '/@texture-atlas.png';

const DEFAULT_SLOT_FILES: Record<number, string> = {
	0: 'wall_brick.png',
	1: 'wall_stone.png',
	2: 'wall_blue.png',
	3: 'wall_wood.png',
	4: 'wall_moss.png',
	5: 'floor.png',
	6: 'ceiling.png',
	7: 'barrel.png',
	8: 'pillar.png',
	9: 'coin.png',
	10: 'bomb.png'
};

const TEXTURE_SIZE = 64;
const DEFAULT_SLOT_COUNT = 11;

function detectSlotCount(texturesDir: string): number {
	if (!existsSync(texturesDir)) return DEFAULT_SLOT_COUNT;
	const files = readdirSync(texturesDir);
	let maxSlot = DEFAULT_SLOT_COUNT - 1; // at least 0..10
	for (const f of files) {
		const match = f.match(/^tex_(\d+)\./);
		if (match) {
			const slot = Number(match[1]);
			if (slot > maxSlot) maxSlot = slot;
		}
	}
	return maxSlot + 1;
}

interface AtlasData {
	buffer: Buffer;
	hash: string;
	entries: AtlasEntry[];
}

let currentAtlas: AtlasData | null = null;

function resolveSlotFile(texturesDir: string, slot: number): string | null {
	const files = readdirSync(texturesDir);
	const customFile = files.find(
		(f) => f.startsWith(`tex_${slot}.`) && !f.endsWith('.json')
	);
	if (customFile) {
		return join(texturesDir, customFile);
	}
	const defaultName = DEFAULT_SLOT_FILES[slot];
	if (defaultName) {
		const defaultPath = join(texturesDir, defaultName);
		if (existsSync(defaultPath)) {
			return defaultPath;
		}
	}
	return null;
}

export async function generateAtlas(projectRoot: string): Promise<AtlasData | null> {
	const sharp = (await import('sharp')).default;
	const texturesDir = resolve(projectRoot, TEXTURES_DIR_REL);

	if (!existsSync(texturesDir)) {
		return null;
	}

	const slotCount = detectSlotCount(texturesDir);
	const composites: { input: Buffer; left: number; top: number }[] = [];
	const entries: AtlasEntry[] = [];

	for (let slot = 0; slot < slotCount; slot++) {
		const filePath = resolveSlotFile(texturesDir, slot);
		if (!filePath) continue;

		const buf = await readFile(filePath);
		const resized = await sharp(buf)
			.resize(TEXTURE_SIZE, TEXTURE_SIZE, { fit: 'fill' })
			.ensureAlpha()
			.raw()
			.toBuffer();

		const pngBuf = await sharp(resized, {
			raw: { width: TEXTURE_SIZE, height: TEXTURE_SIZE, channels: 4 }
		})
			.png()
			.toBuffer();

		composites.push({ input: pngBuf, left: slot * TEXTURE_SIZE, top: 0 });
		entries.push({ slot, name: basename(filePath), x: slot * TEXTURE_SIZE });
	}

	if (composites.length === 0) return null;

	const atlasWidth = slotCount * TEXTURE_SIZE;
	const buffer = await sharp({
		create: {
			width: atlasWidth,
			height: TEXTURE_SIZE,
			channels: 4,
			background: { r: 0, g: 0, b: 0, alpha: 0 }
		}
	})
		.composite(composites)
		.png()
		.toBuffer();

	const hash = createHash('md5').update(buffer).digest('hex').slice(0, 8);

	currentAtlas = { buffer, hash, entries };
	console.log(`[texture-atlas] Generated atlas in memory (${composites.length} textures)`);
	return currentAtlas;
}

export function textureAtlasPlugin(): Plugin {
	let projectRoot: string;
	let generating = false;
	let isBuild = false;
	let assetRefId: string | undefined;

	async function rebuild() {
		if (generating) return;
		generating = true;
		try {
			await generateAtlas(projectRoot);
		} catch (e) {
			console.error('[texture-atlas] Error generating atlas:', e);
		} finally {
			generating = false;
		}
	}

	return {
		name: 'texture-atlas',
		enforce: 'pre',

		configResolved(config) {
			projectRoot = config.root;
			isBuild = config.command === 'build';
		},

		async buildStart() {
			await rebuild();
			// In build mode, emit the atlas PNG as an asset
			if (isBuild && currentAtlas) {
				assetRefId = this.emitFile({
					type: 'asset',
					name: 'atlas.png',
					source: currentAtlas.buffer
				});
			}
		},

		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_ID;
			}
		},

		load(id) {
			if (id !== RESOLVED_VIRTUAL_ID) return;
			if (!currentAtlas) {
				// No atlas available — export empty manifest
				return `export default { atlas: null, textureSize: ${TEXTURE_SIZE}, entries: [] };`;
			}

			let atlasUrl: string;
			if (isBuild && assetRefId) {
				// Use Rollup's file reference for the emitted asset
				atlasUrl = `import.meta.ROLLUP_FILE_URL_${assetRefId}`;
				return [
					`const atlas = ${atlasUrl};`,
					`export default {`,
					`  atlas,`,
					`  textureSize: ${TEXTURE_SIZE},`,
					`  entries: ${JSON.stringify(currentAtlas.entries)}`,
					`};`
				].join('\n');
			} else {
				// Dev mode — served via middleware
				atlasUrl = `${ATLAS_SERVE_PATH}?v=${currentAtlas.hash}`;
				return [
					`export default {`,
					`  atlas: ${JSON.stringify(atlasUrl)},`,
					`  textureSize: ${TEXTURE_SIZE},`,
					`  entries: ${JSON.stringify(currentAtlas.entries)}`,
					`};`
				].join('\n');
			}
		},

		configureServer(server) {
			const texturesDir = resolve(projectRoot, TEXTURES_DIR_REL);

			// Serve the atlas PNG from memory
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith(ATLAS_SERVE_PATH) && currentAtlas) {
					res.setHeader('Content-Type', 'image/png');
					res.setHeader('Cache-Control', 'no-cache');
					res.end(currentAtlas.buffer);
					return;
				}
				next();
			});

			// Watch texture source files and regenerate
			const handleFileEvent = (filePath: string) => {
				if (!filePath.startsWith(texturesDir)) return;
				const name = basename(filePath);
				// Ignore non-texture files
				if (!name.match(/\.(png|jpe?g|webp)$/i)) return;
				console.log(`[texture-atlas] Detected change: ${name}`);
				rebuild().then(() => {
					// Invalidate the virtual module so the client gets fresh data
					const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
					if (mod) {
						server.moduleGraph.invalidateModule(mod);
						server.ws.send({ type: 'full-reload' });
					}
				});
			};

			server.watcher.on('change', handleFileEvent);
			server.watcher.on('add', handleFileEvent);
		}
	};
}
