import { TEX_BARREL, TEX_PILLAR, TEX_COIN, TEX_BOMB } from './types';
import type { WorldMap, Sprite } from './types';

/**
 * Create the default map layout.
 * 0 = empty space, 1-5 = wall textures
 */
export function createDefaultMap(): WorldMap {
	const tiles = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 1],
		[1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1],
		[1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 5, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 5, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 5, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	return {
		width: tiles[0].length,
		height: tiles.length,
		tiles
	};
}

/**
 * Create default sprite placements.
 * texture 7 = barrel, texture 8 = pillar
 */
export function createDefaultSprites(): Sprite[] {
	return [
		{ pos: { x: 3.5, y: 8.5 }, texture: TEX_BARREL, solid: true, radius: 0.3, scale: 1 },
		{ pos: { x: 5.5, y: 4.5 }, texture: TEX_PILLAR, solid: true, radius: 0.25, scale: 1 },
		{ pos: { x: 10.5, y: 3.5 }, texture: TEX_BARREL, solid: true, radius: 0.3, scale: 1 },
		{ pos: { x: 16.5, y: 5.5 }, texture: TEX_PILLAR, solid: true, radius: 0.25, scale: 1 },
		{ pos: { x: 9.5, y: 9.5 }, texture: TEX_BARREL, solid: false, radius: 0.3, scale: 1 },
		{ pos: { x: 15.5, y: 14.5 }, texture: TEX_BARREL, solid: false, radius: 0.3, scale: 1 },
		{ pos: { x: 4.5, y: 15.5 }, texture: TEX_PILLAR, solid: true, radius: 0.25, scale: 1 },
		{ pos: { x: 10.5, y: 17.5 }, texture: TEX_BARREL, solid: true, radius: 0.3, scale: 1 },
		// Collectibles
		{ pos: { x: 4.5, y: 2.5 }, texture: TEX_COIN, solid: false, radius: 0, scale: 0.5, collectible: true },
		{ pos: { x: 8.5, y: 5.5 }, texture: TEX_COIN, solid: false, radius: 0, scale: 0.5, collectible: true },
		{ pos: { x: 14.5, y: 9.5 }, texture: TEX_COIN, solid: false, radius: 0, scale: 0.5, collectible: true },
		{ pos: { x: 6.5, y: 13.5 }, texture: TEX_COIN, solid: false, radius: 0, scale: 0.5, collectible: true },
		{ pos: { x: 17.5, y: 2.5 }, texture: TEX_COIN, solid: false, radius: 0, scale: 0.5, collectible: true },
		{ pos: { x: 12.5, y: 15.5 }, texture: TEX_BOMB, solid: false, radius: 0, scale: 0.8, collectible: true },
		{ pos: { x: 3.5, y: 6.5 }, texture: TEX_BOMB, solid: false, radius: 0, scale: 0.8, collectible: true },
		{ pos: { x: 16.5, y: 17.5 }, texture: TEX_BOMB, solid: false, radius: 0, scale: 0.8, collectible: true }
	];
}

/**
 * Place a wall on the map.
 */
export function placeWall(map: WorldMap, x: number, y: number, texture: number): void {
	if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
		map.tiles[y][x] = texture;
	}
}

/**
 * Remove a wall from the map.
 */
export function removeWall(map: WorldMap, x: number, y: number): void {
	if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
		map.tiles[y][x] = 0;
	}
}
