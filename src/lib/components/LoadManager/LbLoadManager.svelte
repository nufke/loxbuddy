<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let loads = control.details.loads;
	let mode = control.details.mode;

	let currentPower = $derived(Number(controlStore.getState(control.states.currentPower)));
	let peakOverloadPower = $derived(Number(controlStore.getState(control.states.peakOverloadPower)));
	let maxPower = $derived(Number(controlStore.getState(control.states.maxPower)));
	let availablePower = $derived(Number(controlStore.getState(control.states.availablePower))); // remaining free power
	let maxPowerExceeded = $derived(Number(controlStore.getState(control.states.maxPowerExceeded)));
	let maxTp = $derived(Number(controlStore.getState(control.states.maxTp)));
	let lockedLoads = $derived(Number(controlStore.getState(control.states.lockedLoads)));
	let statusLoads = $derived(Number(controlStore.getState(control.states.statusLoads)));

	function getPowerLevel(n: number) {
		return (n.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })) + ' kW ' + $_('Available').toLowerCase();
	}

	function setColor(powerRatio: number, text: boolean) {
		if (powerRatio == 0.01) return text ? 'dark:text-surface-300 text-surface-700' : 'fill-surface-950 dark:fill-surface-50';
		if (powerRatio < 0.7) return text ? 'dark:text-primary-500 text-primary-700' : 'dark:fill-primary-500 fill-primary-700';
		if (powerRatio < 0.9) return text ? 'dark:text-warning-500 text-warning-700' : 'dark:fill-warning-500 fill-warning-700';
		return text ? 'dark:text-error-500 text-error-700' : 'dark:fill-error-500 fill-error-700';
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
		disableIcon: true
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: setColor(currentPower/maxPower, false),
		textName: control.name,
		statusName: getPowerLevel(availablePower),
		statusColor: setColor(currentPower/maxPower, true),
		dialog: {
			...dialog,
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
	<LbDialog bind:controlView />
</div>
