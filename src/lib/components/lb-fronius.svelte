<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	const prod = $_('Production');
	const cons = $_('Consumption');

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		textName: control.name,
		statusName: fmt.sprintf('%s %.2f kW • %s %.2f kW', prod[0], store.getState(control.states.prodCurr), cons[0], store.getState(control.states.consCurr)),
		statusColor: '#69C350', //TODO add color map
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
