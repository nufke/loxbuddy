<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let position = $derived(Number(store.getState(control.states.position)) * 100);
	let type = control.details.animation

	/* Gate types (based on animation detail )
		0 = Garage Door
		1 = Single Gate opening to the left
		2 = Single Gate opening to the right
		3 = Gate opening to both sides
		4 = Folding door opening to the left
		5 = Folding door opening to the right
	*/

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'ChevronDown',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'close')
		},
		{
			iconName: 'ChevronUp',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'open')
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: controlOptions.showModal,
		class: 'grid-cols-2',
		buttons: [
			{
				name: $_('Closing'),
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'close'),
			},
			{
				name: $_('Opening'),
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'open'),
			},
			{
				name: $_('Open partially'),
				type: 'button',
				color: '',
				class: 'col-span-2',
				click: () => publishTopic(control.uuidAction, 'partiallyOpen'),
			}
		]
	});

  let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: (position > 99) ? $_('Open') : ( (position < 1) ? $_('Closed') :  fmt.sprintf('%2.0f %% %s', position, $_('Open'))),
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
