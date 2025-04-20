<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import fmt from 'sprintf-js';

	export let control: Control;

	$: position = Number($state[control.states.position]) * 100;
	$: image = $categories[control.cat].image;

	$: iconView = {
		name: '/loxicons/' + (control.defaultIcon ? control.defaultIcon : image),
		color: 'white'
	};

	$: textView = {
		name: control.name,
		color: ''
	};

	$: stateView = {
		name: position < 1 ? 'Gesloten' : position > 99 ? 'Geopend' : fmt.sprintf('%1.0f%% ', position),
		color: ''
	};

	$: buttonView = {
		buttons: [
			{
				name: 'ChevronDown',
				type: 'button',
				color: '',
				action: () => console.log('down')
			},
			{
				name: 'ChevronUp',
				type: 'button',
				color: '',
				action: () => console.log('up')
			}
		]
	};
</script>

<LbControl iconView={{ ...iconView }} textView={{ ...textView }} stateView={{ ...stateView }} buttonView={{ ...buttonView }} />
