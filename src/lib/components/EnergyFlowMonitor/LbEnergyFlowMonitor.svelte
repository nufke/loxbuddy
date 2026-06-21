<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);

	let actualFormat = $derived(control.details?.actualFormat ?? '%.1f kW');
	let nodes = $derived((control.details?.nodes ?? []) as any[]);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let productionPower = $derived(Number(controlStore.getState(control.states?.Ppwr) ?? 0));
	let storagePower = $derived(Number(controlStore.getState(control.states?.Spwr) ?? 0));
	let gridPower = $derived(Number(controlStore.getState(control.states?.Gpwr) ?? 0));
	let consumptionPower = $derived(gridPower + productionPower + storagePower);
	let statusName = $derived(getStatusText());

	/**
	 * Formats a raw power value using the control's `actualFormat` pattern.
	 *
	 * @param value - power value in the unit implied by `actualFormat`.
	 * @returns localised string with value and unit, e.g. '3.2 kW'.
	 */
	function fmt(value: number): string {
		const [v, unit] = utils.formatString(value, actualFormat);
		return `${v.toLocaleString(appStore.locale)} ${unit}`;
	}

	/**
	 * Builds the card status line from non-zero production and consumption values.
	 *
	 * @returns abbreviated status string, e.g. 'P: 3.2 kW C: 5.1 kW',
	 *          or the formatted consumption alone when production is zero.
	 */
	function getStatusText(): string {
		const parts: string[] = [];
		if (productionPower !== 0) parts.push(`${$_('Production')[0]}: ${fmt(productionPower)}`);
		if (consumptionPower !== 0) parts.push(`${$_('Consumption')[0]}: ${fmt(consumptionPower)}`);
		return parts.join(' ') || fmt(consumptionPower);
	}

	/**
	 * Returns the current power reading for a node from the control store.
	 *
	 * @param node - a node entry from `control.details.nodes`.
	 * @returns power value in the unit implied by `actualFormat`, or 0 when unavailable.
	 */
	function nodeActual(node: any): number {
		return Number(controlStore.getState(node.actualEfmState) ?? 0);
	}

	/**
	 * Returns the colour class for a node's power value based on node type and sign.
	 * - Grid: positive = importing (error colour), negative = exporting (primary colour).
	 * - Storage: positive = discharging (primary colour), negative = charging (secondary colour).
	 * - Other: always primary colour when non-zero.
	 *
	 * @param value - current power reading.
	 * @param nodeType - the node's type string, e.g. 'Grid', 'Storage', 'Production'.
	 * @returns Tailwind colour class string.
	 */
	function nodeColor(value: number, nodeType: string): string {
		if (value === 0) return 'dark:text-surface-300 text-surface-700';
		switch (nodeType) {
			case 'Grid':    return value > 0 ? 'dark:text-error-500 text-error-700' : 'dark:text-primary-500 text-primary-700';
			case 'Storage': return value > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-secondary-500 text-secondary-700';
			default:        return 'dark:text-primary-500 text-primary-700';
		}
	}

	/**
	 * Returns the colour class for a summary tile based on the sign of the value.
	 *
	 * @param value - the power value to colour.
	 * @param invert - when true, negative values get primary colour (used for grid import/export).
	 * @returns Tailwind colour class string.
	 */
	function summaryColor(value: number, invert: boolean = false): string {
		if (value === 0) return 'dark:text-surface-300 text-surface-700';
		const positive = invert ? value < 0 : value > 0;
		return positive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-secondary-500 text-secondary-700';
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} iconColor="dark:text-primary-500 text-primary-700"
	{statusName} statusColor="dark:text-primary-500 text-primary-700"
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="mt-4 flex flex-col gap-2">
				<div class="grid grid-cols-2 gap-2 p-2 rounded-lg bg-surface-50-950 border border-white/10">
					{#if productionPower !== 0}
						<div class="flex flex-col items-center">
							<p class="text-xs dark:text-surface-400 text-surface-600">{$_('Production')}</p>
							<p class="text-lg font-medium {summaryColor(productionPower)}">{fmt(productionPower)}</p>
						</div>
					{/if}
					<div class="flex flex-col items-center">
						<p class="text-xs dark:text-surface-400 text-surface-600">{$_('Consumption')}</p>
						<p class="text-lg font-medium {summaryColor(consumptionPower)}">{fmt(consumptionPower)}</p>
					</div>
					<div class="flex flex-col items-center">
						<p class="text-xs dark:text-surface-400 text-surface-600">{gridPower >= 0 ? $_('Grid import') : $_('Grid export')}</p>
						<p class="text-lg font-medium {summaryColor(gridPower, true)}">{fmt(Math.abs(gridPower))}</p>
					</div>
					{#if storagePower !== 0}
						<div class="flex flex-col items-center">
							<p class="text-xs dark:text-surface-400 text-surface-600">{storagePower > 0 ? $_('Discharging') : $_('Charging')}</p>
							<p class="text-lg font-medium {summaryColor(storagePower)}">{fmt(Math.abs(storagePower))}</p>
						</div>
					{/if}
				</div>
				<div class="flex flex-col gap-2">
					{#each nodes as node (node.uuid)}
						{@const actual = nodeActual(node)}
						<div class="flex flex-row items-center justify-between h-[52px] p-4 rounded-lg
								bg-surface-50-950 border border-white/10">
							<p class="truncate text-base">{node.title}</p>
							<p class="text-base shrink-0 {nodeColor(actual, node.nodeType)}">{fmt(actual)}</p>
						</div>
					{/each}
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}
