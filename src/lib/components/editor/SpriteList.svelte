<script lang="ts">
	import type { Sprite, TextureDef } from '$lib/engine';

	interface Props {
		sprites: Sprite[];
		selectedIndex: number;
		textures: TextureDef[];
		onselect: (index: number) => void;
		onremove: (index: number) => void;
	}

	let { sprites, selectedIndex, textures, onselect, onremove }: Props = $props();
</script>

<div class="sprite-list">
	<h3>Sprites ({sprites.length})</h3>
	<div class="list">
		{#each sprites as sprite, i}
			<div
				class="sprite-item"
				class:selected={i === selectedIndex}
				role="button"
				tabindex="0"
				onclick={() => onselect(i)}
				onkeydown={(e) => e.key === 'Enter' && onselect(i)}
			>
				<span class="sprite-info">
					#{i} — {textures.find(t => t.id === sprite.texture)?.name ?? `tex ${sprite.texture}`} ({sprite.pos.x.toFixed(1)}, {sprite.pos.y.toFixed(1)})
				</span>
				<button
					class="remove-btn"
					onclick={(e: MouseEvent) => { e.stopPropagation(); onremove(i); }}
				>✕</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.sprite-list {
		border: 1px solid #444;
		border-radius: 4px;
		padding: 8px;
		background: #1a1a1a;
	}

	h3 {
		margin: 0 0 8px;
		font-size: 13px;
		color: #ccc;
	}

	.list {
		max-height: 200px;
		overflow-y: auto;
	}

	.sprite-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 6px;
		cursor: pointer;
		border-radius: 3px;
		font-size: 12px;
		color: #aaa;
	}

	.sprite-item:hover {
		background: #333;
	}

	.sprite-item.selected {
		background: #2a4a6a;
		color: #fff;
	}

	.sprite-info {
		font-family: monospace;
	}

	.remove-btn {
		background: none;
		border: none;
		color: #f66;
		cursor: pointer;
		font-size: 14px;
		padding: 0 4px;
	}
</style>
