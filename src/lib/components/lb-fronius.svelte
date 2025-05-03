<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control } from '$lib/types/models';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	export let control: Control;

	let openModal: boolean;

	$: p = $state[control.states.prodCurr];
	$: c = $state[control.states.consCurr];

	const prod = $_('Production')[0];
  const cons = $_('Consumption')[0];

  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: prod + fmt.sprintf(' %.2f', p) + ' kW • ' + cons + fmt.sprintf(' %.2f', c) + ' kW',
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

