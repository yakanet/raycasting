<script lang="ts">
	import { DEFAULT_CONFIG } from '$lib/engine';
	import type { Player, EngineConfig } from '$lib/engine';

	import PlayerPanel from '$lib/components/editor/PlayerPanel.svelte';
	import ConfigPanel from '$lib/components/editor/ConfigPanel.svelte';

	const { data } = $props();

	let player: Player = $state(structuredClone(data.player));
	let config: EngineConfig = $state(structuredClone(data.config));

	let saving = $state(false);
	let statusMsg = $state('');

	function loadDefaults() {
		player = {
			pos: { x: 2, y: 2 },
			dir: { x: 1, y: 0 },
			plane: { x: 0, y: 0.66 }
		};
		config = { ...DEFAULT_CONFIG };
		statusMsg = 'Defaults loaded';
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
					player,
					config,
					textureImages: data.textureImages,
					customTextureNames: data.customTextureNames
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

<div class="settings-page">
	<div class="header">
		<h2>Game Settings</h2>
		<div class="header-actions">
			<button class="btn-save" onclick={save} disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
			<button class="btn-defaults" onclick={loadDefaults}>Load Defaults</button>
			{#if statusMsg}
				<span class="status">{statusMsg}</span>
			{/if}
		</div>
	</div>

	<div class="panels">
		<PlayerPanel {player} />
		<ConfigPanel {config} />
	</div>
</div>

<style>
	.settings-page {
		max-width: 600px;
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

	.panels {
		display: flex;
		flex-direction: column;
		gap: 16px;
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
</style>
