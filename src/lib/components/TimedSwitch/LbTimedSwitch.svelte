<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	/*
		deactivationDelay:
		 0: output turned off
		-1: output permanently on
		other: count down from deactivationDelayTotal
	*/
	let deactivationDelay = $derived(Number(controlStore.getState(control.states.deactivationDelay)) || 0);

	let dialogButton1: SingleButtonView = $derived(
		{
			name: (deactivationDelay == 0) ? $_('Turn on') : ((deactivationDelay == -1) ? $_('Turn off') : $_('Switch on permanently')),
			type: 'button',
			color: '',
			click: (e: any) => {
				controlStore.setControl(control.uuidAction, (deactivationDelay == 0) ? 'on' : ( (deactivationDelay == -1) ? 'off' : 'on' ));
			}
		}
	);

	let dialogButton2: SingleButtonView = $derived(
		{
			name: (deactivationDelay == 0) ? $_('Start timer') : $_('Turn off'),
			type: 'button',
			color: '',
			click: () => {
				controlStore.setControl(control.uuidAction, (deactivationDelay == 0) ? 'pulse' : 'off');
			}
		}
	);

	let dialogButton3: SingleButtonView = $derived(
		{
			name: $_('Restart timer'),
			type: 'button',
			color: '',
			click: () => {
				controlStore.setControl(control.uuidAction, 'pulse');
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
		let dialogButtons: SingleButtonView[] = [];
		dialogButtons.push(dialogButton1);
		if (deactivationDelay != -1) dialogButtons.push(dialogButton2);
		if (deactivationDelay > 0) dialogButtons.push(dialogButton3);
		return dialogButtons;
	}

	let controlButtons: SingleButtonView[] = $state([
		{
			iconName: 'timer-2',
			type: 'button',
			iconColor: 'dark:text-surface-50 text-surface-950',
			click: () => {
				controlStore.setControl(control.uuidAction, 'pulse');
			}
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: controlOptions.showDialog
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: (deactivationDelay == -1 || deactivationDelay > 0) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50',
		badgeIconName: (deactivationDelay > 0) ? 'Timer' : '',
		badgeIconColor: (deactivationDelay > 0) ? 'dark:bg-primary-500 bg-primary-700' : '',
		textName: control.name,
		statusName: formatTime(deactivationDelay),
		statusColor: (deactivationDelay == -1 || deactivationDelay > 0) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttons: controlButtons,
		dialog: {
			...dialog,
			buttons: setButtons()
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
