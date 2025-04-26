<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { state, categories } from '$lib/stores/stores';
	import LbTextModal from '$lib/components/lb-text-modal.svelte';

	export let control: Control;

	let openModal: boolean;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: $state[control.states.textAndIcon],
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
