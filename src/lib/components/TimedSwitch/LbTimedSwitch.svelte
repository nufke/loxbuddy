<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/Common/LbModal.svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { _ } from 'svelte-i18n';
	import { loxWsClient } from '$lib/communication/LoxWsClient';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	/*
		deactivationDelay:
		 0: output turned off
		-1: output permanently on
		other: count down from deactivationDelayTotal
	*/
	let deactivationDelay = $derived(Number(store.getState(control.states.deactivationDelay)) || 0);

	let modalButton1: SingleButtonView = $derived(
		{
			name: (deactivationDelay == 0) ? $_('Turn on') : ((deactivationDelay == -1) ? $_('Turn off') : $_('Switch on permanently')),
			type: 'button',
			color: '',
			click: (e: any) => {
				loxWsClient.control(control.uuidAction, (deactivationDelay == 0) ? 'on' : ( (deactivationDelay == -1) ? 'off' : 'on' ));
			}
		}
	);

	let modalButton2: SingleButtonView = $derived(
		{
			name: (deactivationDelay == 0) ? $_('Start timer') : $_('Turn off'),
			type: 'button',
			color: '',
			click: () => {
				loxWsClient.control(control.uuidAction, (deactivationDelay == 0) ? 'pulse' : 'off');
			}
		}
	);

	let modalButton3: SingleButtonView = $derived(
		{
			name: $_('Restart timer'),
			type: 'button',
			color: '',
			click: () => {
				loxWsClient.control(control.uuidAction, 'pulse');
			}
		}
	);

	function formatTime(delay: number) {
		if (delay > 0) {
			let minutes = Math.floor(delay/60);
			let seconds = delay - minutes * 60;
			let time = (minutes > 0) ? String(minutes) + ' min ' : '';
			time += String(seconds) + ' s';
			return time;
		}
		return (delay == -1) ? $_('On') : $_('Off')
	}

	function setButtons() {
		let modalButtons: SingleButtonView[] = [];
		modalButtons.push(modalButton1);
		if (deactivationDelay != -1) modalButtons.push(modalButton2);
		if (deactivationDelay > 0) modalButtons.push(modalButton3);
		return modalButtons;
	}

	let controlButtons: SingleButtonView[] = $state([
		{
			iconName: '/loxicons/IconsFilled/timer-2.svg',
			type: 'button',
			iconColor: 'dark:fill-surface-50 fill-surface-950',
			click: () => {
				loxWsClient.control(control.uuidAction, 'pulse');
			}
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
		iconColor: (deactivationDelay == -1 || deactivationDelay > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		badgeIconName: (deactivationDelay > 0) ? 'Timer' : '',
		badgeIconColor: (deactivationDelay > 0) ? 'dark:bg-primary-500 bg-primary-700' : '',
		textName: control.name,
		statusName: formatTime(deactivationDelay),
		statusColor: (deactivationDelay == -1 || deactivationDelay > 0) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttons: controlButtons,
		modal: {
			...modal,
			buttons: setButtons()
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbModal bind:controlView />
</div>
