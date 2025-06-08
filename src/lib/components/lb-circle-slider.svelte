<script lang="ts">
	import { _ } from 'svelte-i18n';

	let { min, max, step, actual, target, onValueChangeEnd } = $props();

	let radius = 140;
	let loc = {x: 160, y: 160};
	let isDragging = false;
	let sliderDragOffset = {dx: 0, dy: 0};
	let trackSelected = false;

	let cx = $state(0);
	let cy = $state(0);

	let actualTemp: number = $state(actual);
	let targetTemp: number = $state(target);

	let actualTempDisplay = $derived(String(Number(actualTemp).toFixed(1)).split('.'));
	let targetTempDisplay = $derived(String(Number(targetTemp).toFixed(1)).split('.'));

	function setSliderValue(value: number) {
		targetTemp = Math.max(min, Math.min(value, max));
		let knobRotation = (targetTemp-min) * 0.75 * 2 * Math.PI / (max-min) - 0.25 * Math.PI;
		cx = loc.x - Math.cos(knobRotation) * radius;
		cy = loc.y - Math.sin(knobRotation) * radius;
	}

	function mouseMove(e: any)	{
		if (!isDragging && !trackSelected) return;
		let x = e.offsetX;
		let y = e.offsetY;
		x = (x-loc.x);
		y = (y-loc.y);
		let angle =  Math.atan2(-y, -x);
		angle = (angle < -0.5 * Math.PI ) ? angle + 2 * Math.PI : angle;
		let value = (angle + 0.25 * Math.PI) / ( 0.75 * 2 * Math.PI / (max-min) );
		setSliderValue(value+min);
	}

  function knobMouseDown(e: any) {
	  isDragging = true;
  }

  function trackMouseDown(e: any) {
		trackSelected = true;
		mouseMove(e);
  }

	function mouseUp(e: any) {
		isDragging = false;
		trackSelected = false;
		onValueChangeEnd({ value: targetTemp });
	}

	setSliderValue(targetTemp);
</script>

<div class="w-full flex align-center justify-center">
	<svg width="320" height="320" on:mouseup={mouseUp} on:mousemove={mouseMove}>
		<circle cx={loc.x} cy={loc.y} r={radius} on:mousedown={trackMouseDown}/>
		<circle cx={cx} cy={cy} r="12" on:mousedown={knobMouseDown}/>
		<text x="160" y="90" text-anchor="middle" fill="white" font-size="20px">{$_('Actual')}</text>
		<text x="160" y="175" text-anchor="middle" fill="white" font-size="80px">{actualTempDisplay[0]}<tspan dx="5" dy="-28" font-size="40px">{actualTempDisplay[1]}</tspan></text>
		<text x="160" y="220" text-anchor="middle" fill="white" font-size="20px">{$_('Set to')} {targetTempDisplay[0]}<tspan dx="3" dy="-6" font-size="12px">{targetTempDisplay[1]}</tspan></text>
	</svg>
</div>

<style>
svg {
	cursor: default;
}
circle {
	fill: none;
}
circle:nth-child(1) {
	cursor: pointer;
	stroke: rgba(0,0,0,1);
	stroke-width: 15px;
	stroke-dasharray: 660;
	transform-origin: center;
	transform: rotate(135deg);
	stroke-linecap: round;
	z-index: 1;
}
circle:nth-child(2) {
	cursor: pointer;
	fill: #00c951; // TODO palette
	z-index: 2;
}
</style>
