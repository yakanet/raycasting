<script lang="ts">
	import { untrack } from 'svelte';
	import type { Player, GlobalConfig, EnvironmentConfig } from '$lib/engine';

	import PlayerPanel from '$lib/components/editor/PlayerPanel.svelte';
	import ConfigPanel from '$lib/components/editor/ConfigPanel.svelte';
	import EnvironmentPanel from '$lib/components/editor/EnvironmentPanel.svelte';
	import { saveLevel, saveGameConfig } from '../level.remote';

	const { data } = $props();
	const initial = untrack(() => structuredClone(data));

	let player: Player = $state(structuredClone(initial.player));
	let globalConfig: GlobalConfig = $state(structuredClone(initial.globalConfig));
	let environment: EnvironmentConfig = $state(structuredClone(initial.environment));

	let saving = $state(false);
	let statusMsg = $state('');

	async function save() {
		saving = true;
		statusMsg = '';
		try {
			const [levelResult, configResult] = await Promise.all([
				saveLevel({
					levelId: data.levelId,
					name: data.levelName,
					map: data.map,
					sprites: data.sprites,
					player,
					environment
				}),
				saveGameConfig({
					config: globalConfig,
					textures: data.textures
				})
			]);
			statusMsg = levelResult.ok && configResult.ok ? 'Saved!' : 'Error saving';
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
			{#if statusMsg}
				<span class="status" class:error={statusMsg.startsWith('Error')}>{statusMsg}</span>
			{/if}
		</div>
	</div>

	<div class="panels">
		<PlayerPanel {player} />
		<ConfigPanel config={globalConfig} />
		<EnvironmentPanel {environment} textures={data.textures} />
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

	.status.error {
		color: #e55;
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

</style>
