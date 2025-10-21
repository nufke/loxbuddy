<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { msControl } from '$lib/communication/msclient';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(Number(store.getState(control.states.min)));
	let max = $derived(Number(store.getState(control.states.max)));
	let step = $derived(Number(store.getState(control.states.step)));
	let value = $derived(Number(store.getState(control.states.value)));

	let increaseOnly = control.details.increaseOnly;

	function updateValue(isUp: number) {
		let newValue = value + step * isUp;
		if (newValue > max) newValue = max;
		if (newValue < min) newValue = min;
		msControl(control.uuidAction, String(newValue));
	}

	let buttonMinus: SingleButtonView[] = $state([
		{
			iconName: 'Minus',
			type: 'button',
			color: '',
			click: () => {updateValue(-1)}
		}
	]);

	let buttonPlus: SingleButtonView[] = $state([
		{
			iconName: 'Plus',
			type: 'button',
			color: '',
			click: () => {updateValue(1)}
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		size: {
			width: 'w-[450px]'
		}
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, value),
		buttons: increaseOnly ? buttonPlus : [...buttonMinus, ...buttonPlus],
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
