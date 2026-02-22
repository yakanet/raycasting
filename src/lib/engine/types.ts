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

export type TextureImageMap = Partial<Record<number, string>>;

export const TEX_NAMES: Record<number, string> = {
	[TEX_WALL_BRICK]: 'Wall: Brick',
	[TEX_WALL_STONE]: 'Wall: Stone',
	[TEX_WALL_BLUE]: 'Wall: Blue',
	[TEX_WALL_WOOD]: 'Wall: Wood',
	[TEX_WALL_MOSS]: 'Wall: Moss',
	[TEX_FLOOR]: 'Floor',
	[TEX_CEILING]: 'Ceiling',
	[TEX_BARREL]: 'Sprite: Barrel',
	[TEX_PILLAR]: 'Sprite: Pillar',
	[TEX_COIN]: 'Sprite: Coin',
	[TEX_BOMB]: 'Sprite: Bomb'
};

export const DEFAULT_TEXTURE_IMAGES: TextureImageMap = {
	[TEX_WALL_BRICK]: '/textures/wall_brick.png',
	[TEX_WALL_STONE]: '/textures/wall_stone.png',
	[TEX_WALL_BLUE]: '/textures/wall_blue.png',
	[TEX_WALL_WOOD]: '/textures/wall_wood.png',
	[TEX_WALL_MOSS]: '/textures/wall_moss.png',
	[TEX_FLOOR]: '/textures/floor.png',
	[TEX_CEILING]: '/textures/ceiling.png',
	[TEX_BARREL]: '/textures/barrel.png',
	[TEX_PILLAR]: '/textures/pillar.png',
	[TEX_COIN]: '/textures/coin.png',
	[TEX_BOMB]: '/textures/bomb.png'
};

export const DEFAULT_CONFIG: EngineConfig = {
	screenWidth: 960,
	screenHeight: 600,
	textureSize: 64,
	moveSpeed: 0.05,
	rotSpeed: 0.03,
	floorColor: '#555555',
	ceilingColor: '#333366'
};
