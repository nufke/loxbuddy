<script lang="ts">
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { utils } from '$lib/helpers/Utils';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import LbSimpleSlider from '$lib/components/Common/LbSimpleSlider.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(control.states?.min ? Number(controlStore.getState(control.states?.min)) : 0);
	let max = $derived(control.states?.max ? Number(controlStore.getState(control.states?.max)) : 100);
	let step = $derived(control.states?.step ? Number(controlStore.getState(control.states?.step)) : 1);
	let nPosition = $derived(Number(controlStore.getState(control.states?.position)));
	let color = $derived(String(controlStore.getState(control.states?.color)));
	let { rgbColor, brightness } = $derived(getColor(color));
	let position = $derived(control.type === 'ColorPickerV2' ? brightness : Math.round(nPosition));
	let statusName = $derived(position + ' %');

	/**
	 * Parses a Loxone color state string and extracts the RGB components and
	 * brightness level for use in the slider track gradient and position display.
	 *
	 * Supported formats:
	 * - hsv(H,S,V) — converts H/S to an RGB array (at full saturation) and
	 *   uses V as the brightness value.
	 * - temp(brightness, kelvin) — extracts brightness only; no RGB is returned.
	 *
	 * @param color - raw Loxone color state string, e.g. hsv(220,80,65).
	 * @returns object with rgbColor (three-element [R,G,B] array or undefined)
	 *   and `brightness` (0–100 number or `undefined` when the format is unrecognised).
	 */
	function getColor(color: string): { rgbColor: number[] | undefined; brightness: number | undefined } {
		const hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		const temp = color.match(/temp\(([0-9]*),([0-9]*)\)/);
		let rgb, brightness;
		if (hsv && hsv.length > 3) {
			rgb = utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
			brightness = Number(hsv[3]);
		} else if (temp && temp.length > 2) {
			brightness = Number(temp[1]);
		}
		return { rgbColor: rgb, brightness: brightness };
	}

	/**
	 * Returns the CSS background-image inline style for the slider track.
	 * When an RGB color is available (HSV mode) a gradient from the same hue at
	 * near-zero opacity to full opacity is used; otherwise a warm white
	 * (dark grey → amber) gradient is shown for temperature/dimmer mode.
	 *
	 * @returns CSS of background-image
	 */
	function trackColor(): string {
		return rgbColor ?
			`background-image: linear-gradient(to right, rgba(${rgbColor[0]},${rgbColor[1]},${rgbColor[2]},0.1), rgba(${rgbColor[0]},${rgbColor[1]},${rgbColor[2]},1)` 
			: 'background-image: linear-gradient(to right, rgba(49,56,62,1), rgba(255,191,64,1)';
	}

	/**
	 * Handles a slider value change and sends the updated position to the
	 * miniserver. No-ops when the rounded new value equals the current position.
	 *
	 * For Dimmer controls the raw numeric value is sent directly.
	 * For ColorPickerV2 controls the existing HSV hue and saturation are
	 * preserved and only the V (brightness) component is replaced.
	 *
	 * @param e - new slider position value (number).
	 */
	function updatePosition(e: any): void {
		const newPosition = Math.round(e);
		if (newPosition == position) return;
		if (control.type === 'Dimmer') {
			controlStore.setControl(control, String(e));
		}
		if (control.type === 'ColorPickerV2') {
			const hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
			if (hsv) controlStore.setControl(control, `hsv(${hsv[1]},${hsv[2]},${String(e)})`);
		}
	}
</script>

<div role="button" tabindex="0" onkeydown={() => {}} aria-label="card"
		onclick={() => controlOptions.action?.()}
		class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
				{controlOptions.isSubControl ? 'bg-surface-200-800' : 'bg-surface-100-900'} px-2 py-2 hover:border-white/10">
	<div class="w-full">
		<div class="flex justify-between mt-0 mb-3 ml-2 mr-2">
			<div class="flex">
				<p class="text-lg">{control.name}</p>
				{#if controlOptions.action}
					<p class="mt-1"><LbIcon name="chevron-right" height="20" width="20"/></p>
				{/if}
			</div>
			<p class="text-md">{statusName}</p>
		</div>
		<div class="container">
			<button class="w-full" onclick={(e) => e.stopPropagation()}>
				<LbSimpleSlider classes="slider" style={trackColor()}
					min={min} max={max} step={step} value={position} locked={false}
					onValueChange={(e: any) => updatePosition(e.value)}/>
			</button>
		</div>
	</div>
</div>
