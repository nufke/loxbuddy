<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import iro from '@jaames/iro';
	import type { Control, ColorType } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Utils } from '$lib/utils';
	import { publishTopic } from '$lib/helpers/mqttclient';

	let { control, tempOrColor = $bindable() } = $props();

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
	let color = $derived(store.getState(control.states.color));
	let rgbColorObj = $derived(calcRgbColor(color));
	let rgbColor = $derived(rgbColorObj.rgb);
	let tempColorObj = $derived(calcTempColor(color));
	let tempColor = $derived(tempColorObj.kelvin);
	let brightness = $derived(rgbColorObj.brightness || tempColorObj.brightness);

	let layout = $derived(tempOrColor);

	$effect(() => {
		if (tempOrColor) {
			busy = false;
		}

		if (picker) {
			if (tempOrColor) {
				picker.setOptions({ layout: temperatureLayout });
			} else {
				picker.setOptions({ layout: colorLayout });
			}
		}
		
		if (picker && !busy) {
			if (tempOrColor && tempColor) {
				picker.color.kelvin = tempColor;
			} else if ( rgbColor) {
				picker.color.rgb = {
					r: rgbColor[0],
					g: rgbColor[1],
					b: rgbColor[2]
				};
			};
		}
	});

	function calcRgbColor(color: string) {
		let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		if (hsv) {
			let rgb = Utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
			return { brightness: Number(hsv[3]), rgb: rgb};
		} else {
			return { brightness: 100, rgb: [255,255,255] }; // TODO need default?
		}
	}

	function calcTempColor(color: string) {
		let temp = color.match(/temp\(([0-9]*),([0-9]*)\)/);
		if (temp) {
			return { brightness: Number(temp[1]), kelvin: Number(temp[2])};
		} else {
			return { brightness: 100, kelvin: 2700}; // TODO need default?
		}
	}

	onMount(async () => {
		picker = iro.ColorPicker(element, {
			width: 275,
			color: `rgb(${rgbColor || '255, 255, 255'})`,
			handleRadius: 16,
			wheelLightness: false,
			borderWidth: 3,
			layoutDirection: 'horizontal',
			layout: tempOrColor ? temperatureLayout : colorLayout
		});

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
			let hsv = Utils.rgb2hsv(color.rgb.r, color.rgb.g, color.rgb.b);
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

<div bind:this={element} class="flex justify-center"></div>
