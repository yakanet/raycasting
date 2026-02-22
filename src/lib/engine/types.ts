export interface Vector2 {
	x: number;
	y: number;
}

export interface Player {
	pos: Vector2;
	dir: Vector2;
	plane: Vector2;
}

export interface Sprite {
	pos: Vector2;
	texture: number;
	solid: boolean;
	radius: number;
	scale: number;
	collectible?: boolean;
}

export interface Inventory {
	coins: number;
	bombs: number;
}

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
}

export const TEX_WALL_BRICK = 0;
export const TEX_WALL_STONE = 1;
export const TEX_WALL_BLUE = 2;
export const TEX_WALL_WOOD = 3;
export const TEX_WALL_MOSS = 4;
export const TEX_FLOOR = 5;
export const TEX_CEILING = 6;
export const TEX_BARREL = 7;
export const TEX_PILLAR = 8;
export const TEX_COIN = 9;
export const TEX_BOMB = 10;
export const TEX_COUNT = 11;

export interface TextureDef {
	id: number;
	name: string;
	path: string;
}

export const DEFAULT_TEXTURES: TextureDef[] = [
	{ id: TEX_WALL_BRICK, name: 'Wall: Brick', path: '/textures/wall_brick.png' },
	{ id: TEX_WALL_STONE, name: 'Wall: Stone', path: '/textures/wall_stone.png' },
	{ id: TEX_WALL_BLUE, name: 'Wall: Blue', path: '/textures/wall_blue.png' },
	{ id: TEX_WALL_WOOD, name: 'Wall: Wood', path: '/textures/wall_wood.png' },
	{ id: TEX_WALL_MOSS, name: 'Wall: Moss', path: '/textures/wall_moss.png' },
	{ id: TEX_FLOOR, name: 'Floor', path: '/textures/floor.png' },
	{ id: TEX_CEILING, name: 'Ceiling', path: '/textures/ceiling.png' },
	{ id: TEX_BARREL, name: 'Sprite: Barrel', path: '/textures/barrel.png' },
	{ id: TEX_PILLAR, name: 'Sprite: Pillar', path: '/textures/pillar.png' },
	{ id: TEX_COIN, name: 'Sprite: Coin', path: '/textures/coin.png' },
	{ id: TEX_BOMB, name: 'Sprite: Bomb', path: '/textures/bomb.png' }
];

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

export const DEFAULT_CONFIG: EngineConfig = {
	screenWidth: 960,
	screenHeight: 600,
	textureSize: 64,
	moveSpeed: 0.05,
	rotSpeed: 0.03,
	floorColor: '#555555',
	ceilingColor: '#333366'
};
