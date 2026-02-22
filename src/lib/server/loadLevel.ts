import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDefaultMap, createDefaultSprites, DEFAULT_CONFIG } from '$lib/engine';
import type { Player, Sprite, WorldMap, EngineConfig } from '$lib/engine';

export interface LevelData {
	map: WorldMap;
	sprites: Sprite[];
	player: Player;
	config: EngineConfig;
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
		config: { ...DEFAULT_CONFIG }
	};
}

export function loadLevel(): LevelData {
	try {
		const raw = readFileSync(LEVEL_PATH, 'utf-8');
		const data = JSON.parse(raw) as LevelData;
		return data;
	} catch {
		return getDefaults();
	}
}
