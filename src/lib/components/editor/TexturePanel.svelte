<script lang="ts">
	import { TEX_NAMES, TEX_COUNT } from '$lib/engine';
	import type { TextureImageMap } from '$lib/engine';

	interface Props {
		textureImages: TextureImageMap;
	}

	let { textureImages }: Props = $props();

	let uploading = $state<number | null>(null);

	async function uploadTexture(slot: number, file: File) {
		uploading = slot;
		try {
			const form = new FormData();
			form.append('file', file);
			form.append('slot', String(slot));

			const res = await fetch('/api/textures', { method: 'POST', body: form });
			const result = await res.json();

			if (result.ok) {
				textureImages[slot] = result.url;
			}
		} catch (e) {
			console.error('Upload failed', e);
		}
		uploading = null;
	}

	function clearSlot(slot: number) {
		delete textureImages[slot];
	}

	function handleFileInput(slot: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			uploadTexture(slot, file);
			input.value = '';
		}
	}
</script>

<div class="texture-panel">
	<h3>Textures</h3>
	<div class="slot-list">
		{#each Array.from({ length: TEX_COUNT }, (_, i) => i) as slot}
			<div class="slot-row">
				<span class="slot-label">{TEX_NAMES[slot] ?? `Slot ${slot}`}</span>
				{#if textureImages[slot]}
					<img
						class="slot-preview"
						src={textureImages[slot]}
						alt={TEX_NAMES[slot]}
					/>
					<button class="btn-clear" onclick={() => clearSlot(slot)}>Clear</button>
				{:else}
					<span class="procedural-tag">Procedural</span>
				{/if}
				<label class="btn-upload" class:disabled={uploading === slot}>
					{uploading === slot ? '...' : 'Upload'}
					<input
						type="file"
						accept="image/png,image/jpeg,image/webp"
						onchange={(e) => handleFileInput(slot, e)}
						hidden
					/>
				</label>
			</div>
		{/each}
	</div>
</div>

<style>
	.texture-panel {
		border-top: 1px solid #333;
		padding-top: 8px;
	}

	h3 {
		margin: 0 0 8px;
		font-size: 14px;
		color: #aaa;
	}

	.slot-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.slot-row {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
	}

	.slot-label {
		flex: 1;
		color: #ccc;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.slot-preview {
		width: 24px;
		height: 24px;
		border: 1px solid #555;
		border-radius: 2px;
		object-fit: cover;
		image-rendering: pixelated;
	}

	.procedural-tag {
		color: #666;
		font-style: italic;
		font-size: 11px;
	}

	.btn-upload {
		background: #333;
		border: 1px solid #555;
		color: #aaa;
		padding: 2px 8px;
		font-size: 11px;
		cursor: pointer;
		border-radius: 3px;
	}

	.btn-upload:hover {
		background: #444;
	}

	.btn-upload.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.btn-clear {
		background: #4a2a2a;
		border: 1px solid #6a4a4a;
		color: #ccc;
		padding: 2px 6px;
		font-size: 11px;
		cursor: pointer;
		border-radius: 3px;
	}

	.btn-clear:hover {
		background: #5a3a3a;
	}
</style>
