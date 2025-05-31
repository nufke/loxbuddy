<script lang="ts">
	import type { Control, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let controlState = $derived(Number(store.getState(control.states.active)) ? 'on' : 'off');

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});
	
	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		textName: control.name,
		statusName: control.details.text[controlState],
		statusColor: control.details.color[controlState],
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
