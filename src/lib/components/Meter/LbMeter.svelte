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

	let actualFormat = $derived(control.details.actualFormat);
	let type = $derived(control.details.type);
	let storageFormat = $derived(control.details.storageFormat);
	let actual = $derived(Number(controlStore.getState(control.states.actual))); 
	let storageValue = $derived(Number(controlStore.getState(control.states.storage))); 

	function setColor(val: number, status: boolean = false) {
		if (val == 0) return status ? 'dark:text-surface-300 text-surface-700' : 'dark:text-surface-50 text-surface-950';
		switch (type) {
			case 'storage': return (val > 0) ? 'dark:text-secondary-500 text-secondary-700' : 'dark:text-primary-500 text-primary-700';
			case 'unidirectional': return 'dark:text-primary-500 text-primary-700';
			case 'bidirectional': return (val > 0) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-secondary-500 text-secondary-700';
			default: return 'dark:text-surface-50 text-surface-950';
		}
	}

	function setStatus() {
		let status = `${(utils.formatString(actual, actualFormat)[0]).toLocaleString(appStore.locale)} ${utils.formatString(actual, actualFormat)[1]} `;
		switch (type) {
			case 'storage': status += `(${(actual > 0) ? $_('Discharging') : $_('Charging')}) SoC: ${fmt.sprintf(storageFormat, storageValue)}`; break;
			case 'bidirectional': status += `(${(actual > 0) ? $_('Consume') : $_('Supply')})`; break;
			default: '';
		}
		return status;
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

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
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbMeterDialog bind:controlView />
</div>
