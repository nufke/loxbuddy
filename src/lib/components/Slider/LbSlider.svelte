<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, SliderBar, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let sliderBar: SliderBar = $derived({
		min: Number(control.details.min),
		max: Number(control.details.max),
		step: Number(control.details.step),
		position: Number(controlStore.getState(control.states.value))
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
		controlStore.setControl(control.uuidAction, String(newPosition));
	}

	let buttons: SingleButtonView[] = $state([
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

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, sliderBar.position),
		buttons: buttons,
		slider: sliderBar,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
