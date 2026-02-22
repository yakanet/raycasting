<script lang="ts">
	import type { Sprite, TextureDef } from '$lib/engine';

	interface Props {
		sprite: Sprite | null;
		textures: TextureDef[];
	}

	let { sprite, textures }: Props = $props();
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
			<select
				class="tex-select"
				value={String(sprite.texture)}
				onchange={(e) => (sprite.texture = Number(e.currentTarget.value))}
			>
				<button>
					<selectedcontent></selectedcontent>
				</button>
				{#each textures as tex}
					<option value={String(tex.id)}>
						{#if tex.path}
							<img class="tex-thumb" src={tex.path} alt="" />
						{/if}
						<span class="tex-label">{tex.name}</span>
					</option>
				{/each}
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

	/* --- base-select --- */

	.tex-select,
	.tex-select::picker(select) {
		appearance: base-select;
	}

	.tex-select {
		background: #222;
		border: 1px solid #555;
		color: #fff;
		border-radius: 3px;
		font-size: 12px;
		cursor: pointer;
		flex: 1;
		align-items: center;
	}

	.tex-select button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 3px 6px;
		background: inherit;
		border: none;
		color: inherit;
		border-radius: inherit;
		font: inherit;
		cursor: pointer;
	}

	.tex-select::picker(select) {
		background: #1a1a1a;
		border: 1px solid #555;
		border-radius: 6px;
		padding: 4px 0;
		max-height: 240px;
		overflow-y: auto;
	}

	.tex-select option {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
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

	.tex-select selectedcontent {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tex-thumb {
		width: 20px;
		height: 20px;
		image-rendering: pixelated;
		border-radius: 2px;
		flex-shrink: 0;
		border: 1px solid #444;
		display: block;
	}

	.tex-label {
		font-size: 12px;
		white-space: nowrap;
		line-height: 1;
	}
</style>
