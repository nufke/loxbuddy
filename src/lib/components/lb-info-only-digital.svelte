<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';

	export let control: Control;

	$: controlState = Number($state[control.states.active]) ? 'on' : 'off';

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: control.details.text[controlState],
		statusColor: control.details.color[controlState]
	};
</script>

<LbControl {controlView} />
