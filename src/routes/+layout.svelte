<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
		background: #111;
		color: #ddd;
		font-family: system-ui, -apple-system, sans-serif;
	}
</style>
