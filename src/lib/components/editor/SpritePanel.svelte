<script lang="ts">
	import { TEX_BARREL, TEX_PILLAR, TEX_COIN, TEX_BOMB } from '$lib/engine';
	import type { Sprite } from '$lib/engine';

	interface Props {
		sprite: Sprite | null;
	}

	let { sprite }: Props = $props();
</script>

{#if sprite}
	<div class="panel">
		<h3>Sprite Properties</h3>
		<label>
			X <input type="number" step="0.1" bind:value={sprite.pos.x} />
		</label>
		<label>
			Y <input type="number" step="0.1" bind:value={sprite.pos.y} />
		</label>
		<label>
			Texture
			<select bind:value={sprite.texture}>
				<option value={TEX_BARREL}>Barrel</option>
				<option value={TEX_PILLAR}>Pillar</option>
				<option value={TEX_COIN}>Coin</option>
				<option value={TEX_BOMB}>Bomb</option>
			</select>
		</label>
		<label class="checkbox">
			<input type="checkbox" bind:checked={sprite.solid} />
			Solid
		</label>
		<label class="checkbox">
			<input type="checkbox" bind:checked={sprite.collectible} />
			Collectible
		</label>
		<label>
			Radius <input type="number" step="0.05" min="0" bind:value={sprite.radius} />
		</label>
		<label>
			Scale <input type="number" step="0.1" min="0.1" bind:value={sprite.scale} />
		</label>
	</div>
{:else}
	<div class="panel empty">
		<p>Select a sprite to edit</p>
	</div>
{/if}

<style>
	.panel {
		border: 1px solid #444;
		border-radius: 4px;
		padding: 8px;
		background: #1a1a1a;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.panel.empty p {
		color: #666;
		font-size: 12px;
		margin: 0;
	}

	h3 {
		margin: 0 0 4px;
		font-size: 13px;
		color: #ccc;
	}

	label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: #aaa;
	}

	label.checkbox {
		flex-direction: row-reverse;
		justify-content: flex-end;
	}

	input[type='number'] {
		width: 70px;
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 2px 4px;
		font-size: 12px;
		border-radius: 3px;
	}

	select {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 2px 4px;
		font-size: 12px;
		border-radius: 3px;
	}
</style>
