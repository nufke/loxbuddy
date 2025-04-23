<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import fmt from 'sprintf-js';

	export let control: Control;

	$: position = Number($state[control.states.value]);

	function updatePosition(position: number, isUp: number) {
		let min: number = Number(control.details.min);
		let max: number = Number(control.details.max);
		let step: number = Number(control.details.step);
		let pos: number = position + step * isUp;
		if (pos > max) pos = max;
		if (pos < min) pos = min;
		publishTopic(control.uuidAction, String(pos));
	}
	
  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, position),
		buttons: [
			{
				name: 'Minus',
				type: 'button',
				color: '',
				action: () => updatePosition(position, -1)
			},
			{
				name: 'Plus',
				type: 'button',
				color: '',
				action: () => updatePosition(position, 1)
			}
		]
	};
</script>

<LbControl {controlView} />