<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import fmt from 'sprintf-js';

	export let control: Control;

	let openModal: boolean;
	let min: number = Number(control.details.min);
	let max: number = Number(control.details.max);
	let step: number = Number(control.details.step);
	let newPosition: number;

	$: position = Number($state[control.states.value]);

	function updatePosition(e: any, isUp: number) {
		if (e && e.checked == undefined) { // no index given, assume button
			newPosition = position + step * isUp;
			if (newPosition > max) newPosition = max;
			if (newPosition < min) newPosition = min;
		} else {
			newPosition = e.checked;
		}
		publishTopic(control.uuidAction, String(newPosition));
	}
	
  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, position),
		buttons: [
			{
				iconName: 'Minus',
				type: 'button',
				color: '',
				click: (e:any) => updatePosition(e, -1)
			},
			{
				iconName: 'Plus',
				type: 'button',
				color: '',
				click: (e:any) => updatePosition(e, 1)
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			slider: {
				min: Number(control.details.min),
				max: Number(control.details.max),
				step: Number(control.details.step),
				position: position
			}
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbModal {controlView} />
</div>

