export const DEFAULT_LEVEL_ID = 'start';

export interface Vector2 {
	x: number;
	y: number;
}

export interface Player {
	pos: Vector2;
	dir: Vector2;
	plane: Vector2;
}

export type EntityType = string;

export interface TeleportTarget {
	levelId: string;
	spawnPos?: Vector2;
	spawnDir?: Vector2;
}

export interface Sprite {
	pos: Vector2;
	texture: number;
	solid: boolean;
	radius: number;
	scale: number;
	collectible?: boolean;
	entityType?: EntityType;
	teleportTarget?: TeleportTarget;
}

export type Inventory = Record<string, number>;

export interface RayHit {
	wallDist: number;
	side: 0 | 1;
	mapX: number;
	mapY: number;
	wallX: number;
	texNum: number;
}

export interface WorldMap {
	width: number;
	height: number;
	tiles: number[][];
}

export interface EngineConfig {
	screenWidth: number;
	screenHeight: number;
	textureSize: number;
	moveSpeed: number;
	rotSpeed: number;
	floorColor: string;
	ceilingColor: string;
	floorTexture: number;
	ceilingTexture: number;
}


export interface TextureDef {
	id: number;
	name: string;
	path: string;
}


export interface GlobalConfig {
	screenWidth: number;
	screenHeight: number;
	textureSize: number;
	moveSpeed: number;
	rotSpeed: number;
}

export interface EnvironmentConfig {
	floorColor: string;
	ceilingColor: string;
	floorTexture: number;
	ceilingTexture: number;
}

export interface GameConfig {
	config: GlobalConfig;
	textures: TextureDef[];
}

export interface LevelContent {
	name: string;
	map: WorldMap;
	sprites: Sprite[];
	player: Player;
	environment: EnvironmentConfig;
}

export interface AtlasManifest {
	atlas: string;
	textureSize: number;
	entries: AtlasEntry[];
}

export interface AtlasEntry {
	slot: number;
	name: string;
	x: number;
}

