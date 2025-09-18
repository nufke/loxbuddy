<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, ModalView, EntriesAndDefaultValue, WeekDays } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbTimeGrid from '$lib/components/lb-time-grid.svelte';
	import LbDateTimePickerModal from '$lib/components/lb-date-time-picker-modal.svelte';
	import LbCalendarModal from '$lib/components/lb-calendar-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { X, Timer } from '@lucide/svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { format, isAfter, isBefore, setHours, setMinutes, setSeconds } from 'date-fns';
	import { publishTopic } from '$lib/communication/mqttclient';
	import Info from '$lib/components/lb-info.svelte';
	import { utils } from '$lib/helpers/utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const toaster = createToaster({duration: 1500});

	let dayOfTheWeek = $derived(format(store.time, 'eeee'));

	let isAnalog = Boolean(control.details.analog);
	let value = $derived(Number(store.getState(control.states.value)));
	let valueFormatted = $derived(fmt.sprintf(control.details.format, value));

	let mode = $derived(Number(store.getState(control.states.mode)));
	let entries = $derived(utils.extractEntries(store.getState(control.states.entriesAndDefaultValue))) as EntriesAndDefaultValue;
	let modeList = $derived(String(store.getState(control.states.modeList))); 

	let currentTime = $derived(store.time);
	let dayModes = $derived(utils.extractDayModes(modeList)) as WeekDays;
	let status = $derived(isAnalog ? valueFormatted : ( value ? control.details.text.on : control.details.text.off)) as string;
	let override = $derived(Number(store.getState(control.states.override)));
	let timeslot = $derived(calcStartEndTime(entries));
	let overrideDate = $state({start: new SvelteDate(), end: new SvelteDate(), active: false});
	let outputActive = $derived(false);

	function getDuration() {
		let statusExt = '';
		const timerEnds = store.time.valueOf() + override * 1000;
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
			publishTopic(control.uuidAction, 'stopOverride');
			return;
		}
		overrideDate.start = new SvelteDate(); // save start time for visualization
		overrideDate.active = outputActive;
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((overrideDate.end.getTime() - Date.now())/coeff)*coeff/1000;
		let overrideValue = outputActive ? '1' : '0'; // TODO analog values
    if (overrideTimeSec > 60) {// TODO define minimum time of 1 minute
	    let cmd = 'startOverride/' + String(overrideValue) + '/' + String(overrideTimeSec);
			publishTopic(control.uuidAction, cmd);
    } else {
			console.error('Daytimer override timeperiod to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function updateTimer(e: any) {
		overrideDate.end = e.value;
	}

	let calendarView = $state({
		control: control,
		isIRC: false,
		openModal: false
	});
	
	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: $_('Duration'),
		openModal: false
	});

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (value > 0 ) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		badgeIconName: (override > 0) ? 'Timer' : '',
		badgeIconColor: (override > 0) ? 'bg-purple-500' : '',
		textName: control.name,
		statusName: status + getDuration(),
		statusColor: (value > 0 ) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={() => {}}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={(e) => { controlView.modal.action(false);}}></div> 
		<Info control={controlView.control}/>
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {controlView.modal.action(false);}}>
					<X />
				</button>
			</div>
		</header>
		<div class="flex flex-col items-center justify-center">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
			<h2 class="text-lg mt-2 text-center {(value > 0 ) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">
				{status + getDuration()}
			</h2>
			{#if override > 0}
				<div class="flex flex-row items-center justify-center">
					<span class="dark:text-purple-400 text-purple-800"><Timer size="16"/></span>
					<p class="ml-1 text-lg text-center dark:text-purple-400 text-purple-800">{$_("Timer is running")}</p>
				</div>
			{/if}
			<div class="w-full m-2 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); calendarView.openModal=true;}}>
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
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); dateTimeView.openModal=true;}}>
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
		{/snippet}
	</Modal>
	<LbDateTimePickerModal date={overrideDate.end} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTimer(e)}}/>
	<Toaster {toaster}></Toaster>
	<LbCalendarModal bind:view={calendarView} {mode} {dayModes} {entries}/>
</div>
