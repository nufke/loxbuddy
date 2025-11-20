<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(Number(controlStore.getState(control.states.min)));
	let max = $derived(Number(controlStore.getState(control.states.max)));
	let step = $derived(Number(controlStore.getState(control.states.step)));
	let value = $derived(Number(controlStore.getState(control.states.value)));

	let increaseOnly = control.details.increaseOnly;

	function updateValue(isUp: number) {
		let newValue = value + step * isUp;
		if (newValue > max) newValue = max;
		if (newValue < min) newValue = min;
		loxWsClient.control(control.uuidAction, String(newValue));
	}

	let buttonMinus: SingleButtonView[] = $state([
		{
			iconName: 'MinusIcon',
			type: 'button',
			color: '',
			click: () => {updateValue(-1)}
		}
	]);

	let buttonPlus: SingleButtonView[] = $state([
		{
			iconName: 'PlusIcon',
			type: 'button',
			color: '',
			click: () => {updateValue(1)}
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
		size: {
			width: 'w-[450px]'
		}
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, value),
		buttons: increaseOnly ? buttonPlus : [...buttonMinus, ...buttonPlus],
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
