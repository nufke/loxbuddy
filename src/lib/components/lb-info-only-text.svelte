<script lang="ts">
	import type { Control, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import fmt from 'sprintf-js';

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, store.getState(control.states.text)),
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
