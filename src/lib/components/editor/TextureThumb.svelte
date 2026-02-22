<script lang="ts">
	import atlasManifest from 'virtual:texture-atlas';

	interface Props {
		slot: number;
		size?: number;
	}

	let { slot, size = 24 }: Props = $props();

	let entry = $derived(atlasManifest.entries.find((e) => e.slot === slot));
	let totalWidth = $derived(
		(Math.max(...atlasManifest.entries.map((e) => e.slot)) + 1) * atlasManifest.textureSize
	);
</script>

{#if entry}
	<span
		class="thumb"
		style="
			width:{size}px;
			height:{size}px;
			background: url({atlasManifest.atlas}) -{entry.x}px 0 / {totalWidth}px {atlasManifest.textureSize}px;
			image-rendering: pixelated;
		"
	></span>
{/if}

<style>
	.thumb {
		display: inline-block;
		border-radius: 2px;
		border: 1px solid #444;
		flex-shrink: 0;
	}
</style>
