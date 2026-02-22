import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Player, Sprite, WorldMap, EngineConfig, TextureDef } from '$lib/engine';

export interface LevelData {
	map: WorldMap;
	sprites: Sprite[];
	player: Player;
	config: EngineConfig;
	textures: TextureDef[];
}

const LEVEL_PATH = resolve('data/level.json');

export function loadLevel(): LevelData {
	const raw = readFileSync(LEVEL_PATH, 'utf-8');
	return JSON.parse(raw) as LevelData;
}
