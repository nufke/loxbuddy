<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';

	let { control }: { control: Control } = $props();

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: control.defaultIcon || store.getCategoryIcon(control),
		textName: control.name,
		statusName: store.getState(control.states.textAndIcon),
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView} />
	<LbModal bind:controlView={controlView} />
</div>
