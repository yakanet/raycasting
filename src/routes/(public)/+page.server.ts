import type { PageServerLoad } from './$types';
import { DEFAULT_LEVEL_ID } from '$lib/engine';
import { loadGameConfig, loadLevel, mergeEngineConfig } from '$lib/server/loadLevel';

export const load: PageServerLoad = async () => {
	const gameConfig = loadGameConfig();
	const level = loadLevel(DEFAULT_LEVEL_ID);
	const config = mergeEngineConfig(gameConfig.config, level.environment);
	return {
		map: level.map,
		sprites: level.sprites,
		player: level.player,
		config,
		textures: gameConfig.textures
	};
};
