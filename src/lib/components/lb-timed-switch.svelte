<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/communication/mqttclient';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let deactivationDelay = $derived(Number(store.getState(control.states.deactivationDelay)) || 0);

	let modalButtons: SingleButtonView[] = $derived([
		{
			name: (deactivationDelay == 0) ? $_('Turn on') : $_('Turn off'),
			type: 'button',
			color: '',
			click: (e: any) => {
				publishTopic(control.uuidAction, (deactivationDelay == 0) ? 'on' : 'off');
			}
		},
		{
			name: (deactivationDelay > 0) ? $_('Stop timer') : $_('Start timer'),
			type: 'button',
			color: '',
			click: () => {
				publishTopic(control.uuidAction, (deactivationDelay > 0) ? 'off' : 'pulse');
			}
		}
	]);

	let controlButtons: SingleButtonView[] = $state([
		{
			iconName: '/loxicons/IconsFilled/timer-2.svg',
			type: 'button',
			iconColor: 'dark:fill-surface-50 fill-surface-950',
			click: () => publishTopic(control.uuidAction, (deactivationDelay == 0) ? 'pulse' : 'off')
		}
	]);
	
	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: controlOptions.showModal
	});

  let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		buttons: controlButtons,
		modal: {
			...modal,
			buttons: modalButtons
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
