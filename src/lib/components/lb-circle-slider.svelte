<script lang="ts">
	import { _ } from 'svelte-i18n';

	let { min, max, step, actual, target, onValueChangeEnd } = $props();

	let radius = 140;
	let loc = {x: 160, y: 160};
	let isDragging = false;
	let trackSelected = false;
	let interval: NodeJS.Timeout;
	let delay = 100;
	let symbol = '°C' // TODO Fahrenheit

	let knob = $state({x: 0, y: 0});
	let set = $state({x: 0, y: 0});

	let actualTemp: number = $state(actual);
	let targetTemp: number = $state(target);

	let actualTempDisplay = $derived(String(Number(actualTemp).toFixed(1)).split('.'));
	let targetTempDisplay = $derived(String(Number(targetTemp).toFixed(1)).split('.'));

	function calcXY(value: number) {
		let angle = (value - min) * 0.75 * 2 * Math.PI / (max - min) - 0.25 * Math.PI;
		return {
			x: loc.x - Math.cos(angle) * radius,
			y: loc.y - Math.sin(angle) * radius
		}
	}

	function setKnobValue(value: number) {
		targetTemp = Math.max(min, Math.min(value, max));
		let pos = calcXY(targetTemp);
		knob.x = pos.x;
		knob.y = pos.y;
	}

	function setActualValue(value: number) {
		actualTemp = Math.max(min, Math.min(value, max));
		let pos = calcXY(actualTemp);
		set.x = pos.x;
		set.y = pos.y;
	}

	function mouseMove(e: any)	{
		if (!isDragging && !trackSelected) return;
		let x = e.offsetX;
		let y = e.offsetY;
		x -= loc.x;
		y -= loc.y;
		let angle = Math.atan2(-y, -x);
		angle = (angle < -0.5 * Math.PI ) ? angle + 2 * Math.PI : angle;
		let value = (angle + 0.25 * Math.PI) / ( 0.75 * 2 * Math.PI / (max-min) );
		setKnobValue(value + min);
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

	function startUp(e:any) {
		setKnobValue(targetTemp += step);
		interval = setInterval(() => {
			setKnobValue(targetTemp += step);
		}, delay);
	}

	function startDown(e:any) {
		setKnobValue(targetTemp -= step);
		interval = setInterval(() => {
			setKnobValue(targetTemp -= step);
		}, delay);
	}

	function endUp(e:any) {
		clearInterval(interval);
	}

	function endDown(e:any) {
		clearInterval(interval);
	}

	setKnobValue(targetTemp);
	setActualValue(actualTemp);
</script>

<div class="w-full flex align-center justify-center">
	<svg width="320" height="320" onmouseup={mouseUp} onmousemove={mouseMove}>
		<circle class="track" cx={loc.x} cy={loc.y} r={radius} onmousedown={trackMouseDown}/>
		<circle class="set" cx={set.x} cy={set.y} r="12"/>
		<circle class="knob" cx={knob.x} cy={knob.y} r="12" onmousedown={knobMouseDown}/>
		<text x="157" y="90" text-anchor="middle" fill="#737373" font-size="20px">&#9679; <tspan fill="white">{$_('Actual')}</tspan></text>
		<text x="160" y="175" text-anchor="middle" fill="white" font-size="80px">{actualTempDisplay[0]}<tspan dx="5" dy="-28" font-size="40px">{actualTempDisplay[1]}</tspan></text>
		<text x="157" y="220" text-anchor="middle" fill="#00c951" font-size="18px">&#9679; <tspan fill="white">{$_('Target')} {targetTempDisplay[0]}<tspan dx="2" dy="-6" font-size="10px">{targetTempDisplay[1]}</tspan></text>
		<text x="225" y="176" text-anchor="middle" fill="#737373" font-size="24px">{symbol}</text>
		<svg class="button" x="105" y="260" onmousedown={startDown} onmouseup={endDown}>
			<circle cx="20" cy="20" r="20" fill="black"/>
			<path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" d="m14 17 6 6 6-6"></path>
		</svg>
		<svg class="button" x="175" y="260" onmousedown={startUp} onmouseup={endUp}>
			<circle cx="20" cy="20" r="20" fill="black"/>
			<path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor" d="m26 22-6-6-6 6"></path>
		</svg>
	</svg>
</div>

<style>
	svg {
		cursor: default;
		position: relative;
	}
	.track {
		fill: none;
		cursor: pointer;
		stroke: rgba(0,0,0,1);
		stroke-width: 15px;
		stroke-dasharray: 660;
		transform-origin: center;
		transform: rotate(135deg);
		stroke-linecap: round;
		z-index: 1;
	}
	.set {
		fill: #737373; /* TODO palette */
		z-index: 2;
	}
	.knob {
		cursor: pointer;
		fill: #00c951; /* TODO palette */
		z-index: 3;
	}
	.button {
		cursor: pointer;
		z-index: 14;
	}
</style>
