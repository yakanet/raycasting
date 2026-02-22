import type { LayoutServerLoad } from './$types';
import { DEFAULT_LEVEL_ID } from '$lib/engine';
import { loadGameConfig, loadLevel, listLevels, mergeEngineConfig } from '$lib/server/loadLevel';

export const load: LayoutServerLoad = async ({ url }) => {
	const levelId = url.searchParams.get('level') ?? DEFAULT_LEVEL_ID;
	const gameConfig = loadGameConfig();
	const level = loadLevel(levelId);
	const levels = listLevels();
	const config = mergeEngineConfig(gameConfig.config, level.environment);
	return {
		map: level.map,
		sprites: level.sprites,
		player: level.player,
		config,
		textures: gameConfig.textures,
		levelId,
		levelName: level.name,
		environment: level.environment,
		globalConfig: gameConfig.config,
		levels
	};
};
