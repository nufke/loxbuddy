<script lang="ts">
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbIntercomDialog from '$lib/components/Intercom/LbIntercomDialog.svelte';
	import fmt from 'sprintf-js';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let dialog: DialogView = $state({
		action: (state: boolean) => {
			dialog.state = state;
		},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, controlStore.getState(control.states.text)),
		dialog: dialog,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbIntercomDialog bind:controlView />
</div>
