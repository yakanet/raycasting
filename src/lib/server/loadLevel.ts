import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
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

export function loadLevel(levelId: string): LevelContent {
	const levelPath = resolve(LEVELS_DIR, `${levelId}.json`);
	if (!existsSync(levelPath)) {
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
