<script lang="ts">
	import { createDefaultMap, createDefaultSprites, TEX_BARREL, TEX_PILLAR, TEX_COIN, TEX_BOMB, TEX_COUNT, TEX_NAMES } from '$lib/engine';
	import type { Player, Sprite, WorldMap, CustomTextureNames } from '$lib/engine';

	import GridEditor from '$lib/components/editor/GridEditor.svelte';
	import SpriteList from '$lib/components/editor/SpriteList.svelte';
	import SpritePanel from '$lib/components/editor/SpritePanel.svelte';


	const { data } = $props();

	let map: WorldMap = $state(structuredClone(data.map));
	let sprites: Sprite[] = $state(structuredClone(data.sprites));
	let player: Player = $state(structuredClone(data.player));

	const customTextureNames: CustomTextureNames = data.customTextureNames ?? {};
	const textureImages = data.textureImages ?? {};

	// Wall textures: default slots 0-4 (tile values 1-5) + custom slots with images
	const defaultWallSlots = [0, 1, 2, 3, 4]; // TEX_WALL_BRICK..TEX_WALL_MOSS
	let customSlots = $derived(
		Object.keys(customTextureNames)
			.map(Number)
			.filter((slot) => slot >= TEX_COUNT && textureImages[slot])
			.sort((a, b) => a - b)
	);
	let wallOptions = $derived([
		...defaultWallSlots.map((slot) => ({
			tileValue: slot + 1,
			slot,
			label: (TEX_NAMES[slot] ?? `Slot ${slot}`).replace('Wall: ', ''),
			img: textureImages[slot] as string | undefined
		})),
		...customSlots.map((slot) => ({
			tileValue: slot + 1,
			slot,
			label: customTextureNames[slot],
			img: textureImages[slot] as string | undefined
		}))
	]);

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
				body: JSON.stringify({ map, sprites, player, config: data.config, textureImages: data.textureImages, customTextureNames: data.customTextureNames })
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
				{#each wallOptions as opt}
					<button class="tex-btn" class:active={wallTexture === opt.tileValue} onclick={() => (wallTexture = opt.tileValue)} title={opt.label}>
						{#if opt.img}
							<img class="tex-thumb" src={opt.img} alt={opt.label} />
						{/if}
						<span class="tex-label">{opt.label}</span>
					</button>
				{/each}
			</div>
		{/if}

		{#if mode === 'sprite'}
			<div class="texture-picker">
				<span class="toolbar-label">Sprite texture:</span>
				{#each [[TEX_BARREL, 'Barrel'] as const, [TEX_PILLAR, 'Pillar'] as const, [TEX_COIN, 'Coin'] as const, [TEX_BOMB, 'Bomb'] as const] as [tex, label]}
					<button class="tex-btn" class:active={spriteTexture === tex} onclick={() => (spriteTexture = tex)} title={label}>
						{#if textureImages[tex]}
							<img class="tex-thumb" src={textureImages[tex]} alt={label} />
						{/if}
						<span class="tex-label">{label}</span>
					</button>
				{/each}
				{#each customSlots as slot}
					<button class="tex-btn" class:active={spriteTexture === slot} onclick={() => (spriteTexture = slot)} title={customTextureNames[slot]}>
						{#if textureImages[slot]}
							<img class="tex-thumb" src={textureImages[slot]} alt={customTextureNames[slot]} />
						{/if}
						<span class="tex-label">{customTextureNames[slot]}</span>
					</button>
				{/each}
			</div>
		{/if}

		<SpriteList
			{sprites}
			selectedIndex={selectedSpriteIndex}
			onselect={selectSprite}
			onremove={removeSprite}
		/>

		<SpritePanel sprite={selectedSprite} />

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

	.tex-btn {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.tex-thumb {
		width: 20px;
		height: 20px;
		image-rendering: pixelated;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.tex-label {
		font-size: 11px;
		white-space: nowrap;
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
