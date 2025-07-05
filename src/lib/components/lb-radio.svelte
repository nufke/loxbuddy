<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
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
		publishTopic(control.uuidAction, msg);
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
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: radioIndex ? radioIndex.name : 'unknown',
		statusColor: selectedRadio ? 'text-primary-500' : 'text-surface-500',
		list: radioList,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbListModal bind:controlView={controlView}/>
</div>
