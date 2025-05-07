<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control } from '$lib/types/models';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	export let control: Control;

	let openModal: boolean;

	const prod = $_('Production');
  const cons = $_('Consumption');

	$: prodCurr = $state[control.states.prodCurr];
	$: consCurr = $state[control.states.consCurr];

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf('%s %.2f kW • %s %.2f kW', prod[0], prodCurr, cons[0], consCurr),
		statusColor: '#69C350', //TODO add color map
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbModal {controlView} />
</div>

