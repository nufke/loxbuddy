<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import fmt from 'sprintf-js';

	export let control: Control;

	$: position = Number($state[control.states.position]) * 100;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: position < 1 ? 'Gesloten' : position > 99 ? 'Geopend' : fmt.sprintf('%1.0f%% ', position),
		buttons: [
			{
				iconName: 'ChevronDown',
				type: 'button',
				color: '',
				action: () => console.log('down')
			},
			{
				iconName: 'ChevronUp',
				type: 'button',
				color: '',
				action: () => console.log('up')
			}
		]
	};
</script>

<LbControl {controlView} />