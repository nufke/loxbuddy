<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbMeterDialog from '$lib/components/Meter/LbMeterDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let actualFormat = $derived(control.details.actualFormat);
	let totalFormat = $derived(control.details.totalFormat);
	let type = $derived(control.details.type);

	let actual = $derived(Number(controlStore.getState(control.states.actual))); 
	let total = $derived(Number(controlStore.getState(control.states.total)));
	let totalDay = $derived(Number(controlStore.getState(control.states.totalDay)));
	let totalWeek = $derived(Number(controlStore.getState(control.states.totalWeek)));
	let totalMonth = $derived(Number(controlStore.getState(control.states.totalMonth)));
	let totalYear = $derived(Number(controlStore.getState(control.states.totalYear)));
	let storage = $derived(Number(controlStore.getState(control.states.storage)));
	let totalNeg = $derived(Number(controlStore.getState(control.states.totalNeg)));
	let totalNegDay = $derived(Number(controlStore.getState(control.states.totalNegDay)));
	let totalNegWeek = $derived(Number(controlStore.getState(control.states.totalNegWeek)));
	let totalNegMonth = $derived(Number(controlStore.getState(control.states.totalNegMonth)));
	let totalNegYear = $derived(Number(controlStore.getState(control.states.totalNegYear)));

	let details = $derived({
		actual: {
			out: utils.formatString(actual, actualFormat),
		},
		day: {
			out: utils.formatString(totalDay, totalFormat),
			in: utils.formatString(totalNegDay, totalFormat)
		},
		week: {
			out: utils.formatString(totalWeek, totalFormat),
			in: utils.formatString(totalNegWeek, totalFormat)
		},
		month: {
			out: utils.formatString(totalMonth, totalFormat),
			in: utils.formatString(totalNegMonth, totalFormat),
		},
		year: {
			out: utils.formatString(totalYear, totalFormat),
			in: utils.formatString(totalNegYear, totalFormat)
		},
		all: {
			out: utils.formatString(total, totalFormat),
			in: utils.formatString(totalNeg, totalFormat)
		},
	});

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
			case 'storage': status += `(${(actual > 0) ? $_('Discharging') : $_('Charging')})`; break;
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
		dialog: {
			...dialog,
			details }
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbMeterDialog bind:controlView />
</div>
