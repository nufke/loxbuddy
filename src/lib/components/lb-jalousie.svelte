<script lang="ts">
	import type { Control, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbJalousieModal from '$lib/components/lb-jalousie-modal.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import { store } from '$lib/stores/store.svelte';
	
	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let position = $derived(Number(store.getState(control.states.position)) * 100);

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'ChevronDown',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullDown')
		},
		{
			iconName: 'ChevronUp',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullUp')
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		buttons: [
			{
				iconName: 'ChevronDown',
				type: 'button',
				color: '',
				click: () => {},  // do nothing
				mousedown: () => { publishTopic(control.uuidAction, 'down')},
				mouseup: () => { publishTopic(control.uuidAction, 'DownOff')}
			},
			{
				iconName: 'ChevronUp',
				type: 'button',
				color: '',
				click: () => {}, // do nothing
				mousedown: () => publishTopic(control.uuidAction, 'up'),
				mouseup: () => publishTopic(control.uuidAction, 'UpOff')
			},
			{
				iconName: 'ArrowDownToLine',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'FullDown'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			},
			{
				iconName: 'ArrowUpToLine',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'FullUp'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			},
			{
				name: $_('Shade'),
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'shade'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			}
		]
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		iconColor: (position > 0) ? '#69C350' : 'white', //TODO add color map
		textName: control.name,
		statusName: position < 1 ? $_('Opened') : position > 99 ? $_('Closed') : fmt.sprintf('%1.0f%% ', position),
		statusColor: (position > 0) ? '#69C350' : 'white', //TODO add color map
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbJalousieModal bind:controlView={controlView}/>
</div>
