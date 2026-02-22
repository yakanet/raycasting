<script lang="ts">
	import type { TextureDef } from '$lib/engine';

	interface Option {
		value: number;
		label: string;
		img: string;
	}

	interface Props {
		textures: TextureDef[];
		value: number;
		onchange: (value: number) => void;
		/** If true, adds a "None" option (value = offset - 1) */
		allowNone?: boolean;
		/** Offset applied to texture id: emitted value = t.id + offset. Default 1 (1-based, 0 = none). Use 0 for 0-based. */
		offset?: number;
		label?: string;
	}

	const { textures, value, onchange, allowNone = false, offset = 1, label }: Props = $props();

	function getOffset() { return offset; }
	const _offset = getOffset();
	const noneValue = _offset - 1;

	let options = $derived(
		textures
			.filter((t) => t.path)
			.sort((a, b) => a.id - b.id)
			.map((t): Option => ({
				value: t.id + _offset,
				label: t.name,
				img: t.path
			}))
	);
</script>

{#if label}
	<span class="label">{label}</span>
{/if}
<select
	class="tex-select"
	value={String(value)}
	onchange={(e) => onchange(Number(e.currentTarget.value))}
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
			<img class="tex-thumb" src={opt.img} alt="" />
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

	.tex-thumb {
		width: 24px;
		height: 24px;
		image-rendering: pixelated;
		border-radius: 2px;
		flex-shrink: 0;
		border: 1px solid #444;
		display: block;
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

	.tex-select selectedcontent .tex-thumb,
	.tex-select selectedcontent .tex-none {
		width: 20px;
		height: 20px;
	}
</style>
