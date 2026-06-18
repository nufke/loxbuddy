<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbMeterDialog from '$lib/components/Meter/LbMeterDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

	let actualFormat = $derived(control.details?.actualFormat);
	let type = $derived(control.details?.type);
	let powerName = $derived(control.details?.powerName);
	let storageFormat = $derived(control.details?.storageFormat);
	let actual = $derived(Number(controlStore.getState(control.states?.actual))); 
	let storageValue = $derived(Number(controlStore.getState(control.states?.storage))); 

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: setColor(actual),
		textName: control.name,
		statusName: setStatus(),
		statusColor: setColor(actual, true),
		dialog: dialog
	});

	function setColor(val: number, status: boolean = false): string {
		if (val == 0) return status ? 'dark:text-surface-300 text-surface-700' : 'dark:text-surface-50 text-surface-950';
		switch (type) {
			case 'storage': return (val > 0) ? 'dark:text-secondary-500 text-secondary-700' : 'dark:text-primary-500 text-primary-700';
			case 'unidirectional': return 'dark:text-primary-500 text-primary-700';
			case 'bidirectional': return (val > 0) ? 'dark:text-secondary-500 text-secondary-700' : 'dark:text-primary-500 text-primary-700';
			default: return 'dark:text-surface-50 text-surface-950';
		}
	}

	function setStatus(): string {
		let status: string = '';
		let value = `${(utils.formatString(Math.abs(actual), actualFormat)[0]).toLocaleString(appStore.locale)} ${utils.formatString(Math.abs(actual), actualFormat)[1]}`;
		switch (type) {
			case 'storage': status += `${fmt.sprintf(storageFormat, storageValue)} ${(actual < 0) ? $_('Charging') : $_('Discharging')}, ${value}`; break;
			case 'bidirectional': status += `${value}, ${(actual > 0) ? $_('Consume') : $_('Supply')}`; break;
			case 'unidirectional': status += `${value}, ${powerName}`; break;
		}
		return status;
	}

</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbMeterDialog bind:controlView />
</div>
