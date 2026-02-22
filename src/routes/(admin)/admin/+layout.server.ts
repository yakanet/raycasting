import type { LayoutServerLoad } from './$types';
import { loadGameConfig, loadLevel, listLevels, mergeEngineConfig } from '$lib/server/loadLevel';

export const load: LayoutServerLoad = async ({ url }) => {
	const levelId = url.searchParams.get('level') ?? 'level-1';
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
