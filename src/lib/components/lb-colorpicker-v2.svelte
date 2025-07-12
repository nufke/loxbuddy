<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import iro from '@jaames/iro';
	import type { Control, ColorType } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { utils } from '$lib/helpers/utils';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { _ } from 'svelte-i18n';

	let { control }: { control: Control } = $props();

	let picker: iro.ColorPicker;
	let element: HTMLDivElement;
	let timeout: ReturnType<typeof setTimeout> | undefined;

	let desiredPublishInterval = 300; // in ms
	let lastRequestTimestamp = Date.now();

	const colorLayout = [
		{
			component: iro.ui.Wheel,
			options: {
				wheelAngle: 270,
				wheelDirection: 'clockwise'
			}
		}
	];

	let temperatureLayout = $state([
		{
			component: iro.ui.Slider,
			options: {
				sliderShape: 'circle',
				sliderType: 'kelvin',
				minTemperature: control.states.minKelvin,
				maxTemperature: control.states.maxKelvin
			}
		}
	]);

	let busy = $state(false);
	let color = $derived(String(store.getState(control.states.color)));
	let {rgbColor, tempColor, brightness, isTempColor} = $derived(getColor(color));

	$effect(() => {
		if (isTempColor) {
			busy = false;
		}

		if (picker) {
			if (isTempColor) {
				picker.setOptions({ layout: temperatureLayout });
			} else {
				picker.setOptions({ layout: colorLayout });
			}
		}

		if (picker && !busy) {
			if (isTempColor && tempColor) {
				picker.color.kelvin = tempColor;
			} else if (rgbColor) {
				picker.color.rgb = {
					r: rgbColor[0],
					g: rgbColor[1],
					b: rgbColor[2]
				}
			}
		}
	});

	function getColor(color: string) {
		let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		let temp = color.match(/temp\(([0-9]*),([0-9]*)\)/);
		let rgb, kelvin, brightness, isTempColor;
		if (hsv && hsv.length > 3) {
			rgb = utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
			brightness = Number(hsv[3]);
			isTempColor = false; // rgb
		} else if (temp && temp.length > 2) {
			kelvin = Number(temp[2]);
			brightness = Number(temp[1]);
			isTempColor = true;
		} else { // nothing found, set default
			rgb = [255,255,255];
			brightness = 100;
			isTempColor = false;  // rgb
		}
		return {rgbColor: rgb, tempColor: kelvin, brightness: brightness, isTempColor: isTempColor};
	}

	/*
	 * Pending issue:
	 *  [Violation] Added non-passive event listener to a scroll-blocking 'touchstart' event. 
	 *  Consider marking event handler as 'passive' to make the page more responsive. 
	 *  See https://www.chromestatus.com/feature/5745543795965952
	 */
	onMount(async () => {
		picker = iro.ColorPicker(element, {
			width: 275,
			handleRadius: 16,
			wheelLightness: false,
			borderWidth: 3,
			layoutDirection: 'horizontal',
			layout: isTempColor ? temperatureLayout : colorLayout
		});

		if (isTempColor && tempColor) {
				picker.color.kelvin = tempColor;
		}

		if (rgbColor) {
			picker.color.rgb = {
				r: rgbColor[0],
				g: rgbColor[1],
				b: rgbColor[2]
			}
		}

		picker.on('input:start', () => {
			clearTimeout(timeout);
			busy = true;
		});

		picker.on('input:change', handleUpdate);
		picker.on('input:move', () => {});

		picker.on('input:end', (event: any) => {
			handleUpdate(event);
			// release after 500ms
			timeout = setTimeout(() => {
				busy = false;
			}, 500);
		});
	});

	async function handleUpdate(color: ColorType) {
		let newColor;
		const type = typeof picker?.state?.layout?.[0] !== 'string'
			? picker?.state?.layout?.[0]?.options?.sliderType	: undefined;

		if (type === 'kelvin') { 
			newColor = 'temp(' + brightness + ',' + Math.round(color.kelvin) + ')';
		} else if (!type) {
			let hsv = utils.rgb2hsv(color.rgb.r, color.rgb.g, color.rgb.b);
			newColor = 'hsv(' + hsv.h + ',' + hsv.s + ',' + brightness + ')';
		}

		if (!newColor) return;
		publishData(newColor);
	}

	// only publish data at fixed interval
	// intermediate results will be ignored
	function publishData(data: string) {
  	const currentTimestamp = Date.now();
	  const timeElapsed = currentTimestamp - lastRequestTimestamp;

  	if (timeElapsed > desiredPublishInterval) {
			publishTopic(control.uuidAction, data);
			lastRequestTimestamp = Date.now();
 	 }
	}

	onDestroy(() => {
		clearTimeout(timeout);
		timeout = undefined;
	});
</script>

<div class="w-full btn-group preset-outlined-surface-200-800 grid-cols-2 mt-3 mb-10 p-2 flex-row">
	<button type="button" class="w-full h-9 rounded-sm {!isTempColor ? 'bg-surface-600' : ''}" onclick={() => isTempColor=false}>{$_("Colors")}</button>
	<button type="button" class="w-full h-9 rounded-sm {isTempColor ? 'bg-surface-600' : ''}" onclick={() => isTempColor=true}>{$_("Color temperature")}</button>
</div>

<div bind:this={element} class="flex justify-center"></div>
