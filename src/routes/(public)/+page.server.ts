import type { PageServerLoad } from './$types';
import { loadLevel } from '$lib/server/loadLevel';

export const load: PageServerLoad = async () => {
	return loadLevel();
};
