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

export const DEFAULT_CONFIG: EngineConfig = {
	screenWidth: 960,
	screenHeight: 600,
	textureSize: 64,
	moveSpeed: 0.05,
	rotSpeed: 0.03,
	floorColor: '#555555',
	ceilingColor: '#333366'
};
