<script lang="ts">
	import { TEX_NAMES, TEX_COUNT } from '$lib/engine';
	import type { TextureImageMap } from '$lib/engine';

	const { data } = $props();

	let textureImages: TextureImageMap = $state(structuredClone(data.textureImages ?? {}));
	let uploading = $state<number | null>(null);
	let saving = $state(false);
	let statusMsg = $state('');

	const slots = Array.from({ length: TEX_COUNT }, (_, i) => i);

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

	async function save() {
		saving = true;
		statusMsg = '';
		try {
			const res = await fetch('/api/level', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					map: data.map,
					sprites: data.sprites,
					player: data.player,
					config: data.config,
					textureImages
				})
			});
			const result = await res.json();
			statusMsg = result.ok ? 'Saved!' : 'Error saving';
		} catch {
			statusMsg = 'Error saving';
		}
		saving = false;
	}
</script>

<div class="textures-page">
	<div class="header">
		<h2>Textures</h2>
		<div class="header-actions">
			<button class="btn-save" onclick={save} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
			{#if statusMsg}
				<span class="status">{statusMsg}</span>
			{/if}
		</div>
	</div>

	<div class="grid">
		{#each slots as slot}
			<div class="card">
				<div class="card-header">
					<span class="slot-name">{TEX_NAMES[slot] ?? `Slot ${slot}`}</span>
					{#if !textureImages[slot]}
						<span class="procedural-tag">Procedural</span>
					{/if}
				</div>

				<div class="preview-area">
					{#if textureImages[slot]}
						<img
							class="preview"
							src={textureImages[slot]}
							alt={TEX_NAMES[slot]}
						/>
					{:else}
						<div class="preview placeholder">?</div>
					{/if}
				</div>

				<div class="card-actions">
					<label class="btn-upload" class:disabled={uploading === slot}>
						{uploading === slot ? 'Uploading...' : 'Upload'}
						<input
							type="file"
							accept="image/png,image/jpeg,image/webp"
							onchange={(e) => handleFileInput(slot, e)}
							hidden
						/>
					</label>
					{#if textureImages[slot]}
						<button class="btn-clear" onclick={() => clearSlot(slot)}>Clear</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.textures-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	h2 {
		margin: 0;
		font-size: 20px;
		color: #fff;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.status {
		font-size: 12px;
		color: #8c8;
		font-family: monospace;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: 16px;
	}

	.card {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 6px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.slot-name {
		font-size: 13px;
		color: #ccc;
		font-weight: 500;
	}

	.procedural-tag {
		font-size: 10px;
		color: #777;
		font-style: italic;
		background: #222;
		padding: 1px 6px;
		border-radius: 3px;
	}

	.preview-area {
		display: flex;
		justify-content: center;
	}

	.preview {
		width: 64px;
		height: 64px;
		border: 1px solid #444;
		border-radius: 3px;
		image-rendering: pixelated;
		object-fit: cover;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: #222;
		color: #555;
		font-size: 24px;
	}

	.card-actions {
		display: flex;
		gap: 6px;
	}

	.btn-upload {
		flex: 1;
		background: #333;
		border: 1px solid #555;
		color: #aaa;
		padding: 5px 10px;
		font-size: 12px;
		cursor: pointer;
		border-radius: 4px;
		text-align: center;
	}

	.btn-upload:hover {
		background: #444;
		color: #fff;
	}

	.btn-upload.disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.btn-clear {
		background: #4a2a2a;
		border: 1px solid #6a4a4a;
		color: #ccc;
		padding: 5px 10px;
		font-size: 12px;
		cursor: pointer;
		border-radius: 4px;
	}

	.btn-clear:hover {
		background: #5a3a3a;
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
</style>
