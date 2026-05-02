<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbMeterDialog from '$lib/components/Meter/LbMeterDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let actualFormat = $derived(control.details.actualFormat);
	let totalFormat = $derived(control.details.totalFormat);

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

	function getScale(s:string) {
		let scale: number = 1;
		switch(s) {
			case 'm': scale = 0.001; break;
			case 'k': scale = 1000; break;
			case 'M': scale = 1000000; break;
			case 'G': scale = 1000000; break;
			default: scale = 1; /* scale not found, assume 1 */
		}
		return scale;
	}

	function getScaleUnit(total: boolean = true) {
		let format = total ? totalFormat.match(/.*f(.*)/) : actualFormat.match(/.*f(.*)/);
		if (format.length<2) { /* no scale and unit found */
			return { scale: 1, unit: ''}
		} 

		let scaleUnit = format[1]; // e.g kW
		if (scaleUnit.length<2) { /* no scale found, only unit */
			return {scale: 1, unit: scaleUnit}
		}

		let scale = getScale(scaleUnit[0]);
		if (scale == 1) {
			return {scale: 1, unit: scaleUnit[0]}
		} else {
			return {scale: scale, unit: scaleUnit.slice(1)}
		}
	}

	function format(n: number, total: boolean = true) {
		let su = getScaleUnit(total);
		if (Math.abs(n) < 1E3/su.scale) { 
			n *= 1E3;
			n = Math.round(n);
			return [n, su.unit];
		}

		if (Math.abs(n) >= 1E3/su.scale && Math.abs(n) < 1E6/su.scale) { 
			n = Math.round(n * 10) / 10;
			return [n, 'k' + su.unit];
		}

		if (Math.abs(n) >= 1E6/su.scale && Math.abs(n) < 1E9/su.scale) {
			n /= 1E3;
			n = Math.round(n * 100) / 100;
			return [n, 'M' + su.unit];
		}

		if (Math.abs(n) >= 1E9/su.scale) {
			n /= 1E6;
			n = Math.round(n * 100) / 100;
			return [n, 'G' + su.unit];
		}
		return [0, ''];
	}

	let details = $derived({
		actual: {
			out: format(actual, false),
		},
		day: {
			out: format(totalDay),
			in: format(totalNegDay)
		},
		week: {
			out: format(totalWeek),
			in: format(totalNegWeek)
		},
		month: {
			out: format(totalMonth),
			in: format(totalNegMonth),
		},
		year: {
			out: format(totalYear),
			in: format(totalNegYear)
		},
		all: {
			out: format(total),
			in: format(totalNeg)
		},
	});

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: (actual > 0) ? 'dark:text-secondary-500 text-secondary-700' : ((actual == 0) ? 'dark:text-surface-50 text-surface-950' : 'dark:text-primary-500 text-primary-700'),
		textName: control.name,
		statusName: (format(actual, false)[0]).toLocaleString(appStore.locale) + ' ' + format(actual, false)[1] + ' (' + ((actual > 0) ? $_('Supply') : $_('Consume')) + ')',
		statusColor: (actual > 0) ? 'dark:text-secondary-500 text-secondary-700' : ((actual == 0) ? 'dark:text-surface-300 text-surface-700' : 'dark:text-primary-500 text-primary-700'),
		dialog: {
			...dialog,
			details }
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbMeterDialog bind:controlView />
</div>
