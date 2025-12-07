<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, DialogView, EntriesAndDefaultValue, WeekDays } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbTimeGrid from '$lib/components/Common/LbTimeGrid.svelte';
	import LbDateTimePickerDialog from '$lib/components/Common/LbDateTimePickerDialog.svelte';
	import LbCalendarDialog from '$lib/components/Common/LbCalendarDialog.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { XIcon, TimerIcon } from '@lucide/svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { format, isAfter, isBefore, setHours, setMinutes, setSeconds } from 'date-fns';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { utils } from '$lib/helpers/Utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const toaster = createToaster({duration: 1500});

	let dayOfTheWeek = $derived(format(appStore.date, 'eeee'));

	let isAnalog = Boolean(control.details.analog);
	let value = $derived(Number(controlStore.getState(control.states.value)));
	let valueFormatted = $derived(fmt.sprintf(control.details.format, value));

	let mode = $derived(Number(controlStore.getState(control.states.mode)));
	let entries = $derived(utils.extractEntries(controlStore.getState(control.states.entriesAndDefaultValue))) as EntriesAndDefaultValue;
	let modeList = $derived(String(controlStore.getState(control.states.modeList))); 

	let currentTime = $derived(appStore.date);
	let dayModes = $derived(utils.extractDayModes(modeList)) as WeekDays;
	let status = $derived(isAnalog ? valueFormatted : ( value ? control.details.text.on : control.details.text.off)) as string;
	let override = $derived(Number(controlStore.getState(control.states.override)));
	let timeslot = $derived(calcStartEndTime(entries));
	let overrideDate = $state({start: new SvelteDate(), end: new SvelteDate(), active: false});
	let outputActive = $derived(false);

	function getDuration() {
		let statusExt = '';
		const timerEnds = appStore.date.valueOf() + override * 1000;
		if (override > 0 || (timeslot && timeslot.endTime)) {
			const dateStr = timerEnds ? format(timerEnds, 'd MMMM p') : '';
			const timeStr = timeslot ? utils.hours2hours(timeslot.endTime, true) : '';
			statusExt = ' ' + $_('Till').toLowerCase() + ' ' + (override > 0 ? dateStr : timeStr);
		}
		return statusExt;
	}

	function getTime(t: string) {
		let hhmm = t.split(':');
		let d = setHours(currentTime, Number(hhmm[0]));
		let d2 = setMinutes(d, Number(hhmm[1]));
		let d3 = setSeconds(d2, 0);
		return d3;
	}

	function calcStartEndTime(entryList: EntriesAndDefaultValue) {
		if (!entryList) return;
		let startTime = '00:00';
		let endTime = '24:00';

		// no entries means not timer set
		if (entryList.entry.length == 0) {
			return {startTime: '00:00', endTime: '24:00'};
		}

		entryList.entry.forEach( (item: any) => {
			if (Number(item.mode) == mode ) {
				if (isAfter(currentTime, getTime(item.to))) {
					startTime = item.to;
				}
				if (isBefore(currentTime, getTime(item.from))) {
					endTime = item.from;
				}
				if (isAfter(currentTime, getTime(item.from)) && isBefore(currentTime, getTime(item.to))) {
					startTime = item.from;
					return {startTime: startTime, endTime: endTime};
				}
			}
		});
		return {startTime: startTime, endTime: endTime};
	}

	function startStopTimer() {
		if (override > 0) { // Timer active, so deactivate
			loxWsClient.control(control.uuidAction, 'stopOverride');
			return;
		}
		overrideDate.start = new SvelteDate(); // save start time for visualization
		overrideDate.active = outputActive;
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((overrideDate.end.getTime() - Date.now())/coeff)*coeff/1000;
		let overrideValue = outputActive ? '1' : '0'; // TODO analog values

		if (overrideTimeSec > 60) {// TODO define minimum time of 1 minute
			let cmd = 'startOverride/' + String(overrideValue) + '/' + String(overrideTimeSec);
			loxWsClient.control(control.uuidAction, cmd);
		} else {
			console.error('Daytimer override timeperiod to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function updateTimer(e: any) {
		overrideDate.end = e.value;
	}

	function close() {
		controlView.dialog.action(false);
	}

	let calendarView = $state({
		control: control,
		isIRC: false,
		openDialog: false
	});
	
	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: $_('Duration'),
		openDialog: false
	});

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: (value > 0 ) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		badgeIconName: (override > 0) ? 'Timer' : '',
		badgeIconColor: (override > 0) ? 'bg-purple-500' : '',
		textName: control.name,
		statusName: status + getDuration(),
		statusColor: (value > 0 ) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state}
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
					<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										md:max-w-9/10 md:max-h-9/10 w-[450px]">
						<!--<Info control={controlView.control}/>-->
						<header class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<XIcon class="size-4"/>
								</button>
							</div>
						</header>
						<Dialog.Description>
							<div class="flex flex-col items-center justify-center">
								<p class="text-lg mt-2 text-center {(value > 0 ) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">
									{status + getDuration()}
								</p>
								{#if override > 0}
									<div class="flex flex-row items-center justify-center">
										<span class="dark:text-purple-400 text-purple-800"><TimerIcon size="16"/></span>
										<p class="ml-1 text-lg text-center dark:text-purple-400 text-purple-800">{$_("Timer is running")}</p>
									</div>
								{/if}
								<div class="w-full m-2 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { e.stopPropagation(); e.preventDefault(); calendarView.openDialog=true;}}>
									<LbTimeGrid {mode} {entries} {overrideDate} {override}/>
									<h2 class="m-2 text-md text-center dark:text-surface-50 text-surface-950">{dayOfTheWeek}</h2>
								</div>
							</div>
							<div class="flex flex-col items-center justify-center">
								<div class="flex w-full btn-group dark:bg-surface-950 bg-surface-50 rounded-lg grid-cols-2 p-2 flex-row border border-white/15 hover:border-white/50">
									<button type="button" class="w-full h-9 rounded-sm {outputActive ? 'dark:bg-surface-600 bg-surface-200' : ''}" onclick={() => outputActive=true}>
										<p class="text-lg">{$_("Active")}</p>
									</button>
									<button type="button" class="w-full h-9 rounded-sm {!outputActive ? 'dark:bg-surface-600 bg-surface-200' : ''}" onclick={() => outputActive=false}>
										<p class="text-lg">{$_("Inactive")}</p>
									</button>
								</div>
								<button class="w-full m-0 mt-2 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
													dark:bg-surface-950 bg-surface-50 px-2 py-2"
													onclick={(e) => { e.stopPropagation(); e.preventDefault(); dateTimeView.openDialog=true;}}>
									<div class="w-full flex items-center truncate">
										<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
											<p class="truncate text-lg">{$_("Duration")}</p>
											<p class="text-lg">{format(overrideDate.end, 'd MMMM p')}</p>
										</div>
									</div>
								</button>
								<button type="button" class="w-full mt-2 btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
												onclick={(e) => {e.stopPropagation(); e.preventDefault(); startStopTimer()}}>
									<span class="text-lg">{$_( (override > 0) ? "Stop" : "Start")} {$_("Timer").toLocaleLowerCase()}</span>
								</button>
							</div>
						</Dialog.Description>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
	{/if}
	<LbDateTimePickerDialog date={overrideDate.end} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTimer(e)}}/>
	<LbCalendarDialog bind:view={calendarView} {mode} {dayModes} {entries}/>
	<Toast.Group {toaster}>
		{#snippet children(toast)}
			<Toast {toast}>
				<Toast.Message>
					<Toast.Title>{toast.title}</Toast.Title>
					<Toast.Description>{toast.description}</Toast.Description>
				</Toast.Message>
				<Toast.CloseTrigger/>
			</Toast>
		{/snippet}
	</Toast.Group>
</div>
