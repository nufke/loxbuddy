<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbIntercomModal from '$lib/components/lb-intercom-modal.svelte';
	import fmt from 'sprintf-js';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	function requestLastImages() {
		publishTopic(control.uuidAction + '/lastBellEventImages', '1');
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state; if (state) { requestLastImages(); } },
		state: false,
	});

	type DetailsView = {
		hasLastBellEventImages: Boolean;
		lastBellEvents: string[];
		lastBellEventImages: any;
	}

	let events = $derived(String(store.getState(control.states.lastBellEvents)));
	let lastBellEvents = $derived(events.includes('|') ? events.split('|'): []);
	let lastBellEventImages = $derived(store.getLastBellEventImages(control.uuidAction));

	let	details: DetailsView = $derived({
		hasLastBellEventImages: control.details.lastBellEventImages,
		lastBellEvents: lastBellEvents,
		lastBellEventImages: lastBellEventImages
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, store.getState(control.states.text)),
		details: details,
		securedDetails: store.getSecuredDetails(control.uuidAction),
		modal: modal,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbIntercomModal bind:controlView />
</div>
