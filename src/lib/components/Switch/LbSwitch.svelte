<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, SingleButtonView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let buttonActive = $derived(Number(controlStore.getState(control.states.active)) == 1);

	let buttons: SingleButtonView[] = $derived([
		{
			name: buttonActive ? 'Switch off' : 'Switch on',
			type: 'switch',
			click: (e: any) => {
				controlStore.setControl(control.uuidAction, e.checked ? 'on' : 'off');
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
		isSubControl: controlOptions.isSubControl,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: buttonActive ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50',
		statusName: buttonActive ? $_('On') : $_('Off'),
		statusColor: buttonActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		textName: control.name,
		buttonState: buttonActive,
		buttons: buttons,
		dialog: dialog,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if !controlOptions.action} <!-- TODO disable dialog popup for controls with action -->
		<LbDialog bind:controlView={controlView}/>
	{/if}
</div>
