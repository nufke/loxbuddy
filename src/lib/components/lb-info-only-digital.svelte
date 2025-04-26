<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import LbTextModal from '$lib/components/lb-text-modal.svelte';

	export let control: Control;

	let openModal: boolean;

	$: controlState = Number($state[control.states.active]) ? 'on' : 'off';

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: control.details.text[controlState],
		statusColor: control.details.color[controlState],
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
