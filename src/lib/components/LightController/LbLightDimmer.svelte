<script lang="ts">
	import type { Control, ControlOptions, ControlView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { utils } from '$lib/helpers/Utils';
	import { store } from '$lib/stores/Store.svelte';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import { _ } from 'svelte-i18n';
	import LbSimpleSlider from '$lib/components/Common/LbSimpleSlider.svelte'
	import { ChevronRight } from '@lucide/svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(control.states.min ? Number(store.getState(control.states.min)) : 0 );
	let max = $derived(control.states.max ? Number(store.getState(control.states.max)) : 100);
	let step = $derived(control.states.step ? Number(store.getState(control.states.step)) : 1);
	let nPosition = $derived(Number(store.getState(control.states.position)));
	let color = $derived(String(store.getState(control.states.color)));
	let {rgbColor, brightness} = $derived(getColor(color));
	let position = $derived ( (control.type === 'ColorPickerV2') ? brightness : Math.round(nPosition));

	function getColor(color: string) {
		let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		let temp = color.match(/temp\(([0-9]*),([0-9]*)\)/);
		let rgb, brightness;
		if (hsv && hsv.length > 3) {
			rgb = utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
			brightness = Number(hsv[3]);
		} else if (temp && temp.length > 2) {
			brightness = Number(temp[1]);
		}
		return {rgbColor: rgb, brightness: brightness};
	}

	function trackColor() {
		const rgb = rgbColor;
		if (rgb) {
			return String('background-image: linear-gradient(to right, rgba('+ rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.1), rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
		} else { // normal dimmer or tempColor
			return 'background-image: linear-gradient(to right, rgba(49,56,62,1), rgba(255,191,64,1)';
		}
	}

  function updatePosition(e: any) {
		let newPosition = Math.round(e);
		if (newPosition == position) return; // same position, do not update

    if (control.type === 'Dimmer') {
      loxWsClient.control(control.uuidAction, String(e));
    }

    if (control.type === 'ColorPickerV2') {
      let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
			if (hsv) {
        let newColor = 'hsv(' + hsv[1] + ',' + hsv[2] + ',' + String(e) + ')';
			  loxWsClient.control(control.uuidAction, newColor);
			}
    }
  }

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isSubControl: controlOptions.isSubControl,
		isFavorite: controlOptions.isFavorite,
		textName: control.name,
		statusName: position + ' %'
	});
</script>

<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={() => {controlOptions.action ? controlOptions.action() : controlView.modal.state = true}}
     class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
						{controlOptions.isSubControl ? 'bg-surface-200-800' : 'bg-surface-100-900'} px-2 py-2 hover:border-white/10">
	<div class="w-full ">
		<div class="flex justify-between mt-0 mb-3 ml-2 mr-2">
			<div class="flex">
				<p class="text-lg">{controlView.textName}</p>
				{#if controlOptions.action}
					<p class="mt-1"><ChevronRight size="20"/></p>
				{/if}
			</div>
			<p class="text-md">{controlView.statusName}</p>
		</div>
		<div class="container">
			<button class="w-full" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for slider -->
				<LbSimpleSlider classes='slider' style={trackColor()}
												min={min} max={max} step={step} value={position} locked={false} onValueChange={(e: any) => {updatePosition(e.value)}}/>
			</button>
		</div>
	</div>
</div>
