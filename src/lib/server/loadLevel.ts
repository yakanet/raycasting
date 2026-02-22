import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { DEFAULT_LEVEL_ID } from '$lib/engine';
import type {
	GlobalConfig,
	EnvironmentConfig,
	EngineConfig,
	GameConfig,
	LevelContent
} from '$lib/engine';

export interface LevelListEntry {
	id: string;
	name: string;
}

const CONFIG_PATH = resolve('data/config.json');
const LEVELS_DIR = resolve('data/levels');

export function loadGameConfig(): GameConfig {
	if (!existsSync(CONFIG_PATH)) {
		return {
			config: {
				screenWidth: 640,
				screenHeight: 480,
				textureSize: 64,
				moveSpeed: 0.05,
				rotSpeed: 0.03
			},
			textures: []
		};
	}
	const raw = readFileSync(CONFIG_PATH, 'utf-8');
	return JSON.parse(raw) as GameConfig;
}

export function createDefaultLevel(levelId: string): LevelContent {
	const size = 20;
	return {
		name: levelId,
		map: {
			width: size,
			height: size,
			tiles: Array.from({ length: size }, (_, y) =>
				Array.from({ length: size }, (_, x) =>
					x === 0 || x === size - 1 || y === 0 || y === size - 1 ? 1 : 0
				)
			)
		},
		sprites: [],
		player: {
			pos: { x: 2, y: 2 },
			dir: { x: 1, y: 0 },
			plane: { x: 0, y: 0.66 }
		},
		environment: {
			floorColor: '#555555',
			ceilingColor: '#333366',
			floorTexture: 0,
			ceilingTexture: 0
		}
	};
}

export function loadLevel(levelId: string): LevelContent {
	const levelPath = resolve(LEVELS_DIR, `${levelId}.json`);
	if (!existsSync(levelPath)) {
		if (levelId === DEFAULT_LEVEL_ID) {
			const level = createDefaultLevel(DEFAULT_LEVEL_ID);
			mkdirSync(LEVELS_DIR, { recursive: true });
			writeFileSync(levelPath, JSON.stringify(level, null, 2), 'utf-8');
			return level;
		}
		throw new Error(`Level not found: ${levelId}`);
	}
	const raw = readFileSync(levelPath, 'utf-8');
	return JSON.parse(raw) as LevelContent;
}

export function listLevels(): LevelListEntry[] {
	if (!existsSync(LEVELS_DIR)) {
		return [];
	}
	const files = readdirSync(LEVELS_DIR).filter((f) => f.endsWith('.json')).sort();
	return files.map((f) => {
		const id = basename(f, '.json');
		const raw = readFileSync(resolve(LEVELS_DIR, f), 'utf-8');
		const level = JSON.parse(raw) as LevelContent;
		return { id, name: level.name };
	});
}

export function mergeEngineConfig(global: GlobalConfig, env: EnvironmentConfig): EngineConfig {
	return {
		...global,
		...env
	};
}
