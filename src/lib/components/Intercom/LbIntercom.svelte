<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbIntercomModal from '$lib/components/Intercom/LbIntercomModal.svelte';
	import fmt from 'sprintf-js';
	import { store } from '$lib/stores/Store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let modal: ModalView = $state({
		action: (state: boolean) => {
			modal.state = state;
		},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, store.getState(control.states.text)),
		modal: modal,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbIntercomModal bind:controlView />
</div>
