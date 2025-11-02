<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/Store.svelte';	

	let { min, max, step, actual, target, onValueChange, manual } = $props();

	let isDragging = false;
	let trackSelected = false;

	let trackMin = 20;
	let trackMax = 380;
	let trackRatio = (max - min) / (trackMax - trackMin);

	let targetTempLimit = $derived(Math.max(min, Math.min(target, max)));
	let actualTempLimit = $derived(Math.max(min, Math.min(actual, max)));
	
	let targetPos = $derived(((targetTempLimit-min)/trackRatio + trackMin) || 0);
	let actualPos = $derived(((actualTempLimit-min)/trackRatio + trackMin) || 0);

	function mouseMove(e: any)	{
		if (!isDragging && !trackSelected) return;
		let x = Math.max(trackMin, Math.min(e.offsetX, trackMax));
		targetTempLimit = (x-trackMin)*trackRatio + min;
		onValueChange({ value: Math.round(targetTempLimit*10)/10 });
	}

	function targetMouseDown(e: any) {
		if (manual) {
			isDragging = true; /* only allow dragging when manual is enabled */
		}
	}

	function trackMouseDown(e: any) {
		if (manual) {
			trackSelected = true;
			isDragging = true;
			mouseMove(e);
		}
	}

	function mouseUp(e: any) {
		isDragging = false;
		trackSelected = false;
	}
</script>

<div class="w-full" >
	<svg width="100%" height="48" onmouseup={mouseUp} onmousemove={mouseMove}>
		<defs>
			<linearGradient id="grad">
				<stop offset="0%" stop-color="#33ADFF" />
				<stop offset="100%" stop-color="#FFA200" />
			</linearGradient>
		</defs>
		<rect class="track" x="10" y="15" width="95%" height="20" fill="url(#grad)" onmousedown={trackMouseDown}/>
		<circle class="actual" cx={actualPos} cy="25" r="12"/>
		<circle class="target" cx={targetPos} cy="25" r="12" onmousedown={targetMouseDown}/>
	</svg>
</div>

<style>
	.track {
		rx: 10;
		ry: 10;
	}
	.actual {
		fill: none;
		stroke: light-dark(var(--color-surface-950), var(--color-surface-50));
		stroke-width: 3px;
		z-index: 2;
	}
	.target {
		cursor: pointer;
		fill: light-dark(var(--color-surface-950), var(--color-surface-50));
		stroke: light-dark(var(--color-surface-950), var(--color-surface-50));
		stroke-width: 3px;
		z-index: 3;
	}
</style>
