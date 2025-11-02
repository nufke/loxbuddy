<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbModal from '$lib/components/Common/LbModal.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let controlState = $derived(Number(store.getState(control.states.active)) ? 'on' : 'off');

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
		statusName: control.details.text[controlState],
		statusColor: control.details.color[controlState],
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbModal bind:controlView />
</div>
