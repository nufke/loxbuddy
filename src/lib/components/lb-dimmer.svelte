<script lang="ts">
	import type { Control, ControlView, SliderBar, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { Utils } from '$lib/utils';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import { _ } from 'svelte-i18n';
  import SimpleSlider from '$lib/components/simple-slider.svelte'

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let min = $derived(control.states.min ? Number(store.getState(control.states.min)) : 0 );
	let max = $derived(control.states.max ? Number(store.getState(control.states.max)) : 100);
	let step = $derived(control.states.step ? Number(store.getState(control.states.step)) : 1);
	let nPosition = $derived(Number(store.getState(control.states.position)));
	let color = $derived(store.getState(control.states.color));
	let rgbPosition = $derived(calcPosition(color));
	let position = $derived ( (control.type === 'ColorPickerV2') ? rgbPosition : nPosition);

	function calcRGB(color: string) {
		let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		if (hsv) {
			let rgb = Utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
			return rgb;
		} else {
			return [255,255,255];
		}
	}

	function calcPosition(color: string) {
		let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
		if (hsv) {
			return hsv[3] ? Number(hsv[3]) : 0;
		} else {
			return 0;
		}
	}

	function trackColor(color: string) {
		let rgb = calcRGB(color);
		let str =  String('background-image: linear-gradient(to right, rgba('+ rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.1), rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',1)');
		return (control.type === 'ColorPickerV2') ? str : 'background-image: linear-gradient(to right, rgba(49,56,62,1), rgba(255,191,64,1)';
	}

  function updatePosition(e: any) {
		if (e == position) return; // same position, do not update
		console.log('updatePosition', position, e);

    if (control.type === 'Dimmer') {
      publishTopic(control.uuidAction, String(e));
    }

    if (control.type === 'ColorPickerV2') {
      let hsv = color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
			if (hsv) {
        let newColor = 'hsv(' + hsv[1] + ',' + hsv[2] + ',' + String(e) + ')';
			  publishTopic(control.uuidAction, newColor);
			}
    }
  }

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		textName: control.name,
		statusName: position + ' %'
	});
</script>

<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={() => {controlView.modal.action(true)}}
     class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
						bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10">
	<div class="w-full ">
		<div class="flex justify-between mt-0 mb-3 ml-2 mr-2">
			<p class="text-lg">{controlView.textName}</p>
			<p class="text-mc">{controlView.statusName}</p>
		</div>
		<div class="container"> <!--flex-->
			<SimpleSlider classes="ml-1 mr-1 mb-1" thumbStyle={trackColor(color)}
							min={min} max={max} step={step} value={position} onValueChangeEnd={(e: any) => {updatePosition(e.value)}}/>
		</div>
	</div>
</div>
