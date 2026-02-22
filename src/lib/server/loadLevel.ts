import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDefaultMap, createDefaultSprites, DEFAULT_CONFIG, DEFAULT_TEXTURES } from '$lib/engine';
import type { Player, Sprite, WorldMap, EngineConfig, TextureDef } from '$lib/engine';

export interface LevelData {
	map: WorldMap;
	sprites: Sprite[];
	player: Player;
	config: EngineConfig;
	textures: TextureDef[];
}

const LEVEL_PATH = resolve('data/level.json');

function getDefaults(): LevelData {
	return {
		map: createDefaultMap(),
		sprites: createDefaultSprites(),
		player: {
			pos: { x: 2, y: 2 },
			dir: { x: 1, y: 0 },
			plane: { x: 0, y: 0.66 }
		},
		config: { ...DEFAULT_CONFIG },
		textures: structuredClone(DEFAULT_TEXTURES)
	};
}

interface LegacyLevelData {
	textureImages?: Partial<Record<number, string>>;
	textureNames?: Record<number, string>;
	customTextureNames?: Record<number, string>;
}

function migrateTextures(raw: LegacyLevelData): TextureDef[] {
	const names = raw.textureNames ?? raw.customTextureNames ?? {};
	const images = raw.textureImages ?? {};
	const allSlots = new Set([
		...Object.keys(names).map(Number),
		...Object.keys(images).map(Number)
	]);
	return [...allSlots]
		.sort((a, b) => a - b)
		.map((id) => ({
			id,
			name: names[id] ?? `Slot ${id}`,
			path: images[id] ?? ''
		}));
}

export function loadLevel(): LevelData {
	try {
		const raw = readFileSync(LEVEL_PATH, 'utf-8');
		const data = JSON.parse(raw) as Partial<LevelData> & LegacyLevelData;
		const defaults = getDefaults();

		let textures: TextureDef[];
		if (data.textures) {
			textures = data.textures;
		} else if (data.textureImages || data.textureNames || data.customTextureNames) {
			textures = migrateTextures(data);
		} else {
			textures = defaults.textures;
		}

		return {
			map: data.map ?? defaults.map,
			sprites: data.sprites ?? defaults.sprites,
			player: data.player ?? defaults.player,
			config: data.config ?? defaults.config,
			textures
		};
	} catch {
		return getDefaults();
	}
}
