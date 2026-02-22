<script lang="ts">
	import { createDefaultMap, createDefaultSprites, DEFAULT_CONFIG, TEX_BARREL, TEX_PILLAR, TEX_COIN, TEX_BOMB } from '$lib/engine';
	import type { Player, Sprite, WorldMap, EngineConfig } from '$lib/engine';

	import GridEditor from '$lib/components/editor/GridEditor.svelte';
	import SpriteList from '$lib/components/editor/SpriteList.svelte';
	import SpritePanel from '$lib/components/editor/SpritePanel.svelte';
	import PlayerPanel from '$lib/components/editor/PlayerPanel.svelte';
	import ConfigPanel from '$lib/components/editor/ConfigPanel.svelte';


	const { data } = $props();

	let map: WorldMap = $state(structuredClone(data.map));
	let sprites: Sprite[] = $state(structuredClone(data.sprites));
	let player: Player = $state(structuredClone(data.player));
	let config: EngineConfig = $state(structuredClone(data.config));

	let mode: 'wall' | 'erase' | 'sprite' | 'player' = $state('wall');
	let wallTexture = $state(1);
	let spriteTexture = $state(TEX_BARREL);
	let selectedSpriteIndex = $state(-1);
	let saving = $state(false);
	let statusMsg = $state('');

	let selectedSprite = $derived(
		selectedSpriteIndex >= 0 && selectedSpriteIndex < sprites.length
			? sprites[selectedSpriteIndex]
			: null
	);

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

	function loadDefaults() {
		map = createDefaultMap();
		sprites = createDefaultSprites();
		player = {
			pos: { x: 2, y: 2 },
			dir: { x: 1, y: 0 },
			plane: { x: 0, y: 0.66 }
		};
		config = { ...DEFAULT_CONFIG };
		selectedSpriteIndex = -1;
		statusMsg = 'Defaults loaded';
	}

	async function save() {
		saving = true;
		statusMsg = '';
		try {
			const res = await fetch('/api/level', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ map, sprites, player, config, textureImages: data.textureImages })
			});
			const result = await res.json();
			statusMsg = result.ok ? 'Saved!' : 'Error saving';
		} catch {
			statusMsg = 'Error saving';
		}
		saving = false;
	}
</script>

<div class="admin-layout">
	<aside class="sidebar">
		<h2>Level Editor</h2>

		<div class="toolbar">
			<span class="toolbar-label">Mode:</span>
			<button class:active={mode === 'wall'} onclick={() => (mode = 'wall')}>Wall</button>
			<button class:active={mode === 'erase'} onclick={() => (mode = 'erase')}>Erase</button>
			<button class:active={mode === 'sprite'} onclick={() => (mode = 'sprite')}>Sprite</button>
			<button class:active={mode === 'player'} onclick={() => (mode = 'player')}>Player</button>
		</div>

		{#if mode === 'wall'}
			<div class="texture-picker">
				<span class="toolbar-label">Wall texture:</span>
				{#each [1, 2, 3, 4, 5] as tex}
					<button class:active={wallTexture === tex} onclick={() => (wallTexture = tex)}>
						{tex}
					</button>
				{/each}
			</div>
		{/if}

		{#if mode === 'sprite'}
			<div class="texture-picker">
				<span class="toolbar-label">Sprite texture:</span>
				<button class:active={spriteTexture === TEX_BARREL} onclick={() => (spriteTexture = TEX_BARREL)}>
					Barrel
				</button>
				<button class:active={spriteTexture === TEX_PILLAR} onclick={() => (spriteTexture = TEX_PILLAR)}>
					Pillar
				</button>
				<button class:active={spriteTexture === TEX_COIN} onclick={() => (spriteTexture = TEX_COIN)}>
					Coin
				</button>
				<button class:active={spriteTexture === TEX_BOMB} onclick={() => (spriteTexture = TEX_BOMB)}>
					Bomb
				</button>
			</div>
		{/if}

		<SpriteList
			{sprites}
			selectedIndex={selectedSpriteIndex}
			onselect={selectSprite}
			onremove={removeSprite}
		/>

		<SpritePanel sprite={selectedSprite} />

		<PlayerPanel {player} />

		<ConfigPanel {config} />

		<div class="actions">
			<button class="btn-save" onclick={save} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
			<button class="btn-defaults" onclick={loadDefaults}>Load Defaults</button>
		</div>

		{#if statusMsg}
			<div class="status">{statusMsg}</div>
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

	.toolbar, .texture-picker {
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

	.toolbar button, .texture-picker button {
		background: #333;
		border: 1px solid #555;
		color: #ccc;
		padding: 4px 10px;
		font-size: 12px;
		cursor: pointer;
		border-radius: 3px;
	}

	.toolbar button:hover, .texture-picker button:hover {
		background: #444;
	}

	.toolbar button.active, .texture-picker button.active {
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

	.btn-defaults {
		background: #555;
		border: 1px solid #777;
		color: #fff;
		padding: 6px 16px;
		font-size: 13px;
		cursor: pointer;
		border-radius: 4px;
	}

	.btn-defaults:hover {
		background: #666;
	}

	.status {
		font-size: 12px;
		color: #8c8;
		font-family: monospace;
	}

	.editor-main {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 24px;
	}
</style>
