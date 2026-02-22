# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` — Start dev server
- `pnpm run build` — Production build
- `pnpm run preview` — Preview production build
- `pnpm run check` — Type-check with svelte-check (strict TypeScript)
- `pnpm run generate-textures` — Regenerate default PNG textures from procedural generators

## Architecture

SvelteKit app implementing a Wolfenstein 3D-style raycasting engine rendered on Canvas 2D (no WebGL), with a built-in level editor.

### Routes

- `/` — Play page. Loads level data server-side via `loadLevel()`, renders `RaycastCanvas`.
- `/admin` — Level editor. Full editing UI: map tiles, sprite placement, player spawn, engine config, texture uploads.
- `/api/level` — GET/POST for saving/loading `data/level.json`.
- `/api/textures` — POST for uploading custom texture images to `static/textures/`.

### Engine (`src/lib/engine/`)

- **`raycaster.ts`** — Core renderer. DDA algorithm casts one ray per screen column for walls, then renders textured floor/ceiling via horizontal raycasting, and finally sprites sorted back-to-front (painter's algorithm) with z-buffer culling. All rendering writes to a single `ImageData` buffer per frame.
- **`input.ts`** — Keyboard (WASD/arrows) and mouse (pointer lock). Collision detection: wall tiles (margin-based AABB in 3x3 grid) and solid sprites (circle-circle). Movement splits X/Y axes for wall sliding. Collectible pickups auto-detected at distance <0.25.
- **`textures.ts`** — Procedural texture generation (11 textures: 5 walls, floor, ceiling, 4 sprites). `buildTextures()` tries atlas first (single HTTP request), falls back to individual images, then purple checkerboard.
- **`map.ts`** — Default 20x20 tile map + sprite placement. `placeWall()` / `removeWall()` helpers.
- **`types.ts`** — Shared types and 11 texture slot constants (`TEX_WALL_BRICK`=0 through `TEX_BOMB`=10). `DEFAULT_TEXTURE_IMAGES` maps slots to `/textures/*.png` URLs.
- **`audio.ts`** — Web Audio API sound effects for coin pickup and bomb pickup.

### Texture Atlas (`src/lib/vite/texture-atlas-plugin.ts`)

Vite plugin that composites all 11 PNG textures into a single horizontal strip image, served via virtual module:

- **`virtual:texture-atlas`** — Virtual JS module exporting manifest `{ atlas: URL, textureSize, entries }`.
- **Dev mode:** Atlas PNG served in-memory via middleware at `/@texture-atlas.png`. File watcher on `static/textures/` triggers rebuild + HMR full-reload.
- **Build mode:** Atlas emitted as hashed Rollup asset via `this.emitFile`.
- **Slot resolution:** Custom `tex_<slot>.*` overrides default file per slot.
- **No files written to disk** — atlas exists only in memory / build output.

Type declaration for the virtual module lives in `src/virtual-modules.d.ts`.

### Level Editor (`src/lib/components/editor/`)

- **`GridEditor.svelte`** — 24px-cell canvas with pointer painting (walls/erase) and click-to-place (sprites/player). Highlights selected sprite.
- **`SpriteList.svelte`** — Scrollable sprite list with select/delete.
- **`SpritePanel.svelte`** — Edit sprite properties (position, texture, solid, collectible, radius, scale).
- **`PlayerPanel.svelte`** — Edit spawn position and rotation angle (degree↔radian conversion, auto-computes camera plane).
- **`ConfigPanel.svelte`** — Engine settings (screen size, speeds, colors).
- **`TexturePanel.svelte`** — Per-slot texture upload/preview/clear.

### Data Persistence

- **`data/level.json`** — Saved level data (created at runtime by API).
- **`static/textures/`** — PNG texture files (defaults + custom uploads `tex_N.ext`).
- **`src/lib/server/loadLevel.ts`** — Reads `data/level.json`, falls back to procedural defaults, merges `textureImages` with `DEFAULT_TEXTURE_IMAGES`.

## Conventions

- Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`) — no legacy `let` reactivity or `export let`
- All textures are 64x64 RGBA (configurable via `EngineConfig.textureSize`, must be power of 2 due to bitmask operations `& (size - 1)`)
- Wall texture index in map tiles is 1-based (tile value - 1 = texture array index)
- Y-side walls are darkened 50% (`>> 1`) for depth perception
- Sprite textures use alpha=0 for transparency
- Player direction is a normalized vector; camera plane is perpendicular scaled by 0.66 (≈66° FOV)
- Collectible sprites have `solid: false`, `radius: 0`, `collectible: true`; solid sprites need `radius > 0`
