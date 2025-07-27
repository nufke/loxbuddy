<script lang="ts">
	let { min, max, step, value, orientation = '', classes='', style = '', onValueChangeEnd } = $props();

	let mode = $state(localStorage.getItem('mode') || 'dark');
	let viewport: any;

	function handleMouseUp(e: any) {
		onValueChangeEnd({value: value});
	}

	function dimmerBackground() {
		return mode == 'dark' ?
		'background: linear-gradient(to right, var(--color-surface-50) 0%, var(--color-surface-50) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-950) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-950) 100%)' :
		'background: linear-gradient(to right, var(--color-surface-950) 0%, var(--color-surface-950) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-50) ' + (value-min)/(max-min)*100 + '%, var(--color-surface-50) 100%)';
	}
</script>

<div class="ml-1 mr-1 mb-1 {orientation == 'vertical' ? 'rotate-270 m-3 ml-3 mb-8':''}">
	<input bind:this={viewport} class={classes} type="range" id="vol" name="vol" min={min} max={max} step={step} bind:value={value} onmouseup={handleMouseUp}
					style="{style} { classes == 'dimmer' ? dimmerBackground() : ''}" />
</div>

<style>
	.slider {
		position: relative;
		-webkit-appearance: none;
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
	
	.dimmer {
		position: relative;
		-webkit-appearance: none;
		width: 200px;
		height: 150px;
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
</style>