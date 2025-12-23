<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbListDialog from '$lib/components/Common/LbListDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS } : {control: Control, controlOptions: ControlOptions } = $props();

	function clickRadio(e: any, step: number) {
		let min: number = 0;
		let max: number = radioList.length - 1;
		let idx: number = radioList.findIndex((item) => {
			return item.id === selectedRadio;
		});

		if (e && e.checked == undefined) { // no index given, use step
			idx += step;

			if (idx > max) {
				idx = min;
			} else {
				if (idx < min) {
					idx = max;
				}
			}
		} else {
			idx = Number(e.checked);
		}

		let msg = String(radioList[idx].id);
		if (msg === '0') msg = 'reset'; // off requires text "reset" instead of id 0
		controlStore.setControl(control.uuidAction, msg);
	}

	let radioList = $derived(
		Object.entries(control.details.outputs).map((entry) => ({
			id: Number(entry[0]),
			name: String(entry[1])
		})).concat([{ id: 0, name: control.details.allOff }]));

	let selectedRadio = $derived(Number(controlStore.getState(control.states.activeOutput)));

	let radioIndex = $derived(radioList.find( item => item.id == selectedRadio));

	let	dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'MinusIcon',
			type: 'button',
			color: '',
			click: (e: any) => clickRadio(e, -1)
		},
		{
			iconName: 'PlusIcon',
			type: 'button',
			color: '',
			click: (e: any) => clickRadio(e, 1)
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: radioIndex ? radioIndex.name : 'unknown',
		statusColor: selectedRadio ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		list: radioList,
		buttons: buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbListDialog bind:controlView />
</div>
