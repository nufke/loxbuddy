<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlOptions, ControlView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import { store } from '$lib/stores/store.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let buttonActive = $derived(store.getState(control.states.active) == '1');

	let buttons: SingleButtonView[] = $state([
		{
			type: 'switch',
			name: 'Switch off,Switch on',
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
		iconColor: buttonActive ? 'fill-green-500' : 'fill-white',
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
