<script lang="ts">
	import { untrack } from 'svelte';
	import type { Player, Sprite, WorldMap, TextureDef } from '$lib/engine';

	import GridEditor from '$lib/components/editor/GridEditor.svelte';
	import SpriteList from '$lib/components/editor/SpriteList.svelte';
	import SpritePanel from '$lib/components/editor/SpritePanel.svelte';
	import { saveLevel } from './level.remote';

	const { data } = $props();
	const initial = untrack(() => structuredClone(data));

	let map: WorldMap = $state(structuredClone(initial.map));
	let sprites: Sprite[] = $state(structuredClone(initial.sprites));
	let player: Player = $state(structuredClone(initial.player));

	let textures = $derived(data.textures);

	// All textures that have an image, usable for walls and sprites
	let textureOptions = $derived(
		textures
			.filter((t: TextureDef) => t.path)
			.sort((a: TextureDef, b: TextureDef) => a.id - b.id)
			.map((t: TextureDef) => ({
				slot: t.id,
				tileValue: t.id + 1,
				label: t.name,
				img: t.path
			}))
	);

	const firstTex = initial.textures.find((t: TextureDef) => t.path);
	let mode: 'wall' | 'erase' | 'sprite' | 'player' = $state('wall');
	let wallTexture = $state(firstTex ? firstTex.id + 1 : 1);
	let spriteTexture = $state(firstTex?.id ?? 0);
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

	async function save() {
		saving = true;
		statusMsg = '';
		try {
			const result = await saveLevel({ map, sprites, player, config: data.config, textures: data.textures });
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
			<label class="picker-label">
				<span class="toolbar-label">Wall texture:</span>
				<select
					class="tex-select"
					value={String(wallTexture)}
					onchange={(e) => (wallTexture = Number(e.currentTarget.value))}
				>
					<button>
						<selectedcontent></selectedcontent>
					</button>
					{#each textureOptions as opt}
						<option value={String(opt.tileValue)}>
							<img class="tex-thumb" src={opt.img} alt="" />
							<span class="tex-label">{opt.label}</span>
						</option>
					{/each}
				</select>
			</label>
		{/if}

		{#if mode === 'sprite'}
			<label class="picker-label">
				<span class="toolbar-label">Sprite texture:</span>
				<select
					class="tex-select"
					value={String(spriteTexture)}
					onchange={(e) => (spriteTexture = Number(e.currentTarget.value))}
				>
					<button>
						<selectedcontent></selectedcontent>
					</button>
					{#each textureOptions as opt}
						<option value={String(opt.slot)}>
							<img class="tex-thumb" src={opt.img} alt="" />
							<span class="tex-label">{opt.label}</span>
						</option>
					{/each}
				</select>
			</label>
		{/if}

		<SpriteList
			{sprites}
			selectedIndex={selectedSpriteIndex}
			{textures}
			onselect={selectSprite}
			onremove={removeSprite}
		/>

		<SpritePanel sprite={selectedSprite} {textures} />

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

	/* --- base-select texture picker --- */

	.picker-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tex-select,
	.tex-select::picker(select) {
		appearance: base-select;
	}

	.tex-select {
		background: #222;
		border: 1px solid #555;
		color: #ccc;
		border-radius: 4px;
		font-size: 12px;
		cursor: pointer;
		align-items: center;
	}

	.tex-select button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 5px 8px;
		background: inherit;
		border: none;
		color: inherit;
		border-radius: inherit;
		font: inherit;
		cursor: pointer;
	}

	.tex-select button:hover {
		background: #2a2a2a;
	}

	.tex-select::picker(select) {
		background: #1a1a1a;
		border: 1px solid #555;
		border-radius: 6px;
		padding: 4px 0;
		max-height: 280px;
		overflow-y: auto;
	}

	.tex-select option {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 10px;
		color: #ccc;
		cursor: pointer;
	}

	.tex-select option:hover {
		background: #333;
	}

	.tex-select option:checked {
		background: #2a4a6a;
		color: #fff;
	}

	.tex-select option::checkmark {
		display: none;
	}

	.tex-thumb {
		width: 24px;
		height: 24px;
		image-rendering: pixelated;
		border-radius: 2px;
		flex-shrink: 0;
		border: 1px solid #444;
	}

	.tex-label {
		font-size: 12px;
		white-space: nowrap;
	}

	.tex-select selectedcontent {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	/* In the selected content button, keep the thumbnail smaller */
	.tex-select selectedcontent .tex-thumb {
		width: 20px;
		height: 20px;
	}

	.tex-thumb {
		display: block;
	}

	.tex-label {
		line-height: 1;
	}

	/* --- end base-select --- */

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
