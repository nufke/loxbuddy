<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	let openModal: boolean;

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

	$: selectedRadio = Number($state[control.states.activeOutput]);
	$: radioIndex = radioList.find( item => item.id == selectedRadio);

	$: radioList = 
		Object.entries(control.details.outputs).map((entry) => ({
			id: Number(entry[0]),
			name: String(entry[1])
		})).concat([{ id: 0, name: control.details.allOff }]);

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: radioIndex ? radioIndex.name : 'unknown',
		statusColor: selectedRadio ? '#69C350' : 'white', //TODO add color map
		buttons: [
			{
				iconName: 'Minus',
				type: 'button',
				color: '',
				click: (e:any) => clickRadio(e, -1)
			},
			{
				iconName: 'Plus',
				type: 'button',
				color: '',
				click: (e:any) => clickRadio(e, 1)
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			list: radioList
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbListModal {controlView} />
</div>
