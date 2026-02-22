import * as v from 'valibot';
import { command } from '$app/server';
import { writeFileSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createDefaultLevel } from '$lib/server/loadLevel';

const CONFIG_PATH = resolve('data/config.json');
const LEVELS_DIR = resolve('data/levels');
const TEXTURES_DIR = resolve('static/textures');

const Vector2Schema = v.object({
	x: v.number(),
	y: v.number()
});

const TeleportTargetSchema = v.object({
	levelId: v.string(),
	spawnPos: v.optional(Vector2Schema),
	spawnDir: v.optional(Vector2Schema)
});

const SpriteSchema = v.object({
	pos: Vector2Schema,
	texture: v.number(),
	solid: v.boolean(),
	radius: v.number(),
	scale: v.optional(v.number(), 1),
	collectible: v.optional(v.boolean()),
	entityType: v.optional(v.string()),
	teleportTarget: v.optional(TeleportTargetSchema)
});

const PlayerSchema = v.object({
	pos: Vector2Schema,
	dir: Vector2Schema,
	plane: Vector2Schema
});

const GlobalConfigSchema = v.object({
	screenWidth: v.number(),
	screenHeight: v.number(),
	textureSize: v.number(),
	moveSpeed: v.number(),
	rotSpeed: v.number()
});

const EnvironmentConfigSchema = v.object({
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
	levelId: v.string(),
	name: v.string(),
	map: WorldMapSchema,
	sprites: v.array(SpriteSchema),
	player: PlayerSchema,
	environment: EnvironmentConfigSchema
});

export const saveLevel = command(SaveLevelSchema, async (data) => {
	mkdirSync(LEVELS_DIR, { recursive: true });
	const levelPath = resolve(LEVELS_DIR, `${data.levelId}.json`);
	const levelContent = {
		name: data.name,
		map: data.map,
		sprites: data.sprites,
		player: data.player,
		environment: data.environment
	};
	writeFileSync(levelPath, JSON.stringify(levelContent, null, 2), 'utf-8');
	return { ok: true };
});

const SaveGameConfigSchema = v.object({
	config: GlobalConfigSchema,
	textures: v.array(TextureDefSchema)
});

export const saveGameConfig = command(SaveGameConfigSchema, async (data) => {
	mkdirSync(dirname(CONFIG_PATH), { recursive: true });
	writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
	return { ok: true };
});

const CreateLevelSchema = v.object({
	levelId: v.string()
});

export const createLevel = command(CreateLevelSchema, async ({ levelId }) => {
	mkdirSync(LEVELS_DIR, { recursive: true });
	const levelPath = resolve(LEVELS_DIR, `${levelId}.json`);
	if (existsSync(levelPath)) {
		throw new Error(`Level already exists: ${levelId}`);
	}
	const defaultLevel = createDefaultLevel(levelId);
	writeFileSync(levelPath, JSON.stringify(defaultLevel, null, 2), 'utf-8');
	return { ok: true };
});

const DeleteLevelSchema = v.object({
	levelId: v.string()
});

export const deleteLevel = command(DeleteLevelSchema, async ({ levelId }) => {
	const levelPath = resolve(LEVELS_DIR, `${levelId}.json`);
	if (!existsSync(levelPath)) {
		throw new Error(`Level not found: ${levelId}`);
	}
	unlinkSync(levelPath);
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
