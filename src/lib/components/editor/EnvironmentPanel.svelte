<script lang="ts">
	import type { EnvironmentConfig, TextureDef } from '$lib/engine';
	import TextureSelect from './TextureSelect.svelte';

	interface Props {
		environment: EnvironmentConfig;
		textures: TextureDef[];
	}

	let { environment, textures }: Props = $props();
</script>

<div class="panel">
	<h3>Environment</h3>
	<label>
		Floor Color
		<input type="color" bind:value={environment.floorColor} />
		<span class="color-val">{environment.floorColor}</span>
	</label>
	<label>
		Ceiling Color
		<input type="color" bind:value={environment.ceilingColor} />
		<span class="color-val">{environment.ceilingColor}</span>
	</label>
	<div class="tex-row">
		<TextureSelect
			{textures}
			bind:value={environment.floorTexture}
			allowNone
			label="Floor Texture"
		/>
	</div>
	<div class="tex-row">
		<TextureSelect
			{textures}
			bind:value={environment.ceilingTexture}
			allowNone
			label="Ceiling Texture"
		/>
	</div>
</div>

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

	input[type='color'] {
		width: 32px;
		height: 24px;
		border: 1px solid #555;
		background: none;
		padding: 0;
		cursor: pointer;
	}

	.color-val {
		font-family: monospace;
		font-size: 11px;
		color: #888;
	}

	.tex-row {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
