<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, ModalView, EntriesAndDefaultValue, WeekDays } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbTimeGrid from '$lib/components/lb-time-grid.svelte';
	import LbDatePicker from '$lib/components/lb-date-picker.svelte';
	import LbTimePicker from '$lib/components/lb-time-picker.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { X, Timer, CalendarClock } from '@lucide/svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { nl } from 'date-fns/locale';
	import { format, isAfter, isBefore, setHours, setMinutes, setSeconds } from 'date-fns';
	import { publishTopic } from '$lib/communication/mqttclient';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let isAnalog = Boolean(control.details.analog);
	let value = $derived(Number(store.getState(control.states.value)));
	let valueFormatted = $derived(fmt.sprintf(control.details.format, value));

	let mode = $derived(Number(store.getState(control.states.mode)));
	let entries = $derived(extractEntries(store.getState(control.states.entriesAndDefaultValue))) as EntriesAndDefaultValue;
	let modeList = $derived(String(store.getState(control.states.modeList))); 

	let currentTime = $derived(store.time);
	let weekdays = $derived(extractWeekdays(modeList)) as WeekDays;
	let status = $derived(isAnalog ? valueFormatted : ( value ? control.details.text.on : control.details.text.off)) as string;
	let overrideTime = $derived(Number(store.getState(control.states.override)));
	let timer = $derived(calcStartEndTime());

	let date: SvelteDate = $state(new SvelteDate());

	let outputActive = $derived(false);

	let selectedTab = $state(0);

	function getDuration() {
		let statusExt = '';
		const timerEnds = store.time.valueOf() + overrideTime * 1000;
		if (timerEnds) {
			const dateStr = format(timerEnds, 'PPP p', { locale: nl }); // TODO change locale
			if (overrideTime>0 || (timer && timer.startTime !== timer.endTime)) {
				statusExt = ' ' + $_('Till').toLowerCase() + ' ' + (overrideTime>0 ? dateStr : timer?.endTime);
			}
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

	function calcStartEndTime() {
		if (!entries) return;
    let startTime = '00:00';
    let endTime = '24:00';

		// no entries means not timer set
		if (entries.entry.length == 0) {
			return {startTime: startTime, endTime: '24:00'};
		}

		entries.entry.forEach( (item: any) => {
			if (Number(item.mode) >= mode ) {
				if (isAfter(currentTime, getTime(item.to))) {
					startTime = item.to;
				}
				if (isBefore(currentTime, getTime(item.from))) {
					endTime = item.from;
				}
				if (isAfter(currentTime, getTime(item.from)) && isBefore(currentTime, getTime(item.to))) {
					return {startTime: item.from, endTime: item.to}; // result found, quit
				}
			}
		});
		return {startTime: startTime, endTime: endTime};
	}

	function extractEntries(s: any) {
		if (!s || s.length == 0) return;
		let _s: string = s;
		_s = s.replaceAll('}\n{', '},\n{');										// fix array
		_s = _s.replace(/([a-zA-Z]+)(: )/gm, '"$1"$2');					// key as string
		_s = _s.replace(/(: )([a-zA-Z\-\d:]+)/gm, ': "$2"');		// value as string
		return JSON.parse(_s);
	}

	function extractWeekdays(s: string) {
		let weekdays: any = {};
		const regex = /mode=(\d+);name=\\"([a-z,A-Z]+)/g;
		const match = s.matchAll(regex);
		for (const match of s.matchAll(regex)) {
			weekdays[match[1]] = match[2];
		}
		console
		return weekdays;
	}

	function startStopTimer() {
		if (overrideTime > 0) { // Timer active, so deactivate
			publishTopic(control.uuidAction, 'stopOverride');
			return
		}
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((date.getTime() - Date.now())/coeff)*coeff/1000;
		let overrideValue = outputActive ? '1' : '0'; // TODO analog values
		console.log("overrideTimeSec", overrideTimeSec);
    if (overrideTimeSec > 60) {// TODO define minimum time of 1 minute
	    let cmd = 'startOverride/' + String(overrideValue) + '/' + String(overrideTimeSec);
			publishTopic(control.uuidAction, cmd);
    } else {
			console.log('Daytimer override timeperiod to low:', overrideTimeSec);
		}
	}

	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false
	});

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		iconColor: (value > 0 ) ? 'fill-success-500' : 'fill-primary-950 dark:fill-primary-50',
		textName: control.name,
		statusName: status + getDuration(),
		statusColor: (value > 0 ) ? 'text-success-500' : 'text-surface-500',
		modal: modal
	});

	function resetTab() {
    setTimeout(() => {
      selectedTab = 0;
    }, 500);
	}
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={() => controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
								 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
		backdropClasses="backdrop-blur-sm">
		{#snippet content()}
			<header class="relative">
				<div class="mb-2 flex justify-center">
					<h2 class="h4 text-center ">{controlView.textName}</h2>
				</div>
				
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {controlView.modal.action(false); resetTab();}}>
						<X />
					</button>
				</div>
			</header>
			{#if selectedTab==0}
			<div class="flex flex-col items-center justify-center m-2">
				<h2 class="text-lg text-center {(value > 0 ) ? 'text-primary-500' : 'text-surface-500'}">{status + getDuration()}</h2>
				<div>
					<LbTimeGrid {mode} {weekdays} {entries}/>
				</div>
				<div class="container mt-4">
					<h2 class="text-lg text-center text-surface-50">{weekdays[mode]}</h2>
				</div>
			</div>
			{/if}
			{#if selectedTab==1}
			<div class="flex flex-col items-center justify-center m-2">
				<div>
					{#if dateTimeView.isDateView}
						<LbDatePicker bind:date={date} bind:view={dateTimeView}/>
					{:else}
						<LbTimePicker bind:date={date} bind:view={dateTimeView}/>
					{/if}
					<div class="container mt-2">
						<button class="w-[300px] btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-xl rounded-lg border border-white/15 hover:border-white/50" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
							<div class="flex w-full justify-between">
								<h1 class="truncate text-lg">{$_("Uitgang")} {$_(outputActive ? "Active" : "Inactive").toLowerCase()}</h1>
								<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-primary-500" checked={outputActive} onCheckedChange={(e) => (outputActive = e.checked)} />
							</div>
						</button>
					</div>
					<div class="container mt-2">
						<button type="button" class="w-[300px] btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
										onclick={(e) => {e.stopPropagation(); e.preventDefault(); startStopTimer()}}>
							<span class="text-lg">{$_( (overrideTime > 0) ? "Stop" : "Start")} {$_("Timer").toLocaleLowerCase()}</span>
						</button>
					</div>
				</div>
			</div>
			{/if}
			<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
				<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-primary-500' : ''} " onclick={() => {dateTimeView.isDateView=true; selectedTab=0;}}>
						<Timer/>
						<span class="mt-1 text-xs">{$_("Schedule")}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-primary-500' : ''} " onclick={() => {dateTimeView.isDateView=true; selectedTab=1;}}>
						<CalendarClock/>
						<span class="mt-1 text-xs">{$_("Timer")}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</Modal>
</div>
