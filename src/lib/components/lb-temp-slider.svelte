<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';	

	let { min, max, step, actual, target, onValueChangeEnd, manual } = $props();

	let isDragging = false;
	let trackSelected = false;
	let symbol = ' °C' // TODO Fahrenheit

	let trackMin = 25;
	let trackMax = 370;
	let trackRatio = (max - min) / (trackMax - trackMin);

	let targetTempLimit = $derived(Math.max(min, Math.min(target, max)));
	let actualTempLimit = $derived(Math.max(min, Math.min(actual, max)));
	
	let knobPos = $derived((targetTempLimit-min)/trackRatio + trackMin);
	let setPos = $derived((actualTempLimit-min)/trackRatio + trackMin);

	function mouseMove(e: any)	{
		if (!isDragging && !trackSelected) return;
		let x = Math.max(trackMin, Math.min(e.offsetX, trackMax));
		targetTempLimit = (x-trackMin)*trackRatio + min;
	}

	function format(temp: number) {
		return temp.toLocaleString(store.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + symbol;
	}

	function knobMouseDown(e: any) {
		//if (manual) {
			isDragging = true;  /* only allow dragging when manual is enabled */
		//}
  }

  function trackMouseDown(e: any) {
		trackSelected = true;
		mouseMove(e);
  }

	function mouseUp(e: any) {
		isDragging = false;
		trackSelected = false;
		onValueChangeEnd({ value: targetTempLimit });	
	}
</script>

<div class="w-full h-full flex flex-col items-center justify-center mb-1">
	<div class="mt-1 text-lg dark:text-surface-300 text-surface-700 ">Actual: {format(actualTempLimit)}</div>
	<svg width="100%" height="48" onmouseup={mouseUp} onmousemove={mouseMove}>
		<path class="track" d="M{trackMin} 25 H {trackMax}" onmousedown={trackMouseDown}/>
		<circle class="set" cx={setPos} cy="25" r="12"/>
		<circle class="knob" cx={knobPos} cy="25" r="12" onmousedown={knobMouseDown}/>
	</svg>
	<div class="text-lg dark:text-primary-500 text-primary-700">Target: {format(targetTempLimit)}</div>
</div>

<style>
	.track {
		position: absolute;
		fill: none;
		cursor: pointer;
		stroke: light-dark(var(--color-surface-200), var(--color-surface-800));
		stroke-width: 20px;
		stroke-linecap: round;
		z-index: 1;
	}
	.set {
		fill: #737373; /* TODO palette */
		z-index: 2;
	}
	.knob {
		cursor: pointer;
		fill: var(--color-primary-500);
		z-index: 3;
	}
</style>
