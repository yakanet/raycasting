import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDefaultMap, createDefaultSprites, DEFAULT_CONFIG, DEFAULT_TEXTURE_IMAGES } from '$lib/engine';
import type { Player, Sprite, WorldMap, EngineConfig, TextureImageMap } from '$lib/engine';

export interface LevelData {
	map: WorldMap;
	sprites: Sprite[];
	player: Player;
	config: EngineConfig;
	textureImages: TextureImageMap;
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
		textureImages: { ...DEFAULT_TEXTURE_IMAGES }
	};
}

export function loadLevel(): LevelData {
	try {
		const raw = readFileSync(LEVEL_PATH, 'utf-8');
		const data = JSON.parse(raw) as Partial<LevelData>;
		const defaults = getDefaults();
		return {
			map: data.map ?? defaults.map,
			sprites: data.sprites ?? defaults.sprites,
			player: data.player ?? defaults.player,
			config: data.config ?? defaults.config,
			textureImages: { ...DEFAULT_TEXTURE_IMAGES, ...data.textureImages }
		};
	} catch {
		return getDefaults();
	}
}
