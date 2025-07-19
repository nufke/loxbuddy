<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let textAndIcon = $derived(String(store.getState(control.states.textAndIcon)));
	let iconAndColor = $derived(store.getState(control.states.iconAndColor));

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
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
		modal: modal,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
