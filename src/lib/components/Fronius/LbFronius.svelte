<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbModal from '$lib/components/Common/LbModal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/Store.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const prod = $_('Production');
	const cons = $_('Consumption');
	let prodCurr = $derived(Number(store.getState(control.states.prodCurr)));
	let consCurr = $derived(Number(store.getState(control.states.consCurr)));

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf('%s %.2f kW • %s %.2f kW', prod[0], prodCurr, cons[0], consCurr),
		statusColor: 'dark:text-primary-500 text-primary-700',
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbModal bind:controlView />
</div>
