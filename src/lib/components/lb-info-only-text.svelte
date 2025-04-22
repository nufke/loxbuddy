<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import fmt from 'sprintf-js';

	export let control: Control;

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
		name: fmt.sprintf(control.details.format, $state[control.states.text]),
		color: ''
	};
</script>

<LbControl {iconView}	{textView} {stateView} />
