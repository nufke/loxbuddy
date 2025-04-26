<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import LbTextModal from '$lib/components/lb-text-modal.svelte';
	import fmt from 'sprintf-js';

	export let control: Control;

	let openModal: boolean;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, $state[control.states.text]),
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbTextModal {controlView} />
</div>
