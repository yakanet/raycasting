import type { LayoutServerLoad } from './$types';
import { loadLevel } from '$lib/server/loadLevel';

export const load: LayoutServerLoad = async () => {
	return loadLevel();
};
