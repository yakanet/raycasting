<script lang="ts">
	import type { TextureDef } from '$lib/engine';
	import atlasManifest from 'virtual:texture-atlas';
	import TextureThumb from './TextureThumb.svelte';

	interface Option {
		value: number;
		label: string;
		slot: number;
	}

	interface Props {
		textures: TextureDef[];
		value: number;
		/** If true, adds a "None" option (value = offset - 1) */
		allowNone?: boolean;
		/** Offset applied to texture id: emitted value = t.id + offset. Default 1 (1-based, 0 = none). Use 0 for 0-based. */
		offset?: number;
		label?: string;
	}

	let { textures, value = $bindable(), allowNone = false, offset = 1, label }: Props = $props();

	function getOffset() { return offset; }
	const _offset = getOffset();
	const noneValue = _offset - 1;

	let atlasSlots = $derived(new Set(atlasManifest.entries.map((e) => e.slot)));

	let options = $derived(
		textures
			.filter((t) => atlasSlots.has(t.id))
			.sort((a, b) => a.id - b.id)
			.map((t): Option => ({
				value: t.id + _offset,
				label: t.name,
				slot: t.id
			}))
	);
</script>

{#if label}
	<span class="label">{label}</span>
{/if}
<select
	class="tex-select"
	value={String(value)}
	onchange={(e) => (value = Number(e.currentTarget.value))}
>
	<button>
		<selectedcontent></selectedcontent>
	</button>
	{#if allowNone}
		<option value={String(noneValue)}>
			<span class="tex-none">—</span>
			<span class="tex-label">None</span>
		</option>
	{/if}
	{#each options as opt}
		<option value={String(opt.value)}>
			<TextureThumb slot={opt.slot} size={24} />
			<span class="tex-label">{opt.label}</span>
		</option>
	{/each}
</select>

<style>
	.label {
		font-size: 12px;
		color: #888;
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

	.tex-none {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 2px;
		flex-shrink: 0;
		border: 1px dashed #555;
		color: #666;
		font-size: 16px;
	}

	.tex-label {
		font-size: 12px;
		white-space: nowrap;
		line-height: 1;
	}

	.tex-select selectedcontent {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.tex-select selectedcontent .tex-none {
		width: 20px;
		height: 20px;
	}

	.tex-select selectedcontent :global(.thumb) {
		width: 20px;
		height: 20px;
	}
</style>
