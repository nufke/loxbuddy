<script lang="ts">
	import type { Control, ControlView, SingleButtonView, Slider, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import fmt from 'sprintf-js';

	let { control }: { control: Control } = $props();

	let slider: Slider = $derived({
		min: Number(control.details.min),
		max: Number(control.details.max),
		step: Number(control.details.step),
	});

	let position = $derived(Number(store.getState(control.states.value)));

	function updatePosition(e: any, isUp: number) {
		let newPosition;
		if (e && e.sliderPosition == undefined && controlView.sliderPosition) { // no sliderPosition, is button
			newPosition = controlView.sliderPosition + slider.step * isUp;
			if (newPosition > slider.max) newPosition = slider.max;
			if (newPosition < slider.min) newPosition = slider.min;
		} else { // is slider
			newPosition = e.sliderPosition;
		}
		publishTopic(control.uuidAction, String(newPosition));
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'Minus',
			type: 'button',
			color: '',
			click: (e: any) => {updatePosition(e, -1)}
		},
		{
			iconName: 'Plus',
			type: 'button',
			color: '',
			click: (e: any) => {updatePosition(e, 1)}
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: control.defaultIcon || store.getCategoryIcon(control),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, position),
		buttons: buttons,
		slider: slider,
		sliderPosition: position,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
