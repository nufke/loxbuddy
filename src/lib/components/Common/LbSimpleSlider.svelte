<script lang="ts">
	import { innerHeight } from 'svelte/reactivity/window';

	let { min, max, step, value, locked, orientation = '', classes='', style = '', onValueChange } = $props();

	let mode = $state(localStorage.getItem('mode') || 'dark');
	let viewport: any;
	let startMouseMove = $state(false);
	let windowHeight = $derived(innerHeight.current || 0);
 
	function handleMouseUp(e: any) {
		onValueChange({value: value});
		startMouseMove = false;
	}

	function handleMouseDown(e: any) {
		startMouseMove = true;
	}

	function handleMouseMove(e: any) {
		if (startMouseMove) {
			onValueChange({value: value});
		}
	}

	$effect( () => {
		if (locked) {
			viewport.disabled = true;
		}
	});

	function dimmerBackground() {
		return mode == 'dark' ?
		'background: linear-gradient(to right, var(--color-surface-50) 0%, var(--color-surface-50) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-950) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-950) 100%)' :
		'background: linear-gradient(to right, var(--color-surface-950) 0%, var(--color-surface-950) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-50) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-50) 100%)';
	}
</script>

<div class="ml-1 mr-1 mb-1 { (orientation == 'vertical' && windowHeight > 630) ? 'rotate-270 m-3 ml-3 mb-8':''}">
	<input bind:this={viewport} type="range" id="vol" name="vol" min={min} max={max} step={step} bind:value={value} onmouseup={handleMouseUp} onmousedown={handleMouseDown} onmousemove={handleMouseMove}
					class=" {classes} { (classes == 'dimmer' && windowHeight < 630 ) ? 'h-[60px] w-[250px]' : 'h-[150px] w-[200px] '}"
					style=" {style} { classes == 'dimmer' ? dimmerBackground() : ''}" />
</div>

<style>
	.slider {
		position: relative;
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 20px;
		border-radius: 10px;
		outline: none;
		-webkit-transition: .2s;
		transition: opacity .2s;
		cursor: pointer;
	}
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 22px;
		height: 22px;
		border-radius: 10px;
		border-width: 3px;
		border-color: white;
		border-style: solid;
		cursor: pointer;
	}
	.slider[type="range"]::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 11px;
		border-width: 3px;
		border-color: white;
		background-color: transparent;
	}
	.dimmer {
		position: relative;
		-webkit-appearance: none;
		appearance: none;
		border-radius: 10px;
		outline: none;
		-webkit-transition: .2s;
		transition: opacity .2s;
		cursor: pointer;
	}
	.dimmer::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 0px;
		height: 0px;
		cursor: pointer;
	}
	.dimmer[type="range"]::-moz-range-thumb {
  	background-color: transparent;
		border: none;
	}

	.dimmer[type="range"]:disabled {
    opacity: 1;      /* disabled should not greyout element */
		cursor: default; /* no pointer */
	}

</style>