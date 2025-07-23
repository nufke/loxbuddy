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
		return n.toLocaleString(locale) + ' ' + scale + unit;
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

	function format(n: number, total = true) {
		let scaleUnit = total ? totalFormat.split(' ')[1] : actualFormat.split(' ')[1]; // e.g kW
		let scaleStr = scaleUnit[0];
		let unitStr;
		let scale = getScale(scaleStr);

		if (scale == 1) {
			unitStr = scaleUnit;
			scaleStr = '';
		} else {
			unitStr = scaleUnit.slice(1);
		}

		if (n < 1E3/scale) { 
			n *= 1E3;
			n = Math.round(n);
			return printValue(n, '', unitStr);
		}

		if (n > 1E3/scale && n < 1E6/scale) { 
			n = Math.round(n * 10) / 10;
			return printValue(n, 'k', unitStr);
		}

		if (n > 1E6/scale && n < 1E9/scale) {
			n /= 1E3;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'M', unitStr);
		}

		if (n > 1E9/scale) {
			n /= 1E6;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'G', unitStr);
		}
	}

	let details = $derived({
		'actual': format(actual, false),
		'totalDay': format(totalDay),
		'totalWeek': format(totalWeek),
		'totalMonth': format(totalMonth),
		'totalYear': format(totalYear),
		'total': format(total),
		'storage': String(Math.round(storage * 10) / 10),
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
		iconColor: (actual > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: format(actual, false),
		statusColor: (actual > 0) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-700 dark:text-surface-300',
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
