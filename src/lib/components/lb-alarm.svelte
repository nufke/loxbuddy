<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let armed = $derived(Number(store.getState(control.states.armed))==1);
	let disabledMove = $derived(Number(store.getState(control.states.disabledMove))==1);

  function setUnsetAlarm(delay: boolean = false) {
		let cmd = armed ? 'off' : (delay ? 'delayedon/' : 'on/');
		cmd += armed ? '' : (disabledMove ? '0' : '1');
    publishTopic(control.uuidAction, cmd);
  }

	function setUnsetMmovement(e: any) {
		let cmd = 'dismv/' + (e.checked ? '0' : '1');
		publishTopic(control.uuidAction, cmd);
	}

	let buttons: SingleButtonView[] = $derived([
		{
			name: armed ? 'Disarm alarm' : 'Arm alarm',
			type: 'button',
			color: '',
			click: () => {
				setUnsetAlarm();
			}
		},
		{
			name: 'Arming delayed',
			type: armed ? '' : 'button',
			color: '',
			click: () => {
				setUnsetAlarm(true);  // with delay
			}
		},
		{
			name: 'Presence detection',
			type: 'switch',
			color: '',
			click: (e: any) => {
				setUnsetMmovement(e);
			}
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	function getStatus() {
		let status = armed ? $_('Armed') : $_('Disarmed');
		status += armed ? (disabledMove ? '' : ' ('+ $_('Presence detection on') + ')' ) : '';
		return status;
	}

  let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: armed ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getStatus(),
		statusColor: armed ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttonState: !disabledMove,
		modal: {
			...modal,
			buttons
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
