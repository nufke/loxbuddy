<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	function clickRadio(selectedRadio: number, step: number) {
		let min: number = 0;
		let max: number = radioList.length - 1;
		let idx: number = radioList.findIndex((item) => {
			return item.id === selectedRadio;
		});

		idx += step;

		if (idx > max) {
			idx = min;
		} else {
			if (idx < min) {
				idx = max;
			}
		}

		let msg = String(radioList[idx].id);
		if (msg === '0') msg = 'reset'; // loxone requires text "reset" instead of ID 0

		publishTopic(control.uuidAction, msg);
	}

	$: selectedRadio = Number($state[control.states.activeOutput]);

	$: radioList = [{ id: 0, name: control.details.allOff }].concat(
		Object.entries(control.details.outputs).map((entry) => ({
			id: Number(entry[0]),
			name: String(entry[1])
		}))
	);

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: radioList[selectedRadio].name,
		buttons: [
			{
				name: 'Minus',
				type: 'button',
				color: '',
				action: () => clickRadio(selectedRadio, -1)
			},
			{
				name: 'Plus',
				type: 'button',
				color: '',
				action: () => clickRadio(selectedRadio, 1)
			}
		]
	};
</script>

<LbControl {controlView} />