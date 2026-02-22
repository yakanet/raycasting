# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` — Start dev server
- `pnpm run build` — Production build
- `pnpm run preview` — Preview production build
- `pnpm run check` — Type-check with svelte-check (strict TypeScript)

## Architecture

SvelteKit single-page app implementing a Wolfenstein 3D-style raycasting engine rendered on a Canvas 2D (no WebGL).

### Engine (`src/lib/engine/`)

- **`raycaster.ts`** — Core renderer. DDA algorithm casts one ray per screen column for walls, then renders textured floor/ceiling via horizontal raycasting, and finally sprites sorted back-to-front (painter's algorithm) with z-buffer culling. All rendering writes to a single `ImageData` buffer per frame.
- **`input.ts`** — Handles keyboard (WASD/arrows) and mouse (pointer lock). Collision detection checks both wall tiles (margin-based AABB) and solid sprites (circle-circle). Movement splits X/Y axes for wall sliding.
- **`textures.ts`** — Procedurally generates all textures (9 total: 5 wall types, floor, ceiling, barrel sprite, pillar sprite) as `Uint8ClampedArray` RGBA buffers. No image files.
- **`map.ts`** — Default 20x20 tile map + sprite placement. Provides `placeWall()` / `removeWall()` helpers. Map tiles: 0 = empty, 1-5 = wall texture index.
- **`types.ts`** — Shared types (`Player`, `Sprite`, `WorldMap`, `EngineConfig`, `Vector2`). `Sprite` has `solid` and `radius` for optional collision.

### Components (`src/lib/components/`)

- **`RaycastCanvas.svelte`** — Game loop component. Wires up engine, input, and rendering via `requestAnimationFrame`. Displays FPS counter and controls hint.
- **`Minimap.svelte`** — Overlay showing tile map, player position/direction, FOV cone, and sprite positions.

## Conventions

- Svelte 5 runes (`$state`, `$props`) — no legacy `let` reactivity or `export let`
- All textures are 64x64 RGBA (configurable via `EngineConfig.textureSize`, must be power of 2 due to bitmask operations)
- Wall texture index in map tiles is 1-based (tile value - 1 = texture array index)
- Y-side walls are darkened 50% for depth perception
- Sprite textures use alpha=0 for transparency
