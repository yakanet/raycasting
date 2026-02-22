import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { RequestHandler } from './$types';
import { createDefaultMap, createDefaultSprites, DEFAULT_CONFIG } from '$lib/engine';
import type { Player } from '$lib/engine';

const LEVEL_PATH = resolve('data/level.json');

const defaultPlayer: Player = {
	pos: { x: 2, y: 2 },
	dir: { x: 1, y: 0 },
	plane: { x: 0, y: 0.66 }
};

export const GET: RequestHandler = async () => {
	try {
		const raw = readFileSync(LEVEL_PATH, 'utf-8');
		return json(JSON.parse(raw));
	} catch {
		return json({
			map: createDefaultMap(),
			sprites: createDefaultSprites(),
			player: defaultPlayer,
			config: { ...DEFAULT_CONFIG }
		});
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	mkdirSync(dirname(LEVEL_PATH), { recursive: true });
	writeFileSync(LEVEL_PATH, JSON.stringify(body, null, 2), 'utf-8');
	return json({ ok: true });
};
