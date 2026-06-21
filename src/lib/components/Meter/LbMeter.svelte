<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { Control, ControlOptions, Statistics } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';
	import { SvelteDate } from 'svelte/reactivity';
	import { format, sub, startOfDay, endOfDay, startOfISOWeek,
		endOfISOWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, getUnixTime } from 'date-fns';
	import BarChart from '$lib/components/Charts/BarChart.svelte';
	import LineChart from '$lib/components/Charts/LineChart.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const items = ['Today', 'Day', 'Week', 'Month', 'Year', 'All'];
	const radius = 32;
	const anglePercent = 2 * Math.PI * radius / 100;

	let controlOpen = $state(false);
	let statistics = $state({}) as Statistics;
	let date = $state(new SvelteDate());
	let selector = $state(items[0]);
	let activeSince = $state(getUnixTime(new SvelteDate()));

	let statisticV2 = control.statisticV2;
	let type = control.details?.type;
	let totalFormat = control.details?.totalFormat;
	let actualFormat = control.details?.actualFormat;
	let powerName = String(control.details?.powerName);

	let legend = $state({
		storage: [$_('Charging'), $_('Discharging')],
		unidirectional: [powerName],
		bidirectional: [$_('Supply'), $_('Consume')]
	});

	let storageFormat = $derived(control.details?.storageFormat);
	let actual = $derived(Number(controlStore.getState(control.states?.actual)));
	let storageValue = $derived(Number(controlStore.getState(control.states?.storage)));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(setColor(actual));
	let statusName = $derived(setStatus());
	let statusColor = $derived(setColor(actual, true));
	let showSVG = $derived(type === 'storage' || (type === 'bidirectional' && selector !== 'Today'));
	let valueSVG = $derived(selector === 'Today' ? storageValue : getPercent('in'));
	let BgColorSVG = $derived(selector !== 'Today' && getPercent('in')
		? 'dark:stroke-secondary-500 stroke-secondary-700'
		: 'dark:stroke-surface-700 stroke-surface-200');

	onMount(async () => {
		await getStatisticsInfo();
		await getStatistics(new SvelteDate(), selector, type);
	});

	/**
	 * Maps a meter value to a Tailwind colour class based on meter type and direction.
	 *
	 * @param val - the actual meter value.
	 * @param status - true to return a text colour, false for an icon colour.
	 * @returns Tailwind colour class string.
	 */
	function setColor(val: number, status: boolean = false): string {
		if (val == 0) return status ? 'dark:text-surface-300 text-surface-700' : 'dark:text-surface-50 text-surface-950';
		switch (type) {
			case 'storage': return (val > 0) ? 'dark:text-secondary-500 text-secondary-700' : 'dark:text-primary-500 text-primary-700';
			case 'unidirectional': return 'dark:text-primary-500 text-primary-700';
			case 'bidirectional': return (val > 0) ? 'dark:text-secondary-500 text-secondary-700' : 'dark:text-primary-500 text-primary-700';
			default: return 'dark:text-surface-50 text-surface-950';
		}
	}

	/**
	 * Builds the card status string from the current actual value and meter type.
	 *
	 * @returns formatted status string combining value, unit, and direction label.
	 */
	function setStatus(): string {
		let status = '';
		let value = `${(utils.formatString(Math.abs(actual), actualFormat)[0]).toLocaleString(appStore.locale)} ${utils.formatString(Math.abs(actual), actualFormat)[1]}`;
		switch (type) {
			case 'storage': status += `${fmt.sprintf(storageFormat, storageValue)} ${(actual < 0) ? $_('Charging') : $_('Discharging')}, ${value}`; break;
			case 'bidirectional': status += `${value}, ${(actual > 0) ? $_('Consume') : $_('Supply')}`; break;
			case 'unidirectional': status += `${value}, ${powerName}`; break;
		}
		return status;
	}

	/**
	 * Returns the formatted current actual value with its direction label for display in the dialog.
	 *
	 * @returns formatted string, e.g. "3.2 kW (Charging)".
	 */
	function getActual(): string {
		let status = (utils.formatString(Math.abs(actual), actualFormat)[0]).toLocaleString(appStore.locale) + ' ' + utils.formatString(Math.abs(actual), actualFormat)[1];
		switch (type) {
			case 'storage': status += ` (${(actual < 0) ? $_('Charging') : $_('Discharging')})`; break;
			case 'bidirectional': status += ` (${(actual > 0) ? $_('Consume') : $_('Supply')})`; break;
		}
		return status;
	}

	/**
	 * Retrieves a statistics total value for a given direction key.
	 *
	 * @param key - 'in' for input/supply, 'out' for output/consumption.
	 * @param idx - -1 to return a formatted string, 0+ to return the raw numeric string.
	 * @returns formatted or raw statistics string, '–' when no data.
	 */
	function getValue(key: string, idx: number = -1): string {
		const stats = statistics['2']; // TODO we only use ID 2
		if (!stats) return idx == -1 ? '–' : '0';
		const val = key === 'out' || type === 'unidirectional' ? stats.total : stats.totalNeg;
		const str = utils.formatString(val, totalFormat);
		if (idx == -1) return `${str[0].toLocaleString(appStore.locale)} ${str[1]}`;
		return String(val);
	}

	/**
	 * Calculates the percentage share of a direction within the total statistics period.
	 *
	 * @param key - 'in' for input/supply, 'out' for output/consumption.
	 * @returns percentage rounded to the nearest integer, 0 when no data.
	 */
	function getPercent(key: string): number {
		const d = statistics['2']; // TODO we only use ID 2
		if (!d) return 0;
		const total = d.total + d.totalNeg;
		const input = key === 'out' ? d.total : d.totalNeg;
		return (input == 0) ? 0 : ((total == 0) ? 100 : Math.round((input / total) * 100));
	}

	/**
	 * Returns the localised legend label for a chart direction based on meter type.
	 *
	 * @param s - 'in' for input/charging/supply, 'out' for output/discharging/consumption.
	 * @returns localised label string.
	 */
	function getLabel(s: string): string {
		switch (type) {
			case 'storage': return (s == 'in') ? $_('Charging') : $_('Discharging');
			case 'unidirectional': return $_('Total');
			case 'bidirectional': return (s == 'out') ? $_('Consume') : $_('Supply');
			default: /* none */
		}
		return '';
	}

	/**
	 * Returns true when backward navigation for the given period would go before
	 * the meter's activation date.
	 *
	 * @param s - period selector string ('Today', 'Day', 'Week', 'Month', 'Year').
	 * @returns true when the back button should be disabled.
	 */
	function startDate(s: string): boolean {
		switch (s) {
			case 'Today': return true;
			case 'Day': return getUnixTime(startOfDay(date)) < activeSince;
			case 'Week': return getUnixTime(startOfISOWeek(date)) < activeSince;
			case 'Month': return getUnixTime(startOfMonth(date)) < activeSince;
			case 'Year': return getUnixTime(startOfYear(date)) < activeSince;
		}
		return false;
	}

	/**
	 * Returns true when forward navigation for the given period would go beyond today.
	 *
	 * @param s - period selector string ('Today', 'Day', 'Week', 'Month', 'Year').
	 * @returns true when the forward button should be disabled.
	 */
	function futureDate(s: string): boolean {
		const today = getUnixTime(new SvelteDate());
		switch (s) {
			case 'Today': return true;
			case 'Day': return getUnixTime(endOfDay(date)) > today;
			case 'Week': return getUnixTime(endOfISOWeek(date)) > today;
			case 'Month': return getUnixTime(endOfMonth(date)) > today;
			case 'Year': return getUnixTime(endOfYear(date)) > today;
		}
		return false;
	}

	/**
	 * Formats the current date for display based on the active period selector.
	 *
	 * @param s - period selector string.
	 * @returns formatted date string, or empty string for 'All'.
	 */
	function showDate(s: string): string {
		switch (s) {
			case 'Today': /* same as Day */
			case 'Day': return format(date, 'dd-MM-yyyy');
			case 'Week': return format(startOfISOWeek(date), 'dd-MM-yyyy') + ' - ' + format(endOfISOWeek(date), 'dd-MM-yyyy');
			case 'Month': return format(date, 'MMMM yyyy');
			case 'Year': return format(date, 'yyyy');
			default: /* none */
		}
		return '';
	}

	/**
	 * Navigates the date by n periods in the given direction and reloads statistics.
	 *
	 * @param n - number of periods to move (positive = backward, negative = forward).
	 * @param s - period selector string ('Day', 'Week', 'Month', 'Year').
	 */
	async function calcDate(n: number, s: string): Promise<void> {
		switch (s) {
			case 'Day': date = sub(date, { days: n }); break;
			case 'Week': date = sub(date, { weeks: n }); break;
			case 'Month': date = sub(date, { months: n }); break;
			case 'Year': date = sub(date, { years: n }); break;
			default: /* none */
		}
		await doSelect(date, s);
	}

	/**
	 * Fetches the meter's statistic metadata to determine the earliest available date.
	 */
	async function getStatisticsInfo(): Promise<void> {
		const info = await controlStore.fetchStatisticInfo(control);
		activeSince = Math.min(...Object.values(info).map((m) => m.activeSince));
	}

	/**
	 * Fetches statistics for the given date and period selector, then stores the result.
	 *
	 * @param newDate - the reference date for the query.
	 * @param selector_ - period selector string.
	 * @param type_ - meter type string ('storage', 'unidirectional', 'bidirectional').
	 */
	async function getStatistics(newDate: SvelteDate, selector_: string = '', type_: string): Promise<void> {
		if (!statisticV2) return;
		statistics = await controlStore.fetchStatistics(control, statisticV2, newDate, selector_, type_);
	}

	/**
	 * Selects a period and reloads statistics for the resolved date.
	 * Updates selector only after data is fetched to avoid chart flicker.
	 *
	 * @param newDate - the reference date.
	 * @param item - period selector string.
	 */
	async function doSelect(newDate: SvelteDate, item: string): Promise<void> {
		const newDate_ = (item == 'Today') ? new SvelteDate() : newDate;
		await getStatistics(newDate_, item, type);
		selector = item;
		date = newDate_;
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

	/**
	 * Closes the control dialog and resets the period selector, date, and chart
	 * back to the initial 'Today' view.
	 */
	async function closeControl(): Promise<void> {
		controlOpen = false;
		selector = items[0];
		date = new SvelteDate();
		await getStatistics(date, selector, type);
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<!-- period selector tabs -->
			<div class="w-full mb-2 grid grid-cols-[repeat(6,auto)] bg-surface-50-950 rounded-lg h-[32px]">
				{#each items as item (item)}
					<button type="button" class="px-2 py-1 text-sm btn btn-base {selector == item ? 'bg-surface-300-700' : 'bg-surface-50-950'}"
							onclick={() => doSelect(date, item)}>
						{$_(item)}
					</button>
				{/each}
			</div>
			<!-- date navigation -->
			<div class="h-[44px] flex items-center justify-center">
				{#if selector !== 'All'}
					<div class="flex flex-row gap-1 items-center bg-surface-50-950 rounded-lg h-[32px]">
						<button type="button" class="px-1 py-2 text-sm btn btn-base" disabled={startDate(selector)} onclick={() => calcDate(1, selector)}>
							<LbIcon name="chevron-left" height="22"/>
						</button>
						<button type="button" class="px-0 py-2 text-sm btn btn-base">{showDate(selector)}</button>
						<button type="button" class="px-1 py-2 text-sm btn btn-base" disabled={futureDate(selector)} onclick={() => calcDate(-1, selector)}>
							<LbIcon name="chevron-right" height="22"/>
						</button>
					</div>
				{/if}
			</div>
			<!-- Scrollable: stats summary + charts -->
			<div class="w-full overflow-y-auto max-h-[calc(90vh-290px)]">
				<div class="w-full grid grid-cols-2">
					{#if selector == 'Today'}
						<div class="ml-1 justify-start">
							<p class="text-surface-950-50">{$_('Actual')}</p>
							<p class={statusColor}>{getActual()}</p>
							{#if type == 'storage'}
								<p class="mt-2 text-surface-950-50">{$_('State of Charge (SoC)')}</p>
								<p class={statusColor}>{fmt.sprintf(storageFormat, storageValue)}</p>
							{/if}
						</div>
					{:else}
						<div class="ml-1 justify-start">
							<p class="text-surface-950-50">{getLabel('in')}</p>
							<p class="dark:text-primary-500 text-primary-700">{getValue('in')}
								{#if type == 'bidirectional' || type == 'storage'}({getPercent('in')}%){/if}
							</p>
							{#if type == 'bidirectional' || type == 'storage'}
								<p class="mt-2 text-surface-950-50">{getLabel('out')}</p>
								<p class="dark:text-secondary-500 text-secondary-700">{getValue('out')} ({getPercent('out')}%)</p>
							{/if}
						</div>
					{/if}
					<div class="flex justify-end">
						{#if showSVG}
							<svg xmlns="http://www.w3.org/2000/svg" height="120" width="120" viewBox="0 0 100 100">
								<circle class={BgColorSVG} r={radius} cx="50" cy="50" stroke-width="12" fill="none"/>
								{#if valueSVG > 0}
									<circle class="dark:stroke-primary-500 stroke-primary-700" r={radius} cx="50" cy="50"
										transform="rotate({-90 + (valueSVG / 100)}, 50, 50)"
										stroke-dasharray="calc({anglePercent * valueSVG}) calc({anglePercent * (100 - valueSVG)})"
										stroke-width="12" fill="none"/>
								{/if}
							</svg>
						{/if}
					</div>
				</div>
				<div>
					{#if selector == 'Today'}
						<div class="w-full">
							<LineChart statistics={statistics[1]} legend={legend[type as keyof typeof legend] ?? []}/>
						</div>
						{#if type == 'storage'}
							<div class="mt-2 w-full">
								<LineChart statistics={statistics[3]} legend={[$_('Storage level')]} fixedStep={20} ystart={0}/>
							</div>
						{/if}
					{:else}
						<div class="mt-4 w-full">
							<BarChart statistics={statistics[2]} legend={legend[type as keyof typeof legend] ?? []}/>
						</div>
					{/if}
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}
