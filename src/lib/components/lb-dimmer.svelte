<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView, SliderBar } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(Number(store.getState(control.states.min)) || 0 );
	let max = $derived(Number(store.getState(control.states.max)) || 100);
	let step = $derived(Number(store.getState(control.states.step)) || 1);
	let position = $derived(Number(store.getState(control.states.position)) || 0);

	let sliderBar: SliderBar = $derived({
		min: min,
		max: max,
		step: step,
		position: position,
		orientation: 'vertical'
	});

	function updatePosition(e: any, isUp: number) {
		let newPosition;
		if (e && e.sliderPosition == undefined && sliderBar.position >= min && sliderBar.position <= max ) { // no sliderPosition, is button
			newPosition = sliderBar.position + sliderBar.step * isUp;
			if (newPosition > sliderBar.max) newPosition = sliderBar.max;
			if (newPosition < sliderBar.min) newPosition = sliderBar.min;
		} else { // is slider
			newPosition = e.sliderPosition;
		}
		publishTopic(control.uuidAction, String(newPosition));
	}

	let plusMinusButtons: SingleButtonView[] = $state([
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

	let onOffButton: SingleButtonView = $derived(
		{
			name: (position > 0) ? 'Switch off' : 'Switch on',
			type: 'button',
			class: 'col-span-2',
			click: (e: any) => {
				publishTopic(control.uuidAction, (position == 0) ? 'on' : 'off');
			}
		}
	);
	
	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		class: 'grid-cols-2',
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: position > 0 ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: String(sliderBar.position) + ' %',
		statusColor: position > 0 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-700 dark:text-surface-300',
		buttons: plusMinusButtons,
		slider: sliderBar,
		modal: {
			...modal,
			buttons: [
				...plusMinusButtons,
				onOffButton
			]
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
