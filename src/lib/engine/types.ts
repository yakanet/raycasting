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

export interface Sprite {
	pos: Vector2;
	texture: number;
	solid: boolean;
	radius: number;
	scale: number;
	collectible?: boolean;
	entityType?: EntityType;
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

