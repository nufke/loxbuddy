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
	import type { StatisticsDiff, StatisticsInfo, StatisticsDiffEntry } from '$lib/types/models';
	import BarChart from '$lib/components/Charts/BarChart.svelte';
	import LineChart from '$lib/components/Charts/LineChart.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { fade } from 'svelte/transition';
	import fmt from 'sprintf-js';
	import { tick } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	const items = ['Day', 'Week', 'Month', 'Year', 'All'];

	let controlUuid = controlView.control.uuidAction; // not updated
	let statisticV2 = controlView.control.statisticV2;
	let type = controlView.control.details.type
	let totalFormat = controlView.control.details.totalFormat;
	let actualFormat = controlView.control.details.actualFormat;
	let powerName = controlView.control.details.powerName;

	let storageFormat = $derived(controlView.control.details.storageFormat);
	let actual = $derived(Number(controlStore.getState(controlView.control.states.actual))); 
	let storageValue = $derived(Number(controlStore.getState(controlView.control.states.storage))); 

	let statisticsInfo = $state({}) as StatisticsInfo;
	let statisticsDiff = $state({}) as StatisticsDiff;
	let date = $state(new SvelteDate());
	let selector = $state(items[0]);
	let dataPointUnit: string = $state('');
	let activeSince = $state(getUnixTime(new SvelteDate()));
	let selectedTab = $state(1);

	// load statistics once
	onMount(async () => {
		await getStatistics(new SvelteDate());
	});

	function getValue(key: string, idx: number = -1) {
		const d = statisticsDiff['2']; // TODO we only use ID 2
		if (!d) return idx == -1 ? '–' : 0;
		const val = key === 'out' ? d.total : d.totalNeg;
		const str = utils.formatString(val, totalFormat);
		if (idx == -1) return `${str[0].toLocaleString(appStore.locale)} ${str[1]}`;
		return val;
	}

	function getPercent(key: string) {
		const d = statisticsDiff['2']; // TODO we only use ID 2
		if (!d) return 0;
		const total = d.total + d.totalNeg;
		const input = key === 'out' ? d.total : d.totalNeg;
		return (input == 0) ? 0 : ((total == 0) ? 100 : Math.round((input/total)*100));
	}
	
	function getActual() {
		let status = (utils.formatString(actual, actualFormat)[0]).toLocaleString(appStore.locale) + ' ' + utils.formatString(actual, actualFormat)[1];
		if (type == 'storage') {
			status += ' (' + ((actual > 0) ? $_('Discharging') : $_('Charging')) + ')';
		}
		return status;
	}

	function isToday() {
		return startOfDay(date).getTime() === startOfDay(new SvelteDate()).getTime()
	}

	function startDate(s: string) {
		switch (s) {
			case 'Day': return getUnixTime(startOfDay(date)) < activeSince;
			case 'Week': return getUnixTime(startOfISOWeek(date)) < activeSince;
			case 'Month': return getUnixTime(startOfMonth(date)) < activeSince;
			case 'Year': return getUnixTime(startOfYear(date)) < activeSince;
		} 
	}

	function futureDate(s: string) {
		const today = getUnixTime(new SvelteDate());
		switch (s) {
			case 'Day': return getUnixTime(endOfDay(date)) > today;
			case 'Week': return getUnixTime(endOfISOWeek(date)) > today;
			case 'Month': return getUnixTime(endOfMonth(date)) > today;
			case 'Year': return getUnixTime(endOfYear(date)) > today;
		} 
	}

	async function getStatisticInfo() {
		await controlStore.fetchUrl(controlUuid, `jdev/sps/getStatisticInfo/${controlUuid}`)
			.then((resource) => resource.json())
			.then((json) => {
				let obj = json.LL?.value && utils.isValidJSONObject(json.LL.value) ? JSON.parse(json.LL.value) : json;
				if (obj.length) {
					obj.forEach( (item) => { 
						statisticsInfo[item.id] = {activeSince: item.activeSince};
						activeSince = Math.min(activeSince, item.activeSince);
					});
				}
			});
	}
	async function getStatistics(newDate: SvelteDate, selector: string = '') {
		if (!statisticV2) return;
		let fromUnixUtc: number;
		let untilUnixUtc: number;

		switch (selector) {
			case 'Day': fromUnixUtc =  getUnixTime(startOfDay(newDate)); untilUnixUtc = getUnixTime(endOfDay(newDate)); dataPointUnit = 'hour'; break;
			case 'Week': fromUnixUtc = getUnixTime(startOfISOWeek(newDate)); untilUnixUtc = getUnixTime(endOfISOWeek(newDate)); dataPointUnit = 'day'; break;
			case 'Month': fromUnixUtc = getUnixTime(startOfMonth(newDate)); untilUnixUtc = getUnixTime(endOfMonth(newDate)); dataPointUnit = 'day'; break;
			case 'Year': fromUnixUtc = getUnixTime(startOfYear(newDate)); untilUnixUtc = getUnixTime(endOfYear(newDate)); dataPointUnit = 'month'; break;
			case 'All': fromUnixUtc = 1230768000; untilUnixUtc = getUnixTime(new SvelteDate()); dataPointUnit = 'year'; break;
			default: fromUnixUtc =  getUnixTime(startOfDay(newDate)); untilUnixUtc = getUnixTime(endOfDay(newDate)); dataPointUnit = 'hour'; /* default is Day */
		}

		await getStatisticInfo();

		statisticV2.groups.map(async (item) => {
			const mode = item.accumulated ? 'diff' : 'raw';
			await controlStore.fetchUrl(controlUuid, `jdev/sps/getStatistic/${controlUuid}/${mode}/${fromUnixUtc}/${untilUnixUtc}/${dataPointUnit}/${item.id}/`)
			.then((response) => {	return response.ok ? response.arrayBuffer() : null; })
			.then((buffer) => {
				let stats: StatisticsDiffEntry[] = [];
				if (buffer) {
					const view = new DataView(buffer);
					const size = 4 + item.dataPoints.length*8;
					for( let i = 0; i < Math.floor(view.byteLength/size); i++) {
						let ts = view.getUint32(i*size, true);
						let values: number[] = [];
						for( let j = 0; j < item.dataPoints.length; j++) {
							values.push(view.getFloat64(i*size + 4 + j*8, true));
						}
						// we swap the array order for storage (battery) as in/out are reversed 
						stats.push({ts: ts, values: (type == 'storage' ? values.reverse() : values)});
					}
				}
				statisticsDiff[item.id] = {
					data: stats,
					title: item.dataPoints.length > 1 ? powerName : item.dataPoints[0].title,
					format: item.dataPoints[0].format,
					fromUnixUtc: fromUnixUtc,
					untilUnixUtc: untilUnixUtc,
					total: stats.flatMap(i=> i.values[0]).reduce((a, b) => a + b, 0),
					totalNeg: stats.flatMap(i=> i.values[1]).reduce((a, b) => a + b, 0) || 0, // TODO might not exist
					selector: selector
				};
			});
		});
	}

	function showDate(s: string) {
		switch (s) {
			case 'Day' : return format(date,'dd-MM-yyyy');
			case 'Week' : return format(startOfISOWeek(date),'dd-MM') + ' - ' + format(endOfISOWeek(date),'dd-MM');
			case 'Month': return format(date,'MMMM yyyy');
			case 'Year' : return format(date,'yyyy');
			default: /* none */
		}
	}

	async function calcDate(n: number, s: string) {
		switch (s) {
			case 'Day' : date = sub(date, {days: n}); break;
			case 'Week' : date = sub(date, {weeks: n}); break;
			case 'Month': date = sub(date, {months: n}); break;
			case 'Year' : date = sub(date, {years: n}); break;
			default: /* none */
		}
		await doSelect(date, s);
	}

	function getUnit(id: number, format: string) {
		const max = Math.max(statisticsDiff[id]?.total, statisticsDiff[id]?.totalNeg);
		return utils.formatString(max, format)[1];
	}

	async function undo() {
		await doSelect(new SvelteDate(), items[0]);
	}

	async function close() {
		controlView.dialog.action(false);
		selectedTab = 1; // reset to first tab
		selector = items[0]; // reset selector
		date = new SvelteDate(); // reset date
		await getStatistics(date, selector); // reset graph
	}

	function getLabel(s: string) {
		switch (type) {
			case 'storage': return (s == 'out') ? $_('Charging') : $_('Discharging');
			case 'unidirectional': return powerName;
			case 'bidirectional': return (s == 'out') ? $_('Consume') : $_('Supply');
			default: '';
		}
	}

	async function doSelect(newDate: SvelteDate, item: string ) {
		selector = item;
		date = newDate;
		await getStatistics(date, selector);
	}

	async function selectTab(tab: number) {
		await doSelect(new SvelteDate(), items[0]);
		await tick();
		selectedTab = tab;
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
								md:max-w-9/10 md:max-h-9/10 overflow-auto {controlView.dialog.size?.width || 'w-[450px]'} {fadeInOut}">
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
					<Dialog.Description>
						{#if selectedTab==1}
							{#if type != 'storage'}
								<div class="mb-6 flex flex-col items-center justify-center">
									<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
										<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"/>
									</div>
									<div class="flex items-center justify-center mt-2">
										<p class="text-lg truncate {controlView.statusColor}">{controlView.statusName}</p>
									</div>
								</div>
							{:else}
								<div class="w-full grid grid-cols-2">
									<div class="ml-2 justify-start">
										<p class="text-surface-950-50">{$_('Actual')}</p>
										<p class={controlView.statusColor}>{getActual()}</p>
										{#if type == 'storage'}
										<p class="mt-2 text-surface-950-50">{$_('State of Charge (SoC)')}</p>
										<p class={controlView.statusColor}>{fmt.sprintf(storageFormat, storageValue)}</p>
										{/if}
									</div>
									<div class="flex justify-end">
										{#if type == 'storage'}
											<svg xmlns="http://www.w3.org/2000/svg" height="120" width="120" viewBox="0 0 100 100">
												<circle class="dark:stroke-surface-700 stroke-surface-200" r="32" cx="50" cy="50" stroke-width="12" fill="none"/>
												{#if storageValue > 1}
												<circle class="dark:stroke-primary-500 stroke-primary-700" r="32" cx="50" cy="50" 
													transform="rotate({-90+(storageValue/100)},50,50)"
														stroke-dasharray="calc({2*3.1415*32*storageValue/100}) 
														calc({2*3.1415*32*(100-storageValue)/100})" stroke-width="12" fill="none"/>
												{/if}
											</svg>
										{/if}
									</div>
								</div>
							{/if}
							<div class="w-full">
								<p class="flex justify-center">{statisticsDiff[1]?.title} ({getUnit(1, statisticsDiff[1]?.format)})</p>
								<LineChart statistics={statisticsDiff[1]} storage={type == 'storage'} fixedStep={0}/>
								<p class="flex justify-center">{$_(utils.capitalize(dataPointUnit))}</p>
							</div>
							{#if type == 'storage'}
								<div class="mt-2 w-full">
									<p class="flex justify-center">{statisticsDiff[2]?.title} (%)</p>
									<LineChart statistics={statisticsDiff[2]} storage={true} fixedStep={100}/>
									<p class="flex justify-center">{$_(utils.capitalize(dataPointUnit))}</p>
								</div>
							{/if}
						{/if}
						{#if selectedTab==2}
							<div class="relative w-full flex flex-col items-center justify-center">
								<div class="w-full grid grid-cols-5 items-center justify-center m-2 bg-surface-50-950 rounded-lg">
									{#each items as item (item)}
										<button type="button" class="py-1 btn btn-base {selector == item ? 'bg-surface-300-700' : 'bg-surface-50-950'}" onclick={() => {doSelect(date, item)}}>
											{$_(item)}
										</button>
									{/each}
								</div>
								<div class="h-[50px]">
									{#if selector != 'All'}
										<div class="flex flex-row gap-1 items-center justify-center m-2 bg-surface-50-950 rounded-lg">
											<button type="button" class="px-1 py-2 btn btn-base" disabled={startDate(selector)} onclick={() => calcDate(1, selector)}><LbIcon name="chevron-left" height="22"/></button>
											<button type="button" class="px-0 py-2btn btn-base">{showDate(selector)}</button>
											<button type="button" class="px-1 py-2btn btn-base" disabled={futureDate(selector)} onclick={() => calcDate(-1, selector)}><LbIcon name="chevron-right" height="22"/></button>
											{#if !isToday()}
											<div class="absolute right-0 items-center justify-center bg-surface-50-950 rounded-lg" transition:fade={{ duration: 300 }}>
												<button type="button" class="py-2 btn btn-base" onclick={undo}><LbIcon name="undo-2" height="22"/></button>
											</div>
											{/if}
										</div>
									{/if}
								</div>
								<div class="w-full grid grid-cols-2">
									<div class="m-2 ml-1 justify-start">
										<p class="mt-2 text-surface-950-50">{getLabel('out')}</p>
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
									<div class="flex justify-end">
										{#if type == 'bidirectional' || type == 'storage'}
											<svg xmlns="http://www.w3.org/2000/svg" height="120" width="120" viewBox="0 0 100 100">
												<circle class={ getPercent('out') ? 'dark:stroke-secondary-500 stroke-secondary-700' :
												'dark:stroke-surface-700 stroke-surface-200'} r="32" cx="50" cy="50" stroke-width="12" fill="none"/>
												{#if getPercent('out')}
												<circle class="dark:stroke-primary-500 stroke-primary-700" r="32" cx="50" cy="50" 
													transform="rotate({-90+(getPercent('out')/100)},50,50)"
														stroke-dasharray="calc({2*3.1415*32*getPercent('out')/100}) 
														calc({2*3.1415*32*(100-getPercent('out'))/100})" stroke-width="12" fill="none"/>
												{/if}
											</svg>
										{/if}
									</div>
								</div>
								<div class="w-full">
									<p class="flex justify-center">{powerName} ({getUnit(2, statisticsDiff[2]?.format)})</p>
									<BarChart statistics={statisticsDiff[2]} />
									<p class="flex justify-center">{$_(utils.capitalize(dataPointUnit))}</p>
								</div>
							</div>
						{/if}
						<div class="relative w-full mt-2 mb-1">
							<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
								<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectTab(1)}}>
									<LbIcon name="loxbuddy:graph-line"/>
									<span class="mt-1 text-xs">{$_("Actuals")}</span>
								</button>
								<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectTab(2)}}>
									<LbIcon name="history"/>
									<span class="mt-1 text-xs">{$_("History")}</span>
								</button>
							</div>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
