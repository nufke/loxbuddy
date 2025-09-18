<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let loads = control.details.loads;
	let mode = control.details.mode;

	let currentPower = $derived(Number(store.getState(control.states.currentPower)));
	let peakOverloadPower = $derived(Number(store.getState(control.states.peakOverloadPower)));
	let maxPower = $derived(Number(store.getState(control.states.maxPower)));
	let availablePower = $derived(Number(store.getState(control.states.availablePower))); // remaining free power
	let maxPowerExceeded = $derived(Number(store.getState(control.states.maxPowerExceeded)));
	let maxTp = $derived(Number(store.getState(control.states.maxTp)));
	let lockedLoads = $derived(Number(store.getState(control.states.lockedLoads)));
	let statusLoads = $derived(Number(store.getState(control.states.statusLoads)));

	function getPowerLevel(n: number) {
		return (n.toLocaleString(store.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })) + ' kW ' + $_('Available').toLowerCase();
	}

	function setColor(powerRatio: number, text: boolean) {
		if (powerRatio == 0.01) return text ? 'dark:text-surface-300 text-surface-700' : 'fill-surface-950 dark:fill-surface-50';
		if (powerRatio < 0.7) return text ? 'dark:text-primary-500 text-primary-700' : 'dark:fill-primary-500 fill-primary-700';
		if (powerRatio < 0.9) return text ? 'dark:text-warning-500 text-warning-700' : 'dark:fill-warning-500 fill-warning-700';
		return text ? 'dark:text-error-500 text-error-700' : 'dark:fill-error-500 fill-error-700';
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		disableIcon: true
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: setColor(currentPower/maxPower, false),
		textName: control.name,
		statusName: getPowerLevel(availablePower),
		statusColor: setColor(currentPower/maxPower, true),
		modal: {
			...modal,
			details: {
				loadManager: {
					loads: loads,
					mode: mode,
					currentPower: currentPower,
					peakOverloadPower: peakOverloadPower,
					maxPower: maxPower,
					availablePower: availablePower,
					maxPowerExceeded: maxPowerExceeded,
					lockedLoads: lockedLoads,
					statusLoads: statusLoads,
				}
			}
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
