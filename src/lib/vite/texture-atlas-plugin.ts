import { resolve, join, basename } from 'node:path';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import type { AtlasEntry, TextureDef, GameConfig } from '../engine/types';

const CONFIG_PATH_REL = 'data/config.json';
const TEXTURES_DIR_REL = 'data/textures';
const VIRTUAL_MODULE_ID = 'virtual:texture-atlas';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_MODULE_ID;
const ATLAS_SERVE_PATH = '/@texture-atlas.png';

const TEXTURE_SIZE = 64;

interface AtlasData {
	buffer: Buffer;
	hash: string;
	entries: AtlasEntry[];
}

let currentAtlas: AtlasData | null = null;

function loadTextureDefsFromConfig(projectRoot: string): TextureDef[] {
	const configPath = resolve(projectRoot, CONFIG_PATH_REL);
	if (!existsSync(configPath)) return [];
	const raw = readFileSync(configPath, 'utf-8');
	const config = JSON.parse(raw) as GameConfig;
	return config.textures ?? [];
}

function resolveSlotFile(texturesDir: string, slot: number): string | null {
	if (!existsSync(texturesDir)) return null;
	const files = readdirSync(texturesDir);
	const match = files.find(
		(f) => f.startsWith(`tex_${slot}.`) && !f.endsWith('.json')
	);
	return match ? join(texturesDir, match) : null;
}

export async function generateAtlas(projectRoot: string): Promise<AtlasData | null> {
	const sharp = (await import('sharp')).default;
	const texturesDir = resolve(projectRoot, TEXTURES_DIR_REL);
	const textureDefs = loadTextureDefsFromConfig(projectRoot);

	if (textureDefs.length === 0) return null;

	const maxSlot = textureDefs.reduce((max, t) => Math.max(max, t.id), 0);
	const slotCount = maxSlot + 1;

	const composites: { input: Buffer; left: number; top: number }[] = [];
	const entries: AtlasEntry[] = [];

	for (const def of textureDefs) {
		const filePath = resolveSlotFile(texturesDir, def.id);
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

		composites.push({ input: pngBuf, left: def.id * TEXTURE_SIZE, top: 0 });
		entries.push({ slot: def.id, name: basename(filePath), x: def.id * TEXTURE_SIZE });
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
	console.log(`[texture-atlas] Generated atlas in memory (${composites.length} textures from config)`);
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
			const configPath = resolve(projectRoot, CONFIG_PATH_REL);

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

			// Watch texture files and config for changes
			const handleFileEvent = (filePath: string) => {
				const isTexture = filePath.startsWith(texturesDir) && /\.(png|jpe?g|webp)$/i.test(basename(filePath));
				const isConfig = filePath === configPath;
				if (!isTexture && !isConfig) return;

				console.log(`[texture-atlas] Detected change: ${basename(filePath)}`);
				rebuild().then(() => {
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
