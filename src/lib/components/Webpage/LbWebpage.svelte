<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/Common/LbModal.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let url = $derived(control.details.url);
	let urlHd = $derived(control.details.urlHd);

	function openWebPage() {
		window.open(url || urlHd, "_blank")
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'SquareArrowOutUpRight',
			name: 'Open link',
			type: 'button',
			color: '',
			click: () => openWebPage()
		}
	]);

	let	modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbModal bind:controlView />
</div>
