<script lang="ts">
	import RaycastCanvas from '$lib/components/RaycastCanvas.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Raycaster Engine</title>
</svelte:head>

<main>
	<RaycastCanvas
		map={data.map}
		sprites={data.sprites}
		player={data.player}
		config={data.config}
	/>
</main>

<style>
	:global(body) {
		margin: 0;
		background: #111;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		overflow: hidden;
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
