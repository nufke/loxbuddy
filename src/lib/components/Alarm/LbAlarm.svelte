<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let armed = $derived(Number(controlStore.getState(control.states.armed))==1);
	let disabledMove = $derived(Number(controlStore.getState(control.states.disabledMove))==1);

	let buttons: SingleButtonView[] = $derived([
		{
			name: armed ? 'Disarm alarm' : 'Arm alarm',
			type: 'button',
			color: '',
			click: (e: any, visuPw?: string) => {
				setUnsetAlarm(false, visuPw);
			}
		},
		{
			name: 'Arming delayed',
			type: armed ? '' : 'button',
			color: '',
			click: (e: any, visuPw?: string) => {
				setUnsetAlarm(true, visuPw); // with delay
			}
		},
		{
			name: 'Presence detection',
			type: 'switch',
			color: '',
			click: (e: any, visuPw?: string) => {
				setUnsetMmovement(e, visuPw);
			}
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: armed ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50',
		textName: control.name,
		statusName: getStatus(),
		statusColor: armed ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttonState: !disabledMove,
		dialog: {
			...dialog,
			buttons
		}
	});

	function setUnsetAlarm(delay: boolean, visuPw?: string): void {
		let cmd = armed ? 'off' : (delay ? 'delayedon/' : 'on/');
		cmd += armed ? '' : (disabledMove ? '0' : '1');
		controlStore.setControl(control, cmd, visuPw);
	}

	function setUnsetMmovement(e: any, visuPw?: string): void {
		let cmd = 'dismv/' + (e.checked ? '0' : '1');
		controlStore.setControl(control, cmd, visuPw);
	}

	function getStatus(): string {
		let status = armed ? $_('Armed') : $_('Disarmed');
		status += armed ? (disabledMove ? '' : ' ('+ $_('Presence detection on') + ')' ) : '';
		return status;
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
