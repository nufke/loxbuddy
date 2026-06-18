<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbEnergyFlowMonitorDialog from '$lib/components/EnergyFlowMonitor/LbEnergyFlowMonitorDialog.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let dialog: DialogView = $state({
		action: (state: boolean) => { dialog.state = state },
		state: false
	});

	let actualFormat = $derived(control.details?.actualFormat ?? '%.1f kW');
	let productionPower = $derived(Number(controlStore.getState(control.states?.Ppwr) ?? 0));
	let storagePower = $derived(Number(controlStore.getState(control.states?.Spwr) ?? 0));
	let gridPower = $derived(Number(controlStore.getState(control.states?.Gpwr) ?? 0));
	let consumptionPower = $derived(gridPower + productionPower + storagePower);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: 'dark:text-primary-500 text-primary-700',
		textName: control.name,
		statusName: getStatusText(),
		statusColor: 'dark:text-primary-500 text-primary-700',
		dialog
	});

	function fmt(value: number): string {
		const [v, unit] = utils.formatString(value, actualFormat);
		return `${v.toLocaleString(appStore.locale)} ${unit}`;
	}

	function getStatusText(): string {
		const parts: string[] = [];
		if (productionPower !== 0) parts.push(`${$_('Production')[0]}: ${fmt(productionPower)}`);
		if (consumptionPower !== 0) parts.push(`${$_('Consumption')[0]}: ${fmt(consumptionPower)}`);
		return parts.join(' ') || fmt(consumptionPower);
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbEnergyFlowMonitorDialog bind:controlView />
</div>
