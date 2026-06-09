<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let min = $derived(Number(controlStore.getState(control.states?.min)));
	let max = $derived(Number(controlStore.getState(control.states?.max)));
	let step = $derived(Number(controlStore.getState(control.states?.step)));
	let value = $derived(Number(controlStore.getState(control.states?.value)));
	let increaseOnly = $derived(control.details?.increaseOnly);

	let buttonMinus: SingleButtonView[] = $state([
		{
			iconName: 'minus',
			type: 'button',
			color: '',
			click: (e: any, visuPw?: string) => {updateValue(-1, visuPw)}
		}
	]);

	let buttonPlus: SingleButtonView[] = $state([
		{
			iconName: 'plus',
			type: 'button',
			color: '',
			click: (e: any, visuPw?: string) => {updateValue(1, visuPw)}
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		class: 'grid-cols-2',
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
		statusName: fmt.sprintf(control.details?.format, value),
		buttons: increaseOnly ? buttonPlus : [...buttonMinus, ...buttonPlus],
		dialog: dialog
	});

	function updateValue(isUp: number, visuPw?: string): void {
		let newValue = value + step * isUp;
		if (newValue > max) newValue = max;
		if (newValue < min) newValue = min;
		if (newValue != value) {
			controlStore.setControl(control, String(newValue), visuPw);
		}
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
