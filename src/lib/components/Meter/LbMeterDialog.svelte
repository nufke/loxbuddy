<script lang="ts">
	import type { ControlView } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { fadeInOut } from '$lib/helpers/styles';
	import { _ } from 'svelte-i18n';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { format, getDate, getWeek, sub, startOfDay, endOfDay, startOfISOWeek, 
		endOfISOWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, getUnixTime } from 'date-fns';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { StatisticsDiff, StatisticsInfo, StatisticsDiffEntry } from '$lib/types/models';
	import BarChart from '$lib/components/Charts/BarChart.svelte';
	import { utils } from '$lib/helpers/Utils';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	const items = ['Day', 'Week', 'Month', 'Year', 'All'];

	let controlUuid = controlView.control.uuidAction; // not updated
	let statisticV2 = controlView.control.statisticV2;
	let isStorage = controlView.control.details.type == 'storage';
	let isBirectional = controlView.control.details.type == 'bidirectional';
	let isUnidirectional = controlView.control.details.type == 'unidirectional';
	let totalFormat = controlView.control.details.totalFormat;

	let statisticsInfo = $state({}) as StatisticsInfo;
	let statisticsDiff = $state({}) as StatisticsDiff;
	let selected = $state(0);
	let date = $state(new SvelteDate());
	let selector = $state(items[0]);

	function getValue(key: string, idx: number = -1) {
		const d = statisticsDiff['2']; // TODO we only use ID 2
		if (!d) return idx == -1 ? '–' : 0;
		const val = key === 'out' ? d.total : d.totalNeg;
		const str = utils.formatString(val, totalFormat);
		if (idx == -1) return `${str[0].toLocaleString(appStore.locale)} ${str[1]}`;
		return val;
	}

	function getActual() {
		const value = Math.abs(controlView.dialog.details.actual.out[0]);
		const unit = controlView.dialog.details.actual.out[1];
		return value + ' ' + unit;
	}

	function isActualPositive() {
		return controlView.dialog.details.actual.out[0] > 0;
	}

	function getPercent(key: string) {
		const d = statisticsDiff['2']; // TODO we only use ID 2
		if (!d) return 0;
		const total = d.total + d.totalNeg;
		const input = key === 'out' ? d.total : d.totalNeg;
		return (input == 0) ? 0 : ((total == 0) ? 100 : Math.round((input/total)*100));
	}

	function futureDate(s: string) {
		const today = new SvelteDate().valueOf();
		switch (s) {
			case 'Day': return endOfDay(date).valueOf() > today;
			case 'Week': return endOfISOWeek(date).valueOf() > today;
			case 'Month': return endOfMonth(date).valueOf() > today;
			case 'Year': return endOfYear(date).valueOf() > today;
		} 
	}

	async function getStatistics(newDate: SvelteDate, selector: string = '') {
		if (!statisticV2) return;
		let fromUnixUtc: number;
		let untilUnixUtc: number;
		let dataPointUnit: string;

		await controlStore.fetchUrl(controlUuid, `jdev/sps/getStatisticInfo/${controlUuid}`)
			.then((resource) => resource.json())
			.then((json) => {
				let obj = json.LL?.value && utils.isValidJSONObject(json.LL.value) ? JSON.parse(json.LL.value) : json;
				if (obj.length) {
					obj.forEach( (item) => { statisticsInfo[item.id] = {activeSince: item.activeSince}; });
				}
			});

		switch (selector) {
			case 'Day': fromUnixUtc =  getUnixTime(startOfDay(newDate)); untilUnixUtc = getUnixTime(endOfDay(newDate)); dataPointUnit = 'hour'; break;
			case 'Week': fromUnixUtc = getUnixTime(startOfISOWeek(newDate)); untilUnixUtc = getUnixTime(endOfISOWeek(newDate)); dataPointUnit = 'day'; break;
			case 'Month': fromUnixUtc = getUnixTime(startOfMonth(newDate)); untilUnixUtc = getUnixTime(endOfMonth(newDate)); dataPointUnit = 'day'; break;
			case 'Year': fromUnixUtc = getUnixTime(startOfYear(newDate)); untilUnixUtc = getUnixTime(endOfYear(newDate)); dataPointUnit = 'month'; break;
			case 'All': fromUnixUtc = getUnixTime(startOfYear(newDate)); untilUnixUtc = getUnixTime(endOfYear(newDate)); dataPointUnit = 'year'; break;
			default: /* none */
		}

		statisticV2.groups.map(async (item) => {
			if (fromUnixUtc < statisticsInfo[Number(item.id)]?.activeSince) {
				console.error('[LbMeterDialog] No statistics available before', new Date(statisticsInfo[Number(item.id)].activeSince*1000));
				statisticsDiff[item.id] = {data: [], total: 0, totalNeg: 0, selector: selector}; // empty graph data
				return;
			}
			let resp = await controlStore.fetchUrl(controlUuid, `dev/sps/getStatistic/${controlUuid}/diff/${fromUnixUtc}/${untilUnixUtc}/${dataPointUnit}/${item.id}/`)
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
						stats.push({ts: ts, values: (isStorage ? values.reverse() : values)});
					}
				}
				return stats;
			});
			statisticsDiff[item.id] = {
				data: resp,
				total: resp.flatMap(i=> i.values[0]).reduce((a, b) => a + b, 0),
				totalNeg: resp.flatMap(i=> i.values[1]).reduce((a, b) => a + b, 0) ?? 0, // TODO might not exist
				selector: selector
			};
		});
	}

	function showDate(s: string) {
		switch (s) {
			case 'Day' : return format(date,'dd-MM-yyyy');
			case 'Week' : return format(startOfISOWeek(date),'dd-MM-yyyy') + ' - ' + format(endOfISOWeek(date),'dd-MM-yyyy');
			case 'Month': return format(date,'MMMM yyyy');
			case 'Year' : return format(date,'yyyy');
			case 'All' : ''
		}
	}

	function calcDate(n: number, s: string) {
		switch (s) {
			case 'Day' : date = sub(date, {days: n}); break;
			case 'Week' : date = sub(date, {weeks: n}); break;
			case 'Month': date = sub(date, {months: n}); break;
			case 'Year' : date = sub(date, {years: n}); break;
			case 'All' : ''
		}
	}

	function close() {
		controlView.dialog.action(false);
		selector = items[0]; // reset selector
		date = new SvelteDate(); // reset date
	}

	$effect( () => {
		getStatistics(date, selector); // grab statistics when date or selector changes
	});
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
						<div class="w-full flex flex-col items-center justify-center">
							<div class="w-full grid grid-cols-5 items-center justify-center m-2 bg-surface-50-950 rounded-lg">
								{#each items as item (item)}
									<button type="button" class="btn btn-base {selector == item ? 'bg-surface-300-700' : 'bg-surface-50-950'}" onclick={() => (selector = item)}>
										{$_(item)}
									</button>
								{/each}
							</div>
							<div class="h-[50px]">
								{#if selector != 'All'}
									<div class="flex flex-row gap-1 items-center justify-center m-2 bg-surface-50-950 rounded-lg">
										<button type="button" class="btn btn-base" onclick={() => calcDate(1, selector)}><LbIcon name="chevron-left" height="22"/></button>
										<button type="button" class="btn btn-base">{showDate(selector)}</button>
										<button type="button" class="btn btn-base" disabled={futureDate(selector)} onclick={() => calcDate(-1, selector)}><LbIcon name="chevron-right" height="22"/></button>
									</div>
								{/if}
							</div>
							<div class="w-full grid grid-cols-2 m-2">
								<div class="ml-3 justify-start">
									<p class="text-surface-950-50">{$_('Actual')}</p>
									<p class={isActualPositive() ? 'dark:text-secondary-500 text-secondary-700' : 
										'dark:text-primary-500 text-primary-700'}>{getActual()} ({isActualPositive() ? $_('Supply') : $_('Consume')})</p>
									<p class="mt-2 text-surface-950-50">{isUnidirectional ? $_('Supply') : $_('Consume')}</p>
										<p class="dark:text-primary-500 text-primary-700">{getValue('out')}
										{#if isBirectional || isStorage}  
											({getPercent('out')}%)
										{/if}
										</p>
									{#if isBirectional || isStorage}
										<p class="mt-2 text-surface-950-50">{$_('Supply')}</p>
										<p class="dark:text-secondary-500 text-secondary-700">{getValue('in')}
											({getPercent('in')}%)
										</p>
									{/if}
								</div>
								<div class="flex justify-end">
									{#if !isUnidirectional}
										<svg xmlns="http://www.w3.org/2000/svg" height="150" width="150" viewBox="0 0 100 100">
											<circle class={ getPercent('out') ? 'dark:stroke-secondary-500 stroke-secondary-700' :
											'dark:stroke-surface-300 stroke-surface-700'} r="32" cx="50" cy="50" stroke-width="12" fill="none"/>
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
								<BarChart statistics={statisticsDiff[2]} />
							</div>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
