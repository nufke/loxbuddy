<script lang="ts">
	import { onMount } from 'svelte';
	import type { ControlView } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { fadeInOut } from '$lib/helpers/styles';
	import { _ } from 'svelte-i18n';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { format, sub, startOfDay, endOfDay, startOfISOWeek,
		endOfISOWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, getUnixTime } from 'date-fns';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { Statistics } from '$lib/types/models';
	import BarChart from '$lib/components/Charts/BarChart.svelte';
	import LineChart from '$lib/components/Charts/LineChart.svelte';
	import { utils } from '$lib/helpers/Utils';
	import fmt from 'sprintf-js';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	const items = ['Today', 'Day', 'Week', 'Month', 'Year', 'All'];
	const radius = 32;
	const anglePercent = 2 * Math.PI * radius / 100;

	let statisticV2 = controlView.control.statisticV2;
	let type = controlView.control.details?.type
	let totalFormat = controlView.control.details?.totalFormat;
	let actualFormat = controlView.control.details?.actualFormat;
	let powerName = String(controlView.control.details?.powerName);

	let statistics = $state({}) as Statistics;
	let date = $state(new SvelteDate());
	let selector = $state(items[0]);
	let activeSince = $state(getUnixTime(new SvelteDate()));

	let storageFormat = $derived(controlView.control.details?.storageFormat);
	let actual = $derived(Number(controlStore.getState(controlView.control.states?.actual)));
	let storageValue = $derived(Number(controlStore.getState(controlView.control.states?.storage)));
	let showSVG = $derived(type === 'storage' || (type === 'bidirectional' && selector !== 'Today'));
	let valueSVG = $derived(selector === 'Today' ? storageValue : getPercent('out'));
	let BgColorSVG = $derived(selector !== 'Today' && getPercent('out')
		? 'dark:stroke-secondary-500 stroke-secondary-700'
		: 'dark:stroke-surface-700 stroke-surface-200');
	
	// load statistics at mount
	onMount(async () => {
		await getStatisticsInfo();
		await getStatistics(new SvelteDate(), selector, type);
	});

	function getValue(key: string, idx: number = -1): string {
		const d = statistics['2']; // TODO we only use ID 2
		if (!d) return idx == -1 ? '–' : '0';
		const val = key === 'out' ? d.total : d.totalNeg;
		const str = utils.formatString(val, totalFormat);
		if (idx == -1) return `${str[0].toLocaleString(appStore.locale)} ${str[1]}`;
		return String(val);
	}

	function getPercent(key: string): number {
		const d = statistics['2']; // TODO we only use ID 2
		if (!d) return 0;
		const total = d.total + d.totalNeg;
		const input = key === 'out' ? d.total : d.totalNeg;
		return (input == 0) ? 0 : ((total == 0) ? 100 : Math.round((input/total)*100));
	}

	function getActual(): string {
		let status = (utils.formatString(actual, actualFormat)[0]).toLocaleString(appStore.locale) + ' ' + utils.formatString(actual, actualFormat)[1];
		if (type == 'storage') {
			status += ' (' + ((actual > 0) ? $_('Discharging') : $_('Charging')) + ')';
		}
		return status;
	}

	function startDate(s: string): boolean {
		switch (s) {
			case 'Today': return true; /* disable button when today */
			case 'Day': return getUnixTime(startOfDay(date)) < activeSince;
			case 'Week': return getUnixTime(startOfISOWeek(date)) < activeSince;
			case 'Month': return getUnixTime(startOfMonth(date)) < activeSince;
			case 'Year': return getUnixTime(startOfYear(date)) < activeSince;
		}
		return false;
	}

	function futureDate(s: string): boolean {
		const today = getUnixTime(new SvelteDate());
		switch (s) {
			case 'Today': return true; /* disable button when today */
			case 'Day': return getUnixTime(endOfDay(date)) > today;
			case 'Week': return getUnixTime(endOfISOWeek(date)) > today;
			case 'Month': return getUnixTime(endOfMonth(date)) > today;
			case 'Year': return getUnixTime(endOfYear(date)) > today;
		} 
		return false;
	}

	async function getStatisticsInfo(): Promise<void> {
		const info = await controlStore.fetchStatisticInfo(controlView.control);
		activeSince = Math.min(...Object.values(info).map((m) => m.activeSince));
	}

	async function getStatistics(newDate: SvelteDate, selector_: string = '', type_: string): Promise<void> {
		if (!statisticV2) return;
		statistics = await controlStore.fetchStatistics(controlView.control, statisticV2, newDate, selector_, type_);
	}

	function showDate(s: string): string {
		switch (s) {
			case 'Today': /* same as Day */
			case 'Day' : return format(date,'dd-MM-yyyy');
			case 'Week' : return format(startOfISOWeek(date),'dd-MM-yyyy') + ' - ' + format(endOfISOWeek(date),'dd-MM-yyyy');
			case 'Month': return format(date,'MMMM yyyy');
			case 'Year' : return format(date,'yyyy');
			default: /* none */
		}
		return ''; 
	}

	async function calcDate(n: number, s: string): Promise<void> {
		switch (s) {
			case 'Day' : date = sub(date, {days: n}); break;
			case 'Week' : date = sub(date, {weeks: n}); break;
			case 'Month': date = sub(date, {months: n}); break;
			case 'Year' : date = sub(date, {years: n}); break;
			default: /* none */
		}
		await doSelect(date, s);
	}

	async function close(): Promise<void> {
		controlView.dialog.action(false);
		selector = items[0]; // reset selector to first item ('Today')
		date = new SvelteDate(); // reset date
		await getStatistics(date, selector, type); // reset graph
	}

	function getLabel(s: string): string {
		switch (type) {
			case 'storage': return (s == 'out') ? $_('Charging') : $_('Discharging');
			case 'unidirectional': return powerName;
			case 'bidirectional': return (s == 'out') ? $_('Consume') : $_('Supply');
			default: /* none */
		}
		return '';
	}

	async function doSelect(newDate: SvelteDate, item: string): Promise<void> {
		const newDate_ = (item == 'Today') ? new SvelteDate() : newDate;
		await getStatistics(newDate_, item, type);
		selector = item; /* update the selector _after_ getting the statistics, to avoid glitsh in visualization */
		date = newDate_;
	}
</script>

{#if controlView.dialog.state}
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full overflow-hidden flex flex-col {controlView.dialog.size?.width || 'w-[450px]'} {fadeInOut}">
					<!--<LbInfo control={controlView.control}/>-->
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
					<Dialog.Description class="flex-1 min-h-0 flex flex-col overflow-hidden">
						<!-- Fixed header: selector tabs + date nav -->
						<div class="relative w-full flex flex-col items-center shrink-0">
							<div class="w-full mb-3 grid grid-cols-[repeat(6,auto)] bg-surface-50-950 rounded-lg h-[32px]">
								{#each items as item (item)}
									<button type="button" class="px-2 py-1 text-sm btn btn-base {selector == item ? 'bg-surface-300-700' : 'bg-surface-50-950'}" onclick={() => {doSelect(date, item)}}>
										{$_(item)}
									</button>
								{/each}
							</div>
							<div class="h-[44px]">
								{#if (selector != 'All')}
									<div class="flex flex-row gap-1 items-center justify-center bg-surface-50-950 rounded-lg h-[32px]">
										<button type="button" class="px-1 py-2 text-sm btn btn-base" disabled={startDate(selector)} onclick={() => calcDate(1, selector)}><LbIcon name="chevron-left" height="22"/></button>
										<button type="button" class="px-0 py-2 text-sm btn btn-base">{showDate(selector)}</button>
										<button type="button" class="px-1 py-2 text-sm btn btn-base" disabled={futureDate(selector)} onclick={() => calcDate(-1, selector)}><LbIcon name="chevron-right" height="22"/></button>
									</div>
								{/if}
							</div>
						</div>
						<!-- Scrollable content -->
						<div class="flex-1 min-h-0 w-full overflow-y-auto">
								<div class="w-full grid grid-cols-2">
									{#if selector == 'Today'}
										<div class="ml-1 justify-start">
											<p class="text-surface-950-50">{$_('Actual')}</p>
											<p class={controlView.statusColor}>{getActual()}</p>
											{#if type == 'storage'}
											<p class="mt-2 text-surface-950-50">{$_('State of Charge (SoC)')}</p>
											<p class={controlView.statusColor}>{fmt.sprintf(storageFormat, storageValue)}</p>
											{/if}
										</div>
									{:else}
										<div class="ml-1 justify-start">
											<p class="text-surface-950-50">{getLabel('out')}</p>
												<p class="dark:text-primary-500 text-primary-700">{getValue('out')}
												{#if type == 'bidirectional' || type == 'storage'}  
													({getPercent('out')}%)
												{/if}
												</p>
												{#if type == 'bidirectional' || type == 'storage'} 
												<p class="mt-2 text-surface-950-50">{getLabel('in')}</p>
												<p class="dark:text-secondary-500 text-secondary-700">{getValue('in')}
													({getPercent('in')}%)
												</p>
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
														stroke-dasharray="calc({anglePercent * valueSVG}) calc({anglePercent * (100 - valueSVG)})" stroke-width="12" fill="none"/>
												{/if}
											</svg>
										{/if}
									</div>
								</div>
								<div>
									{#if selector == 'Today'}
										<div class="w-full">
											<LineChart statistics={statistics[1]} storage={type == 'storage'} fixedStep={0}/>
										</div>
										{#if type == 'storage'}
											<div class="mt-4 mb-3 w-full">
												<LineChart statistics={statistics[3]} storage={true} fixedStep={100}/>
											</div>
										{/if}
									{:else}
										<div class="mt-4 w-full">
											<BarChart statistics={statistics[2]} />
										</div>
									{/if}
								</div>
							</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
