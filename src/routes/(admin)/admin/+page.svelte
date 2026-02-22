<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Player, Sprite, WorldMap, TextureDef } from '$lib/engine';

	import GridEditor from '$lib/components/editor/GridEditor.svelte';
	import SpriteList from '$lib/components/editor/SpriteList.svelte';
	import SpritePanel from '$lib/components/editor/SpritePanel.svelte';
	import EnvironmentPanel from '$lib/components/editor/EnvironmentPanel.svelte';
	import TextureSelect from '$lib/components/editor/TextureSelect.svelte';
	import { saveLevel, createLevel, deleteLevel } from './level.remote';

	const { data } = $props();

	let map: WorldMap = $state(structuredClone(untrack(() => data.map)));
	let sprites: Sprite[] = $state(structuredClone(untrack(() => data.sprites)));
	let player: Player = $state(structuredClone(untrack(() => data.player)));
	let levelName: string = $state(untrack(() => data.levelName));
	let environment = $state(structuredClone(untrack(() => data.environment)));
	let selectedSpriteIndex = $state(-1);

	// Reload local state when switching levels
	$effect(() => {
		const _id = data.levelId;
		untrack(() => {
			map = structuredClone(data.map);
			sprites = structuredClone(data.sprites);
			player = structuredClone(data.player);
			levelName = data.levelName;
			environment = structuredClone(data.environment);
			selectedSpriteIndex = -1;
			statusMsg = '';
		});
	});

	let textures = $derived(data.textures);

	const firstTex = untrack(() => data.textures).find((t: TextureDef) => t.path);
	let mode: 'wall' | 'erase' | 'sprite' | 'player' = $state('wall');
	let wallTexture = $state(firstTex ? firstTex.id + 1 : 1);
	let spriteTexture = $state(firstTex?.id ?? 0);
	let saving = $state(false);
	let statusMsg = $state('');
	let newLevelId = $state('');

	let selectedSprite = $derived(
		selectedSpriteIndex >= 0 && selectedSpriteIndex < sprites.length
			? sprites[selectedSpriteIndex]
			: null
	);

	function resizeMap(newWidth: number, newHeight: number) {
		newWidth = Math.max(3, Math.min(100, newWidth));
		newHeight = Math.max(3, Math.min(100, newHeight));
		const oldTiles = map.tiles;
		const tiles: number[][] = Array.from({ length: newHeight }, (_, y) =>
			Array.from({ length: newWidth }, (_, x) => {
				if (y < oldTiles.length && x < (oldTiles[y]?.length ?? 0)) {
					return oldTiles[y][x];
				}
				// New cells on borders get a wall, interior stays empty
				return (x === 0 || x === newWidth - 1 || y === 0 || y === newHeight - 1) ? 1 : 0;
			})
		);
		map = { width: newWidth, height: newHeight, tiles };

		// Clamp player position inside new bounds
		player.pos.x = Math.min(player.pos.x, newWidth - 1.01);
		player.pos.y = Math.min(player.pos.y, newHeight - 1.01);

		// Remove sprites outside new bounds
		sprites = sprites.filter((s) => s.pos.x < newWidth && s.pos.y < newHeight);
		selectedSpriteIndex = -1;
	}

	function selectSprite(index: number) {
		selectedSpriteIndex = index;
	}

	function removeSprite(index: number) {
		sprites.splice(index, 1);
		if (selectedSpriteIndex === index) {
			selectedSpriteIndex = -1;
		} else if (selectedSpriteIndex > index) {
			selectedSpriteIndex--;
		}
	}

	async function save() {
		saving = true;
		statusMsg = '';
		try {
			const result = await saveLevel({
				levelId: data.levelId,
				name: levelName,
				map,
				sprites,
				player,
				environment
			});
			statusMsg = result.ok ? 'Saved!' : 'Error saving';
		} catch {
			statusMsg = 'Error saving';
		}
		saving = false;
	}

	async function handleCreateLevel() {
		const id = newLevelId.trim().replace(/\s+/g, '-').toLowerCase();
		if (!id) return;
		saving = true;
		statusMsg = '';
		try {
			await createLevel({ levelId: id });
			newLevelId = '';
			goto(`/admin?level=${encodeURIComponent(id)}`);
		} catch (e) {
			statusMsg = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
		}
		saving = false;
	}

	async function handleDeleteLevel() {
		if (!confirm(`Delete level "${data.levelId}"?`)) return;
		saving = true;
		statusMsg = '';
		try {
			await deleteLevel({ levelId: data.levelId });
			goto('/admin');
		} catch (e) {
			statusMsg = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
		}
		saving = false;
	}
</script>

<div class="admin-layout">
	<aside class="sidebar">
		<h2>Level Editor</h2>

		<div class="level-selector">
			<label class="toolbar-label">
				Level:
				<select
					value={data.levelId}
					onchange={(e) => goto(`/admin?level=${encodeURIComponent(e.currentTarget.value)}`)}
				>
					{#each data.levels as level}
						<option value={level.id}>{level.name} ({level.id})</option>
					{/each}
				</select>
			</label>
			<label class="toolbar-label">
				Name: <input type="text" bind:value={levelName} class="level-name-input" />
			</label>
			<div class="map-size">
				<label class="toolbar-label">
					Width:
					<input
						type="number"
						min="3"
						max="100"
						value={map.width}
						onchange={(e) => resizeMap(Number(e.currentTarget.value), map.height)}
						class="size-input"
					/>
				</label>
				<label class="toolbar-label">
					Height:
					<input
						type="number"
						min="3"
						max="100"
						value={map.height}
						onchange={(e) => resizeMap(map.width, Number(e.currentTarget.value))}
						class="size-input"
					/>
				</label>
			</div>
		</div>

		<div class="level-actions">
			<input
				type="text"
				placeholder="new-level-id"
				bind:value={newLevelId}
				class="new-level-input"
			/>
			<button class="btn-small" onclick={handleCreateLevel} disabled={saving || !newLevelId.trim()}>
				New
			</button>
			<button class="btn-small btn-danger" onclick={handleDeleteLevel} disabled={saving || data.levels.length <= 1}>
				Delete
			</button>
		</div>

		<div class="toolbar">
			<span class="toolbar-label">Mode:</span>
			<button class:active={mode === 'wall'} onclick={() => (mode = 'wall')}>Wall</button>
			<button class:active={mode === 'erase'} onclick={() => (mode = 'erase')}>Erase</button>
			<button class:active={mode === 'sprite'} onclick={() => (mode = 'sprite')}>Sprite</button>
			<button class:active={mode === 'player'} onclick={() => (mode = 'player')}>Player</button>
		</div>

		{#if mode === 'wall'}
			<TextureSelect
				{textures}
				value={wallTexture}
				onchange={(v) => (wallTexture = v)}
				label="Wall texture:"
			/>
		{/if}

		{#if mode === 'sprite'}
			<TextureSelect
				{textures}
				value={spriteTexture}
				onchange={(v) => (spriteTexture = v)}
				offset={0}
				label="Sprite texture:"
			/>
		{/if}

		<SpriteList
			{sprites}
			selectedIndex={selectedSpriteIndex}
			{textures}
			onselect={selectSprite}
			onremove={removeSprite}
		/>

		<SpritePanel sprite={selectedSprite} {textures} levels={data.levels} />

		<EnvironmentPanel {environment} {textures} />

		<div class="actions">
			<button class="btn-save" onclick={save} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</div>

		{#if statusMsg}
			<div class="status" class:error={statusMsg.startsWith('Error')}>{statusMsg}</div>
		{/if}
	</aside>

	<main class="editor-main">
		<GridEditor
			{map}
			{sprites}
			{player}
			{mode}
			{wallTexture}
			{spriteTexture}
			{selectedSpriteIndex}
			onspriteselect={selectSprite}
		/>
	</main>
</div>

<style>
	.admin-layout {
		display: flex;
		height: 100%;
	}

	.sidebar {
		width: 320px;
		background: #1a1a1a;
		border-right: 1px solid #333;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		overflow-y: auto;
		box-sizing: border-box;
	}

	h2 {
		margin: 0 0 4px;
		font-size: 18px;
		color: #fff;
	}

	.level-selector {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.level-selector select {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 4px 6px;
		font-size: 12px;
		border-radius: 3px;
		flex: 1;
	}

	.level-name-input {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 3px 6px;
		font-size: 12px;
		border-radius: 3px;
		flex: 1;
	}

	.map-size {
		display: flex;
		gap: 8px;
	}

	.map-size label {
		display: flex;
		align-items: center;
		gap: 4px;
		flex: 1;
	}

	.size-input {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 3px 6px;
		font-size: 12px;
		border-radius: 3px;
		width: 60px;
	}

	.level-actions {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.new-level-input {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 3px 6px;
		font-size: 12px;
		border-radius: 3px;
		flex: 1;
	}

	.btn-small {
		background: #333;
		border: 1px solid #555;
		color: #ccc;
		padding: 3px 8px;
		font-size: 11px;
		cursor: pointer;
		border-radius: 3px;
	}

	.btn-small:hover {
		background: #444;
	}

	.btn-small:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-danger {
		border-color: #a44;
		color: #e88;
	}

	.btn-danger:hover {
		background: #4a2020;
	}

	.toolbar {
		display: flex;
		gap: 4px;
		align-items: center;
		flex-wrap: wrap;
	}

	.toolbar-label {
		font-size: 12px;
		color: #888;
		margin-right: 4px;
	}

	.toolbar button {
		background: #333;
		border: 1px solid #555;
		color: #ccc;
		padding: 4px 10px;
		font-size: 12px;
		cursor: pointer;
		border-radius: 3px;
	}

	.toolbar button:hover {
		background: #444;
	}

	.toolbar button.active {
		background: #2a4a6a;
		border-color: #5a8aba;
		color: #fff;
	}


	.actions {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn-save {
		background: #2a6a2a;
		border: 1px solid #4a8a4a;
		color: #fff;
		padding: 6px 16px;
		font-size: 13px;
		cursor: pointer;
		border-radius: 4px;
	}

	.btn-save:hover {
		background: #3a7a3a;
	}

	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}


	.status {
		font-size: 12px;
		color: #8c8;
		font-family: monospace;
	}

	.status.error {
		color: #e55;
	}

	.editor-main {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24px;
	}
</style>
