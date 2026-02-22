<script lang="ts">
	import type { EngineConfig } from '$lib/engine';

	interface Props {
		config: EngineConfig;
	}

	let { config }: Props = $props();
</script>

<div class="panel">
	<h3>Engine Config</h3>
	<label>
		Screen Width
		<input type="number" step="1" bind:value={config.screenWidth} />
	</label>
	<label>
		Screen Height
		<input type="number" step="1" bind:value={config.screenHeight} />
	</label>
	<label>
		Texture Size
		<input type="number" step="1" bind:value={config.textureSize} />
	</label>
	<label>
		Move Speed
		<input type="number" step="0.005" bind:value={config.moveSpeed} />
	</label>
	<label>
		Rotation Speed
		<input type="number" step="0.005" bind:value={config.rotSpeed} />
	</label>
	<label>
		Floor Color
		<input type="color" bind:value={config.floorColor} />
		<span class="color-val">{config.floorColor}</span>
	</label>
	<label>
		Ceiling Color
		<input type="color" bind:value={config.ceilingColor} />
		<span class="color-val">{config.ceilingColor}</span>
	</label>
	<label>
		Floor Texture Slot
		<input type="number" step="1" min="0" bind:value={config.floorTexture} />
	</label>
	<label>
		Ceiling Texture Slot
		<input type="number" step="1" min="0" bind:value={config.ceilingTexture} />
	</label>
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

	input[type='number'] {
		width: 70px;
		background: #222;
		border: 1px solid #555;
		color: #fff;
		padding: 2px 4px;
		font-size: 12px;
		border-radius: 3px;
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
</style>
