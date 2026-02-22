<script lang="ts">
	import type { TextureDef } from '$lib/engine';

	const { data } = $props();

	let textures: TextureDef[] = $state(structuredClone(data.textures));
	let uploading = $state<number | null>(null);
	let saving = $state(false);
	let statusMsg = $state('');
	let newTextureName = $state('');

	function getNextId(): number {
		if (textures.length === 0) return 0;
		return Math.max(...textures.map((t) => t.id)) + 1;
	}

	function addTexture() {
		const name = newTextureName.trim();
		if (!name) return;
		textures.push({ id: getNextId(), name, path: '' });
		newTextureName = '';
	}

	function deleteTexture(id: number) {
		const idx = textures.findIndex((t) => t.id === id);
		if (idx !== -1) textures.splice(idx, 1);
	}

	async function saveQuiet() {
		await fetch('/api/level', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				map: data.map,
				sprites: data.sprites,
				player: data.player,
				config: data.config,
				textures
			})
		});
	}

	async function uploadTexture(id: number, file: File) {
		uploading = id;
		try {
			await saveQuiet();

			const form = new FormData();
			form.append('file', file);
			form.append('slot', String(id));

			const res = await fetch('/api/textures', { method: 'POST', body: form });
			const result = await res.json();

			if (result.ok) {
				const tex = textures.find((t) => t.id === id);
				if (tex) tex.path = result.url;
				await saveQuiet();
			}
		} catch (e) {
			console.error('Upload failed', e);
		}
		uploading = null;
	}

	function clearSlot(id: number) {
		const tex = textures.find((t) => t.id === id);
		if (tex) tex.path = '';
	}

	function handleFileInput(id: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			uploadTexture(id, file);
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
					textures
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

	<div class="add-texture">
		<input
			type="text"
			placeholder="New texture name..."
			bind:value={newTextureName}
			onkeydown={(e) => e.key === 'Enter' && addTexture()}
		/>
		<button class="btn-add" onclick={addTexture} disabled={!newTextureName.trim()}>
			Add Texture
		</button>
	</div>

	<div class="grid">
		{#each textures as tex (tex.id)}
			<div class="card">
				<div class="card-header">
					<span class="slot-name">{tex.name}</span>
					<span class="slot-id">#{tex.id}</span>
				</div>

				<div class="preview-area">
					{#if tex.path}
						<img
							class="preview"
							src={tex.path}
							alt={tex.name}
						/>
					{:else}
						<div class="preview placeholder">?</div>
					{/if}
				</div>

				<div class="card-actions">
					<label class="btn-upload" class:disabled={uploading === tex.id}>
						{uploading === tex.id ? 'Uploading...' : 'Upload'}
						<input
							type="file"
							accept="image/png,image/jpeg,image/webp"
							onchange={(e) => handleFileInput(tex.id, e)}
							hidden
						/>
					</label>
					<button class="btn-delete" onclick={() => deleteTexture(tex.id)}>Delete</button>
					{#if tex.path}
						<button class="btn-clear" onclick={() => clearSlot(tex.id)}>Clear</button>
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

	.add-texture {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
	}

	.add-texture input {
		flex: 1;
		max-width: 300px;
		background: #222;
		border: 1px solid #444;
		color: #ccc;
		padding: 6px 10px;
		font-size: 13px;
		border-radius: 4px;
		outline: none;
	}

	.add-texture input:focus {
		border-color: #5a8aba;
	}

	.btn-add {
		background: #2a4a6a;
		border: 1px solid #5a8aba;
		color: #fff;
		padding: 6px 16px;
		font-size: 13px;
		cursor: pointer;
		border-radius: 4px;
	}

	.btn-add:hover {
		background: #3a5a7a;
	}

	.btn-add:disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

	.slot-id {
		font-size: 10px;
		color: #555;
		font-family: monospace;
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

	.btn-delete {
		background: #4a2a2a;
		border: 1px solid #6a4a4a;
		color: #ccc;
		padding: 5px 10px;
		font-size: 12px;
		cursor: pointer;
		border-radius: 4px;
	}

	.btn-delete:hover {
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
