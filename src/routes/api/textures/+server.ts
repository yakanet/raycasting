import { json, error } from '@sveltejs/kit';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import type { RequestHandler } from './$types';
import { TEX_COUNT } from '$lib/engine';

const TEXTURES_DIR = resolve('static/textures');
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const slotStr = formData.get('slot') as string | null;

	if (!file || !slotStr) {
		return error(400, 'Missing file or slot');
	}

	const slot = Number(slotStr);
	if (!Number.isInteger(slot) || slot < 0 || slot >= TEX_COUNT) {
		return error(400, `Invalid slot: must be 0-${TEX_COUNT - 1}`);
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return error(400, 'Invalid file type. Allowed: PNG, JPEG, WebP');
	}

	const ext = extname(file.name) || `.${file.type.split('/')[1]}`;
	const filename = `tex_${slot}${ext}`;

	mkdirSync(TEXTURES_DIR, { recursive: true });

	const buffer = Buffer.from(await file.arrayBuffer());
	writeFileSync(resolve(TEXTURES_DIR, filename), buffer);

	// The Vite file watcher detects this write and regenerates the atlas automatically
	const url = `/textures/${filename}?v=${Date.now()}`;
	return json({ ok: true, url });
};
