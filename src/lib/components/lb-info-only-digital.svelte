<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';

	export let control: Control;

	$: controlState = Number($state[control.states.active]) ? 'on' : 'off';
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
		name: control.details.text[controlState],
		color: control.details.color[controlState]
	};
</script>

<LbControl {iconView}	{textView} {stateView} />
