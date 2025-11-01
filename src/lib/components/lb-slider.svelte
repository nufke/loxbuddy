<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, SliderBar, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { loxWsClient } from '$lib/communication/loxwsclient';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let sliderBar: SliderBar = $derived({
		min: Number(control.details.min),
		max: Number(control.details.max),
		step: Number(control.details.step),
		position: Number(store.getState(control.states.value))
	});

	function updatePosition(e: any, isUp: number) {
		let newPosition;
		if (e && e.sliderPosition == undefined && sliderBar.position >= sliderBar.min && sliderBar.position <= sliderBar.max) { // no sliderPosition, is button
			newPosition = sliderBar.position + sliderBar.step * isUp;
			if (newPosition > sliderBar.max) newPosition = sliderBar.max;
			if (newPosition < sliderBar.min) newPosition = sliderBar.min;
		} else { // is slider
			newPosition = e.sliderPosition;
		}
		loxWsClient.control(control.uuidAction, String(newPosition));
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
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, sliderBar.position),
		buttons: buttons,
		slider: sliderBar,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
