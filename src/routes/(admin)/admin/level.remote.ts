import * as v from 'valibot';
import { command } from '$app/server';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const LEVEL_PATH = resolve('data/level.json');
const TEXTURES_DIR = resolve('static/textures');

const Vector2Schema = v.object({
	x: v.number(),
	y: v.number()
});

const SpriteSchema = v.object({
	pos: Vector2Schema,
	texture: v.number(),
	solid: v.boolean(),
	radius: v.number(),
	scale: v.optional(v.number(), 1),
	collectible: v.optional(v.boolean()),
	entityType: v.optional(v.string())
});

const PlayerSchema = v.object({
	pos: Vector2Schema,
	dir: Vector2Schema,
	plane: Vector2Schema
});

const ConfigSchema = v.object({
	screenWidth: v.number(),
	screenHeight: v.number(),
	textureSize: v.number(),
	moveSpeed: v.number(),
	rotSpeed: v.number(),
	floorColor: v.string(),
	ceilingColor: v.string(),
	floorTexture: v.number(),
	ceilingTexture: v.number()
});

const TextureDefSchema = v.object({
	id: v.number(),
	name: v.string(),
	path: v.string()
});

const WorldMapSchema = v.object({
	width: v.number(),
	height: v.number(),
	tiles: v.array(v.array(v.number()))
});

const SaveLevelSchema = v.object({
	map: WorldMapSchema,
	sprites: v.array(SpriteSchema),
	player: PlayerSchema,
	config: ConfigSchema,
	textures: v.array(TextureDefSchema)
});

export const saveLevel = command(SaveLevelSchema, async (data) => {
	mkdirSync(dirname(LEVEL_PATH), { recursive: true });
	writeFileSync(LEVEL_PATH, JSON.stringify(data, null, 2), 'utf-8');
	return { ok: true };
});

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

const UploadTextureSchema = v.object({
	slot: v.pipe(v.number(), v.integer(), v.minValue(0)),
	filename: v.string(),
	data: v.instance(Uint8Array)
});

export const uploadTexture = command(UploadTextureSchema, async ({ slot, filename, data }) => {
	const dotIdx = filename.lastIndexOf('.');
	const ext = dotIdx >= 0 ? filename.slice(dotIdx).toLowerCase() : '.png';

	if (!ALLOWED_EXTENSIONS.includes(ext)) {
		throw new Error('Invalid file type. Allowed: PNG, JPEG, WebP');
	}

	const outFilename = `tex_${slot}${ext}`;

	mkdirSync(TEXTURES_DIR, { recursive: true });
	writeFileSync(resolve(TEXTURES_DIR, outFilename), Buffer.from(data));

	const url = `/textures/${outFilename}?v=${Date.now()}`;
	return { ok: true, url };
});
