<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	import { loxWsClient } from '$lib/communication/loxwsclient';
	import { store } from '$lib/stores/store.svelte';

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
		loxWsClient.control(control.uuidAction, msg);
	}

	let radioList = $derived(
		Object.entries(control.details.outputs).map((entry) => ({
			id: Number(entry[0]),
			name: String(entry[1])
		})).concat([{ id: 0, name: control.details.allOff }]));

	let selectedRadio = $derived(Number(store.getState(control.states.activeOutput)));

	let radioIndex = $derived(radioList.find( item => item.id == selectedRadio));

	let	modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
	});

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'Minus',
			type: 'button',
			color: '',
			click: (e: any) => clickRadio(e, -1)
		},
		{
			iconName: 'Plus',
			type: 'button',
			color: '',
			click: (e: any) => clickRadio(e, 1)
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: radioIndex ? radioIndex.name : 'unknown',
		statusColor: selectedRadio ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		list: radioList,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbListModal bind:controlView />
</div>
