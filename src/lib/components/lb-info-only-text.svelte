<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import fmt from 'sprintf-js';

	export let control: Control;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, $state[control.states.text]),
	};
</script>

<LbControl {controlView} />