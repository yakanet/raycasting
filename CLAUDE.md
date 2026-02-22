# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm run dev` — Start dev server
- `pnpm run build` — Production build
- `pnpm run preview` — Preview production build
- `pnpm run check` — Type-check with svelte-check (strict TypeScript)

## Architecture

SvelteKit app implementing a Wolfenstein 3D-style raycasting engine rendered on Canvas 2D (no WebGL), with a built-in level editor. Uses SvelteKit experimental **remote functions** (`command()` from `$app/server`) instead of REST API routes.

### Routes

- `/` — Play page. Loads level data server-side via `loadLevel()`, renders `RaycastCanvas`. Supports level teleportation.
- `/admin` — Level editor. Map tiles, sprite placement, player spawn, environment config. Supports multi-level management (create/delete/switch).
- `/admin/textures` — Texture management. Per-slot upload/preview/delete with live atlas rebuild.
- `/admin/settings` — Game settings. Global engine config (screen size, speeds) and player/environment config.

Remote functions (replacing former REST API routes):
- `src/routes/(public)/level.remote.ts` — `fetchLevel` (prerendered remote function) for loading level data client-side (teleportation). All level inputs are baked at build time.
- `src/routes/(admin)/admin/level.remote.ts` — `saveLevel`, `createLevel`, `deleteLevel`, `uploadTexture`, `saveGameConfig`.

### Engine (`src/lib/engine/`)

- **`raycaster.ts`** — Core renderer. DDA algorithm casts one ray per screen column for walls, then renders textured floor/ceiling via horizontal raycasting, and finally sprites sorted back-to-front (painter's algorithm) with z-buffer culling. All rendering writes to a single `ImageData` buffer per frame.
- **`input.ts`** — Keyboard (WASD/arrows) and mouse (pointer lock). Collision detection: wall tiles (margin-based AABB in 3x3 grid) and solid sprites (circle-circle). Movement splits X/Y axes for wall sliding. Collectible pickups and teleporter detection with cooldown hysteresis.
- **`textures.ts`** — Texture loading. `buildTextures()` tries atlas first (single HTTP request), falls back to individual images from `TextureDef[]`, then purple checkerboard fallback.
- **`map.ts`** — `placeWall()` / `removeWall()` helpers for tile manipulation.
- **`types.ts`** — Shared types/interfaces. Texture slots are dynamic (defined in `data/config.json`, not hardcoded constants).
- **`audio.ts`** — Web Audio API sound effects (coin, bomb, teleport).
- **`entities.ts`** — Entity behavior registry. Built-in types: `coin`, `bomb`, `teleporter`. Each has an `inventoryKey` and `playSound` callback.

### Stores (`src/lib/stores/`)

- **`inventory.svelte.ts`** — Module-level `$state` inventory store with `addToInventory()` and `resetInventory()`.

### Texture Atlas (`src/lib/vite/texture-atlas-plugin.ts`)

Vite plugin that composites all PNG textures (from `data/config.json` registry) into a single horizontal strip image, served via virtual module:

- **`virtual:texture-atlas`** — Virtual JS module exporting manifest `{ atlas: URL, textureSize, entries }`.
- **Dev mode:** Atlas PNG served in-memory via middleware at `/@texture-atlas.png`. File watcher on `data/textures/` and `data/config.json` triggers rebuild + HMR full-reload.
- **Build mode:** Atlas emitted as hashed Rollup asset via `this.emitFile`.
- **Slot resolution:** Texture files named `tex_<id>.*` in `data/textures/`.
- **No files written to disk** — atlas exists only in memory / build output.

Type declaration for the virtual module lives in `src/virtual-modules.d.ts`.

### Level Editor (`src/lib/components/editor/`)

- **`GridEditor.svelte`** — 24px-cell canvas with pointer painting (walls/erase) and click-to-place (sprites/player). Highlights selected sprite.
- **`SpriteList.svelte`** — Scrollable sprite list with select/delete.
- **`SpritePanel.svelte`** — Edit sprite properties (position, texture, solid, collectible, entity type, radius, scale, teleport target).
- **`PlayerPanel.svelte`** — Edit spawn position and rotation angle (degree↔radian conversion, auto-computes camera plane).
- **`ConfigPanel.svelte`** — Engine settings (screen size, texture size, speeds).
- **`EnvironmentPanel.svelte`** — Floor/ceiling colors and textures.
- **`TextureThumb.svelte`** — Displays a single texture slot from the atlas via CSS background cropping.
- **`TextureSelect.svelte`** — Reusable image-picker `<select>` component (uses experimental `appearance: base-select`).

### Game Components (`src/lib/components/`)

- **`RaycastCanvas.svelte`** — Main game canvas. Loads textures, creates `Raycaster` + `InputHandler`, runs `requestAnimationFrame` game loop. Displays FPS, minimap toggle, inventory HUD.
- **`Minimap.svelte`** — Overhead minimap with its own RAF loop. Shows tiles, sprites, player position + direction + FOV cone.

### Data Persistence

- **`data/config.json`** — Game config: global settings (`screenWidth`, `screenHeight`, `textureSize`, `moveSpeed`, `rotSpeed`) and texture registry (`TextureDef[]` with id/name/path).
- **`data/levels/<id>.json`** — Per-level data: name, map (tiles), sprites, player spawn, environment config. Default level: `start.json`.
- **`data/textures/`** — PNG texture files (defaults + custom uploads `tex_<id>.<ext>`). Not in `static/` — served via Vite plugin middleware in dev, atlas only in build.
- **`src/lib/server/loadLevel.ts`** — `loadLevel()`, `loadGameConfig()`, `listLevels()`, `createDefaultLevel()`, `mergeEngineConfig()`.

## Conventions

- Svelte 5 runes (`$state`, `$props`, `$derived`, `$effect`) — no legacy `let` reactivity or `export let`
- All textures are 64×64 RGBA (configurable via `textureSize` in config, must be power of 2 due to bitmask operations `& (size - 1)`)
- Wall texture index in map tiles is 1-based (tile value − 1 = texture array index); 0 = empty
- Floor/ceiling texture index in `EnvironmentConfig` is also 1-based (0 = no texture, use solid color)
- Y-side walls are darkened 50% (`>> 1`) for depth perception; floor textures also darkened 50%
- Sprite textures use alpha=0 for transparency
- Player direction is a normalized vector; camera plane is perpendicular scaled by 0.66 (≈66° FOV)
- Collectible sprites have `solid: false`, `radius: 0`, `collectible: true`; solid sprites need `radius > 0`
- Teleporter sprites have `entityType: 'teleporter'` and a `teleportTarget: { levelId, spawnPos?, spawnDir? }`
- Valibot schemas validate all remote function inputs server-side

## Security

- **Static production build:** `adapter-static` prerenders only the public game page (`/`). `kit.prerender.entries` is set to `['/']` and `handleUnseenRoutes: 'ignore'` skips admin routes. No admin HTML, CSS, or data is generated in the build output.
- **Prerendered remote functions:** `fetchLevel` uses `prerender()` instead of `command()`, so level data is baked into the build as static assets (no server needed at runtime).

## Notes

- `moveSpeed` and `rotSpeed` in config are in **units per second** (delta-time based). Typical values: `3.0` and `1.8`.
- **Experimental CSS:** `appearance: base-select` in `TextureSelect.svelte` / `SpritePanel.svelte` has limited browser support.
