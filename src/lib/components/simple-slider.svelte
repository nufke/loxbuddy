<script lang="ts">
  let { min, max, step, value, classes='', thumbStyle = '', onValueChangeEnd } = $props();

	function handleMouseUp(e: any) {
    onValueChangeEnd({value: value});
	}
</script>

<div class={classes}>
	<input class="slider" style={thumbStyle} type="range" id="vol" name="vol" min={min} max={max} step={step} bind:value={value} onmouseup={handleMouseUp}>
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
</style>