import type { WorldMap } from './types';

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
