<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbMeterModal from '$lib/components/lb-meter-modal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { locale } from '$lib/helpers/utils';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let actualFormat = control.details.actualFormat;
	let totalFormat = control.details.totalFormat;

	let actual = $derived(Number(store.getState(control.states.actual))); 
	let total = $derived(Number(store.getState(control.states.total)));
	let totalDay = $derived(Number(store.getState(control.states.totalDay)));
	let totalWeek = $derived(Number(store.getState(control.states.totalWeek)));
	let totalMonth = $derived(Number(store.getState(control.states.totalMonth)));
	let totalYear = $derived(Number(store.getState(control.states.totalYear)));
	let storage = $derived(Number(store.getState(control.states.storage)));
	let totalNeg = $derived(Number(store.getState(control.states.totalNeg)));
	let totalNegDay = $derived(Number(store.getState(control.states.totalNegDay)));
	let totalNegWeek = $derived(Number(store.getState(control.states.totalNegWeek)));
	let totalNegMonth = $derived(Number(store.getState(control.states.totalNegMonth)));
	let totalNegYear = $derived(Number(store.getState(control.states.totalNegYear)));

	function printValue(n: number, scale: string, unit: string) {
		return [n.toLocaleString(locale), scale + unit];
	}

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

		let format = total ? totalFormat.split(' ') : actualFormat.split(' ');
		if (format.length<2) { /* no space found, so no scale and unit */
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

	function format(n: number, total:boolean = true) {
		let su = getScaleUnit(total)
	
		if (Math.abs(n) < 1E3/su.scale) { 
			n *= 1E3;
			n = Math.round(n);
			return printValue(n, '', su.unit);
		}

		if (Math.abs(n) > 1E3/su.scale && Math.abs(n) < 1E6/su.scale) { 
			n = Math.round(n * 10) / 10;
			return printValue(n, 'k', su.unit);
		}

		if (Math.abs(n) > 1E6/su.scale && Math.abs(n) < 1E9/su.scale) {
			n /= 1E3;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'M', su.unit);
		}

		if (Math.abs(n) > 1E9/su.scale) {
			n /= 1E6;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'G', su.unit);
		}
		return printValue(0, '', '');
	}

	let details = $derived({
		'actual': format(actual, false),
		'totalDay': format(totalDay),
		'totalWeek': format(totalWeek),
		'totalMonth': format(totalMonth),
		'totalYear': format(totalYear),
		'total': format(total),
		'storage': (Math.round(storage * 10) / 10).toLocaleString(locale),
		'totalNegDay': format(totalNegDay),
		'totalNegWeek': format(totalNegWeek),
		'totalNegMonth': format(totalNegMonth),
		'totalNegYear': format(totalNegYear),
		'totalNeg': format(totalNeg)
	});

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (actual > 0) ? 'dark:fill-primary-500 fill-primary-700' : ((actual == 0) ? 'dark:fill-surface-50 fill-surface-950' : 'dark:fill-tertiary-500 fill-tertiary-700'),
		textName: control.name,
		statusName: format(actual, false).join(' '),
		statusColor: (actual > 0) ? 'dark:text-primary-500 text-primary-700' : ((actual == 0) ? 'dark:text-surface-50 text-surface-950' : 'dark:text-tertiary-500 text-tertiary-700'),
		modal: {
			...modal,
			details }
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbMeterModal bind:controlView />
</div>
