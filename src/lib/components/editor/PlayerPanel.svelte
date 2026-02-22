<script lang="ts">
	import type { Player } from '$lib/engine';

	interface Props {
		player: Player;
	}

	let { player }: Props = $props();

	let angleDeg = $derived(Math.round((Math.atan2(player.dir.y, player.dir.x) * 180) / Math.PI));

	function setAngle(deg: number) {
		const rad = (deg * Math.PI) / 180;
		player.dir.x = Math.cos(rad);
		player.dir.y = Math.sin(rad);
		// Plane is perpendicular to dir, scaled by FOV factor (0.66)
		player.plane.x = -player.dir.y * 0.66;
		player.plane.y = player.dir.x * 0.66;
	}
</script>

<div class="panel">
	<h3>Player Spawn</h3>
	<label>
		X <input type="number" step="0.1" bind:value={player.pos.x} />
	</label>
	<label>
		Y <input type="number" step="0.1" bind:value={player.pos.y} />
	</label>
	<label>
		Angle (°)
		<input
			type="number"
			step="5"
			value={angleDeg}
			onchange={(e) => setAngle(Number(e.currentTarget.value))}
		/>
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
</style>
