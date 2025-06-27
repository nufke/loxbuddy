<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlOptions, ControlView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { store } from '$lib/stores/store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let buttonActive = $derived(Number(store.getState(control.states.active)) == 1);

	let buttons: SingleButtonView[] = $derived([
		{
			name: buttonActive ? 'Switch off' : 'Switch on',
			type: 'switch',
			click: (e: any) => {
				publishTopic(control.uuidAction, e.checked ? '1' : '0');
			}	
		}
	]);

	let modal = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		iconColor: buttonActive ? 'fill-primary-500' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		buttonState: buttonActive,
		buttons: buttons,
		modal: modal,
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	{#if !controlOptions.action} <!-- disable modal popup for controls with action -->
		<LbModal bind:controlView={controlView}/>
	{/if}
</div>
