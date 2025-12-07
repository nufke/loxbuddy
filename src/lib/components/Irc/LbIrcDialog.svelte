<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { ControlView, ListItem, CalendarView, Entry, CalendarEntryView, CalendarListItem } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { XIcon, TimerIcon, LeafIcon, FlameIcon, ListIcon, CalendarClockIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import LbTemperatureSlider from '$lib/components/Irc/LbTemperatureSlider.svelte';
	import LbTimeGrid from '$lib/components/Common/LbTimeGrid.svelte';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbDateTimePickerDialog from '$lib/components/Common/LbDateTimePickerDialog.svelte';
	import LbCalendarEntryDialog from '$lib/components/Common/LbCalendarEntryDialog.svelte';
	import LbCalendarDialog from '$lib/components/Common/LbCalendarDialog.svelte';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { utils } from '$lib/helpers/Utils';
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

	/* this dialog is used for V1 and V2, so we need to select the proper attributes */
	let isV1 = controlView.control.type !== 'IRoomControllerV2'; 

	let dayOfTheWeek = $derived(format(appStore.date, 'eeee'));
	let opModes = $derived(controlStore.structure.operatingModes);
	let temperatureList = $derived(controlView.list ? controlView.list.filter( item => item.visible == true) : []); // hide items not marked as visible 
	let selectedItem = $derived(temperatureList.find( (item: ListItem) => $_(item.name) === controlView.statusName ));
	let selectedTab = $state(1);
	let tempActual = $derived(Number(controlStore.getState(controlView.control?.states.tempActual)));
	let tempTarget = $derived(Number(controlStore.getState(controlView.control?.states.tempTarget)));
	let date: SvelteDate = $state(new SvelteDate(Date.now() + 3600000));

	let overrideV1 = $derived(Number(controlStore.getState(controlView.control.states.override)));
	let overrideEntriesV2 = $derived(controlStore.getState(controlView.control.states.overrideEntries));
	let overrideV2 = $derived(overrideEntriesV2 && overrideEntriesV2[0] ? (overrideEntriesV2[0].isTimer ? 1: 0 ) : 0); // TODO, we might have more entries

	let modeV1 = $derived(Number(controlStore.getState(controlView.control.states.mode)));
	let modeIdV1 = $derived(temperatureModeList && temperatureModeList[modeV1] ? temperatureModeList[modeV1].id : 0);
	let isAutomaticV1 = $derived(modeIdV1<5);
	let isHeatingV1 = $derived(modeIdV1==1 || modeIdV1==3 || modeIdV1==5);
	let isCoolingV1 = $derived(modeIdV1==2 || modeIdV1==4 || modeIdV1==6);
	let isEcoV1 = $derived(selectedItem?.id == 0);

	let operatingModeV2 = $derived(Number(controlStore.getState(controlView.control.states.operatingMode)));
	let currentModeV2 = $derived(Number(controlStore.getState(controlView.control.states.currentMode)));
	let isAutomaticV2 = $derived(operatingModeV2<3);
	let isHeatingV2 = $derived(currentModeV2==1 || currentModeV2 == 4);
	let isCoolingV2 = $derived(currentModeV2==2 || currentModeV2 == 5);
	let isEcoV2 = $derived(Number(controlStore.getState(controlView.control.states.activeMode))==0);

	let override = $derived(isV1 ? overrideV1 : overrideV2);
	let isAutomatic = $derived(isV1 ? isAutomaticV1 : isAutomaticV2);
	let isHeating = $derived(isV1 ? isHeatingV1 : isHeatingV2);
	let isCooling = $derived(isV1 ? isCoolingV1 : isCoolingV2);
	let isEco = $derived(isV1 ? isEcoV1 : isEcoV2);

	let timerEndsV1 = $state(new SvelteDate());
	let timerEndsV2 = $state(new SvelteDate());
	let selectedEntry = $state();
	let overrideDate = $state({start: new SvelteDate(), end: new SvelteDate(), active: false});

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);
	let subControls = Object.values(controlView.control.subControls);

	let windowHeight = $derived(innerHeight.current || 0);

	let selectedSubControl = $derived(isV1 ? (subControls.find( subControl => subControl.name == (isHeating ? 'Heating' : 'Cooling')) || subControls[0] ):
																	subControls[0]);

	let entries = $derived(utils.extractEntries(controlStore.getState(selectedSubControl.states.entriesAndDefaultValue)));
	let modeList = $derived(String(controlStore.getState(selectedSubControl.states.modeList))); 
	let mode = $derived(Number(controlStore.getState(selectedSubControl.states.mode))); 
	let dayModes = $derived(utils.extractDayModes(modeList));

	let margin = 250;
	let size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin || 0);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});

	function parseScroll(height: number, view: any = undefined) {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: $_('Duration'),
		openDialog: false
	});

	let calendarView: CalendarView = $state({
		control: controlView.control,
		isIRC: true,
		isIRCV1: isV1,
		isCooling: false, // will be updated when dialog is opened
		openDialog: false
	});

	let calendarEntryView: CalendarEntryView = $state({
		control: controlView.control,
		subControl: controlView.control, // updated when dialog is opened
		isIRC: false, // updated when dialog is opened
		isCooling: false, // updated when dialog is opened
		label: '', // updated when dialog is opened
		enableDelete: true, // updated when dialog is opened
		openDialog: false // updated when dialog is opened
	});

	function getOperatingMode(s: string) {
		let obj = Object.entries(opModes).find ( e => e[1] == s );
		return obj ? obj[0] : '';
	}

	function updateEntry(item: CalendarListItem) {
		selectedEntry = entries.entry.find( (entry: Entry) =>
			entry.to == item.to && 
			entry.from == item.from && 
			entry.needActivate == item.needActivate &&
			entry.value == item.value &&
			entry.mode == getOperatingMode(item.name[0])
		);
		if (selectedEntry) {
			calendarEntryView.label = $_('Update entry');
			calendarEntryView.control = controlView.control;
			calendarEntryView.subControl = selectedSubControl;
			calendarEntryView.isIRC = true;
			calendarEntryView.isCooling = isCooling;
			calendarEntryView.enableDelete = true;
			calendarEntryView.openDialog = true;
		}
	}

	function addEntry() {
		let coolingNr = isCooling ? 2 : 1;
		selectedEntry = {
			mode: String(mode),
			from: utils.epoch2TimeStrNextHour(Date.now()/1000),
			to: utils.epoch2TimeStrNextHour((Date.now()/1000)+3600),
			needActivate: '0',
			value: temperatureList && temperatureList[coolingNr].id ? temperatureList[coolingNr].id : '0',
		}
		calendarEntryView.label = $_('Add entry');
		calendarEntryView.control = controlView.control;
		calendarEntryView.subControl = selectedSubControl;
		calendarEntryView.isIRC = true;
		calendarEntryView.isCooling = isCooling;
		calendarEntryView.enableDelete = false;
		calendarEntryView.openDialog = true;
	}

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
		loxWsClient.control(controlView.control.uuidAction, cmd);
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
			loxWsClient.control(controlView.control.uuidAction, cmd);
		} else {
			console.error('IRC: timer period to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function cancelOverride() {
		if (controlView.control) {
			loxWsClient.control(controlView.control.uuidAction, isV1 ? 'stoptimer' : 'stopOverride');
		}
	}

	function updatePosition(e: any) { // TODO
	}

	function getTemperatureMode(item: any) {
		const mode = Number(item.value);
		let obj = temperatureList.find( item => item.id == mode);
		return obj && obj.name ? $_(obj.name) : '';
	}

	function updateTimer(e: any) {
		date = e.value;
	}

	function tempFormat(temp: number | undefined) {
		return temp?.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '°';
	}

	function getTemperature(item: any) {
		const mode = Number(item.value);
		let obj = temperatureList.find( item => item.id == mode);
		return (obj && obj.value) ? 
			' ('+ obj.value.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '°)' // TODO Fahrenheit
			: '';
	}

	function getTimerEpoch(entries: any) {
		if (!entries) return;
		if (entries.length ==0) return;
		let timerDate = entries[0].end * 1000 + utils.loxTimeRef;
		return utils.isDST(new Date(timerDate)) ? timerDate + 3600000 : timerDate;
	}

	async function close() {
		controlView.dialog.action(false);
		await tick();
		selectedTab = 1;
	}

	function openCalendarView() {
		calendarView.subControl = selectedSubControl;
		calendarView.isCooling = isCooling;
		calendarView.openDialog=true;
	}

	function filteredEntries() {
		let list: CalendarListItem[] = [];
		entries?.entry.forEach( (entry: Entry) => {
			let itemFound = list.find( item => entry.from == item.from && 
				entry.to == item.to &&
				entry.needActivate == item.needActivate &&
				entry.value == item.value);
			if (itemFound) { // entry exists, only add dayMode
				itemFound.name.push(', '+ opModes[entry.mode]);
			} else { // new entry
				list.push({ 
					name: [opModes[entry.mode]],
					to: entry.to,
					from: entry.from,
					needActivate: entry.needActivate,
					value: entry.value});
			}
		});
		return list.sort((a, b) => Number(a.value) - Number(b.value));
	}

	$effect( () => {
		timerEndsV1 = new SvelteDate(appStore.date.valueOf() + overrideV1 * 1000);
		timerEndsV2 = new SvelteDate(getTimerEpoch(overrideEntriesV2));
	});
</script>

{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4" >
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px]">
					<!--<Info control={controlView.control}/>-->
					<header>
						<div class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<p class="h5 flex justify-center items-center">{controlView.textName}</p>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<XIcon class="size-4"/>
								</button>
							</div>
						</div>
					</header>
					<Dialog.Description>
						<div class="flex flex-col items-center justify-center h-full">
							{#if selectedTab==1}
								<div class="w-full mt-4 m-2 p-2 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50">
									<div class="flex flex-row items-center justify-between">
										<div>
											<p class="pl-2 text-base text-left truncate {controlView.statusColor}">{$_(controlView?.statusName)} ({tempFormat(selectedItem?.value)})</p>
										</div>
										<div class="relative flex items-center justify-end">
											{#if isAutomatic}
												<LbIcon class="fill-surface-50 mr-2" name={"/icons/svg/automatic.svg"} width="24" height="24"/>
											{/if}
											{#if isCooling}
												<LbIcon class="fill-cyan-400 mr-2" name={"/icons/svg/mode_cool.svg"} width="24" height="24"/>
											{/if}
											{#if isHeating}
												<FlameIcon class="text-red-500 fill-red-500 mr-2"/>
											{/if}
											{#if isEco}
												<LeafIcon class="text-green-500 mr-2"/>
											{/if}
											{#if override > 0}
												<TimerIcon class="text-purple-500 mr-2"/>
											{/if}
										</div>
									</div>
									<div class="flex flex-col items-center justify-center" onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation -->
										<LbTemperatureSlider min={5} max={28} step={0.1} target={tempTarget} manual={!isAutomatic} actual={tempActual} onValueChange={(e: any) => {updatePosition(e.value)}}/>
										<div class="text-md dark:text-surface-50 text-surface-950">{$_("Actual")}: {tempFormat(tempActual)}</div>
									</div>
								</div>
									<div class="w-full dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { e.stopPropagation(); e.preventDefault(); openCalendarView();}}>
										<div>
											<LbTimeGrid {mode} {entries} {overrideDate} {override}/>
											<h2 class="m-2 text-md text-center dark:text-surface-50 text-surface-950">{dayOfTheWeek}</h2>
										</div>
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
							{#if selectedTab==2}
								<div class="container mt-2 overflow-y-auto grid gap-2" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
									{#each temperatureList as listItem}
										<button type="button" class="w-full pr-4 btn btn-lg {(listItem.id == selectedItem?.id) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
													shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
													onclick={(e) => { e.stopPropagation(); e.preventDefault(); setTemperature(listItem)}}>
											<div class="w-full flex items-center truncate">
												<div class="mr-0 flex w-full justify-between truncate">
													<p class="truncate text-lg dark:text-surface-50 text-surface-950">{$_(listItem.name)}</p>
													<p class="text-lg dark:text-surface-300 text-surface-700">{tempFormat(listItem.value)}</p>
												</div>
											</div>
										</button>
									{/each}
								</div>
								<button class="w-full m-0 mt-4 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
												dark:bg-surface-950 bg-surface-50 px-2 py-2"
												onclick={() => {dateTimeView.openDialog=true}}>
									<div class="w-full flex items-center truncate">
										<div class="mt-0 ml-3 mr-2 flex w-full justify-between truncate">
											<p class="truncate text-lg">{$_("Duration")}</p>
											<p class="text-lg">{format(date, 'PPP p')}</p>
										</div>
									</div>
								</button>
							{/if}
							{#if selectedTab==3}
								<div class="container mt-2 mb-3 overflow-y-auto" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
									<div class="flex flex-col space-y-2">
										{#each filteredEntries() as entry}
											<button type="button" class="w-full dark:bg-surface-950 bg-surface-50
													shadow-sm rounded-lg border border-white/15 hover:border-white/50"
													onclick={(e) => { updateEntry(entry) }}>
													<div class="pl-3 p-1 flex flex-col justify-center text-left">
														<div class="flex flex-row gap-2">
															<p class="text-base dark:text-surface-50 text-surface-950">{getTemperatureMode(entry)}</p>
															<p class="text-base dark:text-surface-300 text-surface-700">{getTemperature(entry)}</p>
														</div>
														<p class="text-xs truncate dark:text-surface-300 text-surface-700">{entry.name}</p>
														<p class="text-xs dark:text-surface-300 text-surface-700">{entry.from} - {entry.to} </p>
													</div>
											</button>
										{/each}
									</div>
								</div>
								<div class="container grid grid-cols-2 gap-2">
									<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																								rounded-lg border border-white/15 hover:border-white/50" onclick={openCalendarView}>
										<span class="text-base">{$_("Open calendar")}</span>
									</button>
									<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																								rounded-lg border border-white/15 hover:border-white/50" onclick={addEntry}>
										<span class="text-base">{$_("Add entry")}</span>
									</button>
								</div>
							{/if}
							<div class="relative w-full mt-6 mb-2">
								<div class="grid h-full max-w-lg grid-cols-3 mx-auto">
									<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=1}>
										<LbIcon class={selectedTab==1 ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-50'} name={"/icons/svg/thermostat.svg"} width="24" height="24"/>
										<span class="mt-1 text-xs">{$_("Control")}</span>
									</button>
									<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=2}>
										<ListIcon/>
										<span class="mt-1 text-xs">{$_("Preset")}</span>
									</button>
									<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==3 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=3}>
										<CalendarClockIcon/>
										<span class="mt-1 text-xs">{$_("Switching times")}</span>
									</button>
								</div>
							</div>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
	<LbDateTimePickerDialog date={date} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTimer(e)}}/>
	<LbCalendarDialog bind:view={calendarView} {mode} {dayModes} {entries} {temperatureList}/>
	<LbCalendarEntryDialog bind:view={calendarEntryView} {entries} {selectedEntry} {dayModes} {temperatureList}/>
{/if}
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
