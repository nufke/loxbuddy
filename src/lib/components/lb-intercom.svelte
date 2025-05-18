<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, securedDetails, bellImages } from '$lib/stores/stores';
	import LbIntercomModal from '$lib/components/lb-intercom-modal.svelte';
	import fmt from 'sprintf-js';

	export let control: Control;

	let openModal: boolean;

	$: details = $securedDetails ? $securedDetails[control.uuidAction] : null;
	$: lastBellEvents = $state[control.states.lastBellEvents].split('|');
	$: lastBellImages = $bellImages ? $bellImages[control.uuidAction] : null;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, $state[control.states.text]),
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			details: {
				video: details,
				lastBellEventImages: control.details.lastBellEventImages,
				lastBellEvents: lastBellEvents,
				lastBellImages: lastBellImages
			}
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbIntercomModal {controlView} />
</div>
