<script lang="ts">
	import type { Control, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import { store } from '$lib/stores/store.svelte';

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let buttons: SingleButtonView[] = $state([
		{
			name: 'Push',
			iconName: 'Circle',
			type: 'button',
			color: '',
			click: () => {
				publishTopic(control.uuidAction, 'pulse');
			}
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		textName: control.name,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
