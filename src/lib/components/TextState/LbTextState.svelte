<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let textAndIcon = $derived(String(store.getState(control.states.textAndIcon)));
	let iconAndColor = $derived(store.getState(control.states.iconAndColor));

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		noBlur: controlOptions.isLink,
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl, iconAndColor),
		iconColor: iconAndColor?.color || 'dark:fill-surface-50 fill-surface-950',
		textName: control.name,
		statusName: textAndIcon,
		links: control.links,
		dialog: dialog,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
