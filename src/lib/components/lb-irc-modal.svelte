<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { Control, ControlView, ListItem, CalendarView, Entry } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';	
	import { X, Timer, Leaf, Flame, List, CalendarClock } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';
	import { fade200 } from '$lib/helpers/transition';
	import { publishTopic } from '$lib/communication/mqttclient';
	import LbCicleSlider from '$lib/components/lb-circle-slider.svelte';
	import LbTempSlider from '$lib/components/lb-temp-slider.svelte';
	import LbTimeGrid from '$lib/components/lb-time-grid.svelte';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbDateTimePickerModal from '$lib/components/lb-date-time-picker-modal.svelte';
	import LbCalendarModal from '$lib/components/lb-calendar-modal.svelte';
	import Info from '$lib/components/lb-info.svelte';
	import { utils } from '$lib/helpers/utils';
	import { format } from 'date-fns';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	const toaster = createToaster({duration: 1500});

	let temperatureModeList : ListItem[] = [
		{ id: 0, name: 'Automatic', visible: false },
		{ id: 1, name: 'Automatic (currently heating)', visible: false },
		{ id: 2, name: 'Automatic (currently cooling)', visible: false },
		{ id: 3, name: 'Automatic heating', visible: false },
		{ id: 4, name: 'Automatic cooling', visible: false },
		{ id: 5, name: 'Manual heating', visible: false },
		{ id: 6, name: 'Manual cooling', visible: false }
	];

	/* this modal is used for V1 and V2, so we need to select the proper attributes */
	let isV1 = controlView.control.type !== 'IRoomControllerV2'; 

	let opModes = $derived(store.structure.operatingModes);
	let temperatureList = $derived(controlView.list ? controlView.list.filter( item => item.visible == true) : []); // hide items not marked as visible 
	let selectedItem = $derived(temperatureList.find( (item: ListItem) => { return item.name === controlView.statusName }));
	let selectedTab = $state(0);
	let tempActual = $derived(Number(store.getState(controlView.control?.states.tempActual)));
	let tempTarget = $derived(Number(store.getState(controlView.control?.states.tempTarget)));
	let date: SvelteDate = $state(new SvelteDate(Date.now() + 3600000));

	let overrideV1 = $derived(Number(store.getState(controlView.control.states.override)));
	let overrideEntriesV2 = store.getState(controlView.control.states.overrideEntries);
	let overrideV2 = $derived(overrideEntriesV2 && overrideEntriesV2[0] ? (overrideEntriesV2[0].isTimer ?  1: 0 ) : 0);

	let modeV1 = $derived(Number(store.getState(controlView.control.states.mode)));
	let modeIdV1 = $derived(temperatureModeList && temperatureModeList[modeV1] ? temperatureModeList[modeV1].id : 0);
	let isAutomaticV1 = $derived(modeIdV1<5);
	let isHeatingV1 = $derived(modeIdV1==1 || modeIdV1==3 || modeIdV1==5);
	let isCoolingV1 = $derived(modeIdV1==2 || modeIdV1==4 || modeIdV1==6);
	let isEcoV1 = $derived(selectedItem?.id == 0);

	let modeV2 = $derived(Number(store.getState(controlView.control.states.currentMode)));
	let isAutomaticV2 = $derived(Number(store.getState(controlView.control.states.operatingMode))<3);
	let isHeatingV2 = $derived(modeV2==1 || modeV2 == 4);
	let isCoolingV2 = $derived(modeV2==2 || modeV2 == 5);
	let isEcoV2 = $derived(Number(store.getState(controlView.control.states.activeMode))==0);

	let override = $derived(isV1 ? overrideV1 : overrideV2);
	let isAutomatic = $derived(isV1 ? isAutomaticV1 : isAutomaticV2);
	let isHeating = $derived(isV1 ? isHeatingV1 : isHeatingV2);
	let isCooling = $derived(isV1 ? isCoolingV1 : isCoolingV2);
	let isEco = $derived(isV1 ? isEcoV1 : isEcoV2);

	let timerEndsV1 = $state(new SvelteDate());
	let timerEndsV2 = $state(new SvelteDate());

	let overrideDate = $state({start: new SvelteDate(), end: new SvelteDate(), active: false});
	
	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(false); 

	let subControls = Object.values(controlView.control.subControls);
	
	let selectedSubControl = $derived(isV1 ? (subControls.find( subControl => subControl.name == (isHeating ? 'Heating' : 'Cooling')) || subControls[0] ):
																	subControls[0]);

	let entries = $derived(utils.extractEntries(store.getState(selectedSubControl.states.entriesAndDefaultValue)));
	let modeList = $derived(String(store.getState(selectedSubControl.states.modeList))); 
	let mode = $derived(Number(store.getState(selectedSubControl.states.mode))); 
	let dayModes = $derived(utils.extractDayModes(modeList));
	let modeEntries: number[] = $derived(entries.entry.map( (m: Entry) => m.mode));
	let modes = $derived(modeEntries.filter((mode, idx) => modeEntries.indexOf(mode) == idx));
	
	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: $_('Duration'),
		openModal: false
	});

	let calendarView: CalendarView = $state({
		control: controlView.control,
		isIRC: true,
		isIRCV1: isV1,
		isCooling: false, // will be updated when modal is opened
		openModal: false
	});

	function setTemperature(item: ListItem) {
		if (!isV1 && item.id == 3) { /* manual mode only exists in IRCv2 */
			setTempManual();
		} else {
			setTimerOverride(item);
		}
	}

	function setTempManual() {
		let cmd = isCooling ? 'setComfortTemperatureCool/' : 'setComfortTemperature/';
		cmd += tempTarget;
	  publishTopic(controlView.control.uuidAction, cmd);
	}

	function setTimerOverride(item: ListItem) {
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((date.getTime() - Date.now())/coeff)*coeff/1000;
    if (overrideTimeSec > 60 && controlView.control) {// TODO define minimum time of 1 minute
	    let cmd = isV1 ? 'starttimer/' : 'override/';
			overrideTimeSec += (isV1 ? 0 : Math.round((Date.now() - utils.loxTimeRef)/1000)); // V2 starts to count from 1-1-2009
			overrideTimeSec += (!isV1 && utils.isDST(date) ? -3600 : 0); // DST correction for V2
			overrideTimeSec = (isV1 ? Math.round(overrideTimeSec/60) : overrideTimeSec); // V1 in minutes!!
			cmd += String(item.id) + '/' + String(overrideTimeSec);
			publishTopic(controlView.control.uuidAction, cmd);
    } else {
			console.error('IRC: timer period to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function cancelOverride() {
		if (controlView.control) {
			publishTopic(controlView.control.uuidAction, isV1 ? 'stoptimer' : 'stopOverride');
		}
	}

	function updatePosition(e: any) { // TODO
	}

	function getTemperatureMode(mode: number) {
		let t = temperatureList.find( item => item.id == mode);
		return t ? t.name : '';
	}

	function updateTimer(e: any) {
		date = e.value;
	}

	function tempFormat(temp: number) {
		return temp.toLocaleString(store.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + ' °C' // TODO Fahrenheit
	}

	function getTimerEpoch(entries: any) {
		if (!entries) return;
		if (entries.length ==0) return;
		let timerDate = entries[0].end * 1000 + utils.loxTimeRef;
		return utils.isDST(new Date(timerDate)) ? timerDate+3600000 : timerDate;
	}

	function resetTab() {
    setTimeout(() => {
      selectedTab = 0;
    }, 500);
	}

	function openCalendarView() {
		calendarView.subControl = selectedSubControl;
		calendarView.isCooling = isCooling;
		calendarView.openModal=true;
	}

	function getTemperature(temp: number | undefined){
		return ' ('+ temp?.toLocaleString(store.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '°)' // TODO Fahrenheit
	}

	$effect( () => {
		timerEndsV1 = new SvelteDate(store.time.valueOf() + overrideV1*1000);
		timerEndsV2 = new SvelteDate(getTimerEpoch(overrideEntriesV2));
	});

	$effect( () => {
		if (windowHeight && modalViewport && selectedTab) { /* trigger on windowHeight, available modalViewport and tab selection */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 10) < 0;
			});
		}
	});
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							md:max-w-9/10 md:max-h-9/10 w-[450px] { limitHeight ? 'h-full': '' }"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={() => {controlView.modal.action(false); resetTab();}}></div> 
	<!--<Info control={controlView.control}/>-->
	<header class="relative">
		<div class="absolute top-0 right-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
				<X />
			</button>
		</div>
	</header>
	<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
		<h2 class="h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
		{#if selectedTab==0}
			<div class="w-full mt-4 m-2 p-2 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50">
				<!--<LbCicleSlider min={10} max={30} step={0.5} target={tempTarget} manual={!isAutomatic} actual={tempActual} onValueChangeEnd={(e: any) => {updatePosition(e.value)}}/>-->
				<div class="grid grid-cols-2">
					<div>
						<p class="pl-2 text-lg text-left truncate {controlView.statusColor}">{$_(controlView?.statusName)}</p>
					</div>
					<div class="relative flex items-center justify-end">
						{#if isAutomatic}
							<LbIcon class="fill-surface-50 mr-2" name={"/icons/svg/automatic.svg"} width="24" height="24"/>
						{/if}
						{#if isCooling}
						<LbIcon class="fill-cyan-400 mr-2" name={"/icons/svg/mode_cool.svg"} width="24" height="24"/>
						{/if}
						{#if isHeating}
						<Flame class="text-red-500 fill-red-500 mr-2"/>
						{/if}
						{#if isEco}
						<Leaf class="text-green-500 mr-2"/>
						{/if}
						{#if override > 0}
						<Timer class="text-purple-500 mr-2"/>
						{/if}
					</div>
				</div>
				<div class="flex flex-col items-center justify-center">
					<div class="text-lg dark:text-surface-300 text-surface-700">Actual: {tempFormat(tempActual)}</div>
					<LbTempSlider min={10} max={30} step={0.5} target={tempTarget} manual={!isAutomatic} actual={tempActual} onValueChangeEnd={(e: any) => {updatePosition(e.value)}}/>
					<div class="text-lg dark:text-primary-500 text-primary-700">Target: {tempFormat(tempTarget)}</div>
					</div>
			</div>
			<div class="w-full dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); openCalendarView();}}>
				<LbTimeGrid {mode} {entries} {overrideDate} {override}/>
				<h2 class="m-2 text-md text-center dark:text-surface-50 text-surface-950">{dayModes[mode]}</h2>
			</div>
			<div class="text-center">
				{#if override > 0}
					<p class="mt-2 mb-2 text-lg">{$_("Duration")} { isV1 ? format(timerEndsV1, 'PPP p') : format(timerEndsV2, 'PPP p')} </p>
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={cancelOverride}>
						<p class="text-lg">{$_("Cancel timer")}</p>
					</button>
				{/if}
			</div>
		{/if} 
		{#if selectedTab==1}
			<div class="container mt-2 overflow-y-auto">
				{#each temperatureList as listItem}
					<button type="button" class="w-full mt-2 btn btn-lg {(listItem.id == selectedItem?.id) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
								 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); setTemperature(listItem)}}>
						<div class="flex flex-row gap-2 items-center jusify-center">
							<p class="text-lg dark:text-surface-50 text-surface-950">{$_(listItem.name)}</p>
							<p class="text-lg dark:text-surface-300 text-surface-700">{getTemperature(listItem.value)}</p>
						</div>
					</button>
				{/each}
				<button class="w-full m-0 mt-4 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
								dark:bg-surface-950 bg-surface-50 px-2 py-2"
								onclick={() => {dateTimeView.openModal=true}}>
					<div class="w-full flex items-center truncate">
						<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
							<p class="truncate text-lg">{$_("Duration")}</p>
							<p class="text-lg">{format(date, 'PPP p')}</p>
						</div>
					</div>
				</button>
			</div>
		{/if}
		{#if selectedTab==2}
			<div class="container mt-2 overflow-y-auto">
				{#each modes as mode}
					<p class="ml-2 mt-1 mb-1 text-lg dark:text-surface-300 text-surface-700">{opModes[mode]}</p>
					<div class="flex flex-col space-y-2">
					{#each entries.entry.filter( (item: Entry) => item.mode == String(mode)) as entry}
						<button type="button" class="w-full dark:bg-surface-950 bg-surface-50
								 shadow-sm rounded-lg border border-white/15 hover:border-white/50 h-[65px]"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
								<div class="pl-3 flex flex-col justify-center text-left">
									<p class="text-lg truncate dark:text-surface-50 text-surface-950">{getTemperatureMode(entry.value)}</p>
									<p class="text-xs dark:text-surface-300 text-surface-700">{entry.from} - {entry.to} </p>
								</div>
						</button>
					{/each}
					</div>
				{/each}
			</div>
		{/if}
		<div class="relative w-full mt-6 mb-2">
			<div class="grid h-full max-w-lg grid-cols-3 mx-auto">
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=0}>
					<LbIcon class={selectedTab==0 ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-50'} name={"/icons/svg/thermostat.svg"} width="24" height="24"/>
					<span class="mt-1 text-xs">{$_("Control")}</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=1}>
					<List/>
					<span class="mt-1 text-xs">{$_("Preset")}</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=2}>
					<CalendarClock/>
					<span class="mt-1 text-xs">{$_("Switching times")}</span>
				</button>
			</div>
		</div>
	</div>
	{/snippet}
</Modal>

<LbDateTimePickerModal date={date} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTimer(e)}}/>
<Toaster {toaster}></Toaster>
<LbCalendarModal bind:view={calendarView} {mode} {dayModes} {entries} {temperatureList}/>