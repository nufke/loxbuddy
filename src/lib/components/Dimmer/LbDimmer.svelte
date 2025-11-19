<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, DialogView, SliderBar } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
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
		loxWsClient.control(control.uuidAction, String(newPosition));
	}

	let plusMinusButtons: SingleButtonView[] = $state([
		{
			iconName: 'MinusIcon',
			type: 'button',
			color: '',
			click: (e: any) => {updatePosition(e, -1)}
		},
		{
			iconName: 'PlusIcon',
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
				loxWsClient.control(control.uuidAction, (position == 0) ? 'on' : 'off');
			}
		}
	);
	
	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
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
		dialog: {
			...dialog,
			buttons: [
				...plusMinusButtons,
				onOffButton
			]
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
