import * as v from 'valibot';
import { command } from '$app/server';
import { loadGameConfig, loadLevel, mergeEngineConfig } from '$lib/server/loadLevel';

const FetchLevelSchema = v.object({
	levelId: v.string()
});

export const fetchLevel = command(FetchLevelSchema, async ({ levelId }) => {
	const gameConfig = loadGameConfig();
	const level = loadLevel(levelId);
	const config = mergeEngineConfig(gameConfig.config, level.environment);
	return {
		map: level.map,
		sprites: level.sprites,
		player: level.player,
		config,
		textures: gameConfig.textures
	};
});
