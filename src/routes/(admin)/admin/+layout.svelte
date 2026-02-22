<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let pathname = $derived($page.url.pathname);
</script>

<svelte:head>
	<title>{pathname === '/admin/textures' ? 'Textures' : 'Level Editor'}</title>
</svelte:head>

<div class="admin-shell">
	<nav class="admin-nav">
		<a href="/admin" class:active={pathname === '/admin'}>Level Editor</a>
		<a href="/admin/textures" class:active={pathname === '/admin/textures'}>Textures</a>
		<a href="/" data-sveltekit-preload-data="off">Play</a>
	</nav>

	<div class="admin-content">
		{@render children()}
	</div>
</div>

<style>
	.admin-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	.admin-nav {
		flex-shrink: 0;
		display: flex;
		gap: 0;
		background: #1a1a1a;
		border-bottom: 1px solid #333;
		padding: 0 16px;
	}

	.admin-nav a {
		color: #999;
		text-decoration: none;
		padding: 10px 16px;
		font-size: 13px;
		border-bottom: 2px solid transparent;
		transition: color 0.15s, border-color 0.15s;
	}

	.admin-nav a:hover {
		color: #fff;
	}

	.admin-nav a.active {
		color: #fff;
		border-bottom-color: #5a8aba;
	}

	.admin-content {
		flex: 1;
		overflow: hidden;
	}
</style>
