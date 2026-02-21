<script lang="ts">
	import RaycastCanvas from '$lib/components/RaycastCanvas.svelte';
</script>

<svelte:head>
	<title>Raycaster Engine</title>
</svelte:head>

<main>
	<RaycastCanvas />
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
