<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';

	let { control }: { control: Control } = $props();

	let url = $derived(control.details.url);

	function openWebPage() {
		window.open(url, "_blank")
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
		iconName: control.defaultIcon || store.getCategoryIcon(control),
		textName: control.name,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
