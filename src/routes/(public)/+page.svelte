<script lang="ts">
	import { onMount } from 'svelte';
	import RaycastCanvas from '$lib/components/RaycastCanvas.svelte';
	import { buildTextures, DEFAULT_LEVEL_ID } from '$lib/engine';
	import type { TeleportTarget, Player, Sprite, WorldMap, EngineConfig, TextureDef } from '$lib/engine';
	import { fetchLevel } from './level.remote';

	let { data } = $props();

	function getInitial() { return data; }
	const initial = getInitial();
	let currentLevelId = $state(DEFAULT_LEVEL_ID);
	let map: WorldMap = $state(initial.map);
	let sprites: Sprite[] = $state(initial.sprites);
	let player: Player = $state(initial.player);
	let config: EngineConfig = $state(initial.config);
	let textures: TextureDef[] = $state(initial.textures);
	let cachedTextures: Uint8ClampedArray[] | undefined = $state(undefined);

	onMount(() => {
		buildTextures(config.textureSize, textures).then((built) => {
			cachedTextures = built;
		});
	});

	async function onTeleport(target: TeleportTarget) {
		const level = await fetchLevel({ levelId: target.levelId });
		map = level.map;
		sprites = level.sprites;
		player = target.spawnPos
			? { ...level.player, pos: target.spawnPos, ...(target.spawnDir ? { dir: target.spawnDir } : {}) }
			: level.player;
		config = level.config;
		textures = level.textures;
		currentLevelId = target.levelId;
	}
</script>

<svelte:head>
	<title>Raycaster Engine</title>
</svelte:head>

<main>
	{#key currentLevelId}
		<RaycastCanvas
			{map}
			{sprites}
			{player}
			{config}
			{textures}
			preloadedTextures={cachedTextures}
			{onTeleport}
		/>
	{/key}
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
