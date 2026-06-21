<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import { innerHeight } from 'svelte/reactivity/window';
	import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ListItem, CalendarView, Entry, CalendarEntryView, CalendarListItem, EntriesAndDefaultValue, WeekDays } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbTemperatureSlider from '$lib/components/Irc/LbTemperatureSlider.svelte';
	import LbTimeGrid from '$lib/components/Common/LbTimeGrid.svelte';
	import LbDateTimePicker from '$lib/components/Common/LbDateTimePicker.svelte';
	import LbCalendarEntry from '$lib/components/Common/LbCalendarEntry.svelte';
	import LbCalendar from '$lib/components/Common/LbCalendar.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { format } from 'date-fns';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	type Tab = 'control' | 'preset' | 'schedule';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const toaster = createToaster({ duration: 1500 });
	const margin = 250;

	let controlOpen = $state(false);
	let selectedTab = $state<Tab>('control');
	let overrideDate = $state({ start: new SvelteDate().valueOf(), end: new SvelteDate().valueOf() });
	let viewport: any = $state();
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);
	let date: SvelteDate = $state(new SvelteDate(Date.now() + 3600000));
	let selectedEntry: any = $state();

	let dateTimeOpen = $state(false);
	let calendarView: CalendarView = $state({ control: control, isIRC: true, isIRCV1: false, isCooling: false, openDialog: false });
	let calendarEntryView: CalendarEntryView = $state({
		control: control, subControl: control,
		isIRC: false, isCooling: false, label: '', enableDelete: true, openDialog: false
	});

	let subControls = $derived(Object.values(control.subControls) as Control[]);
	let selectedSubControl = $derived(subControls[0]);
	let tempActualNum = $derived(Number(controlStore.getState(control.states?.tempActual)));
	let tempActual = $derived(fmt.sprintf('%.1f', tempActualNum));
	let tempTarget = $derived(Number(controlStore.getState(control.states?.tempTarget)));
	let activeMode = $derived(Number(controlStore.getState(control.states?.activeMode)));
	let operatingMode = $derived(Number(controlStore.getState(control.states?.operatingMode)));
	let currentMode = $derived(Number(controlStore.getState(control.states?.currentMode)));
	let comfortTemperature = $derived(Number(controlStore.getState(control.states?.comfortTemperature)));
	let comfortTemperatureCool = $derived(Number(controlStore.getState(control.states?.comfortTemperatureCool)));
	let frostProtectTemperature = $derived(Number(controlStore.getState(control.states?.frostProtectTemperature)));
	let absentMaxOffset = $derived(Number(controlStore.getState(control.states?.absentMaxOffset)));
	let overrideEntries = $derived(controlStore.getState(control.states?.overrideEntries));
	let override = $derived(overrideEntries && (overrideEntries as any)[0]?.isTimer ? 1 : 0);
	let timerEnds = $derived(new SvelteDate(getTimerEpoch(overrideEntries) ?? Date.now()));
	let isHeating = $derived(currentMode === 1 || currentMode === 4);
	let isCooling = $derived(currentMode === 2 || currentMode === 5);
	let isAutomatic = $derived(operatingMode < 3);
	let isEco = $derived(activeMode === 0);
	// activeMode 2 remaps to index 4 (Off) in the temperatureIdsList
	let modeIndex = $derived(activeMode === 2 ? 4 : activeMode);
	let temperatureIdsList = $derived(getTemperatureList(isHeating, false));
	let temperatureList = $derived(temperatureIdsList.filter((item) => item.visible));
	let selectedItem = $derived(temperatureIdsList[modeIndex]);
	let statusName = $derived(selectedItem ? $_(selectedItem.name) : '');
	let statusColor = $derived(
		selectedItem && selectedItem.id > 0 && selectedItem.id !== 4
			? 'dark:text-primary-500 text-primary-700'
			: 'dark:text-surface-300 text-surface-700'
	);
	let gridMode = $derived(Number(controlStore.getState(selectedSubControl.states.mode)));
	let entries = $derived(utils.extractEntries(controlStore.getState(selectedSubControl.states.entriesAndDefaultValue))) as EntriesAndDefaultValue;
	let modeList = $derived(String(controlStore.getState(selectedSubControl.states.modeList)));
	let dayModes = $derived(utils.extractDayModes(modeList)) as WeekDays;
	let windowHeight = $derived(innerHeight.current || 0);
	let availableHeight = $derived(Math.floor(windowHeight * 0.9) - margin);
	let style = $derived(viewport && viewport.scrollHeight > availableHeight ? `height: ${availableHeight}px` : 'height: auto');
	let dayOfTheWeek = $derived(format(appStore.date, 'eeee'));

	$effect(() => { parseScroll(windowHeight, viewport); });

	/**
	 * Builds the V2 temperature preset list with computed target values for the
	 * current heating/cooling state.
	 *
	 * @param isHeatingOn - true when the controller is currently heating.
	 * @param isManual - true to show the Manual preset entry.
	 * @returns array of ListItem entries with computed `value` and `visible` fields.
	 */
	function getTemperatureList(isHeatingOn: boolean, isManual: boolean): ListItem[] {
		const modes: ListItem[] = [
			{ id: 0, name: 'Economy',              value: 0, visible: true },
			{ id: 1, name: 'Comfort temperature',  value: 0, visible: true },
			{ id: 2, name: 'Building protection',  value: 0, visible: true },
			{ id: 3, name: 'Manual',               value: 0, visible: false },
			{ id: 4, name: 'Off',                  value: 0, visible: true }
		];
		if (isHeatingOn) {
			modes[0].value = comfortTemperature - absentMaxOffset;
			modes[1].value = comfortTemperature;
			modes[2].value = frostProtectTemperature;
			modes[4].value = frostProtectTemperature;
		} else {
			modes[0].value = comfortTemperatureCool - absentMaxOffset;
			modes[1].value = comfortTemperatureCool;
			modes[2].value = frostProtectTemperature;
			modes[4].value = frostProtectTemperature;
		}
		if (isManual) modes[3].visible = true;
		return modes;
	}

	/**
	 * Computes the epoch timestamp for the current V2 override timer end,
	 * adjusting for the Loxone time reference (1-1-2009) and DST.
	 *
	 * @param overrideList - the current overrideEntries state value.
	 * @returns epoch milliseconds for the timer end, or `undefined` when no override is active.
	 */
	function getTimerEpoch(overrideList: any): number | undefined {
		if (!overrideList || (overrideList as any[]).length === 0) return;
		const timerDate = (overrideList as any)[0].end * 1000 + utils.loxTimeRef;
		return utils.isDST(new Date(timerDate)) ? timerDate + 3600000 : timerDate;
	}

	/** Returns the display name for the control, falling back to room name for generic IRC names. */
	function getTextName(): string {
		const origNameFound = $_('IRoomController').includes(control.name);
		const room = controlStore.rooms.get(control.room);
		return origNameFound && room ? room.name : control.name;
	}

	/** Returns the active colour class when the given tab is selected. */
	function tabActive(tab: Tab): string {
		return selectedTab === tab ? 'dark:text-primary-500 text-primary-700' : '';
	}

	/**
	 * Formats a temperature number as a localised string with one decimal place and degree symbol.
	 *
	 * @param temp - temperature value to format.
	 * @returns formatted string, e.g. '21.5°'.
	 */
	function tempFormat(temp: number | undefined): string {
		return (temp?.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) ?? '') + '°';
	}

	/**
	 * Returns the localised temperature mode label for a schedule entry.
	 *
	 * @param item - a schedule entry with a numeric `value` field mapping to a preset id.
	 * @returns localised preset name, or empty string when not found.
	 */
	function getTemperatureMode(item: any): string {
		const obj = temperatureList.find((listItem) => listItem.id == Number(item.value));
		return obj?.name ? $_(obj.name) : '';
	}

	/**
	 * Returns the formatted target temperature in parentheses for a schedule entry.
	 *
	 * @param item - a schedule entry with a numeric `value` field mapping to a preset id.
	 * @returns formatted string like ' (21.5°)', or empty string when not found.
	 */
	function getTemperature(item: any): string {
		const obj = temperatureList.find((listItem) => listItem.id == Number(item.value));
		return obj?.value
			? ' (' + obj.value.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + '°)'
			: '';
	}

	/**
	 * Looks up the operating-mode UUID key for a given mode display string.
	 *
	 * @param s - the operating mode display string to find.
	 * @returns the UUID key, or empty string when not found.
	 */
	function getOperatingMode(s: string): string {
		const obj = Array.from(controlStore.operatingModes.entries()).find((e) => e[1] === s);
		return obj ? obj[0] : '';
	}

	/**
	 * Merges schedule entries with the same time window into a single list item,
	 * accumulating day-mode names, then sorts by preset value.
	 *
	 * @returns deduplicated, sorted list of calendar list items for the schedule tab.
	 */
	function filteredEntries(): CalendarListItem[] {
		const list: CalendarListItem[] = [];
		entries?.entry.forEach((entry: Entry) => {
			const existing = list.find((item) =>
				entry.from === item.from && entry.to === item.to &&
				entry.needActivate === item.needActivate && entry.value === item.value
			);
			if (existing) {
				existing.name.push(', ' + controlStore.operatingModes.get(entry.mode));
			} else {
				const name = controlStore.operatingModes.get(entry.mode);
				list.push({ name: name ? [name] : [], to: entry.to, from: entry.from, needActivate: entry.needActivate, value: entry.value });
			}
		});
		return list.sort((a, b) => Number(a.value) - Number(b.value));
	}

	/**
	 * Opens the control dialog. Delegates to `controlOptions.action` when set.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		controlOpen = true;
	}

	/**
	 * Closes the control dialog and resets the tab to Control after the dialog
	 * has finished closing (tick ensures the reset is not visible during exit).
	 */
	async function closeControl(): Promise<void> {
		controlOpen = false;
		await tick();
		selectedTab = 'control';
	}

	/**
	 * Opens the calendar view sub-dialog for the active subcontrol,
	 * passing the current cooling state.
	 */
	function openCalendarView(): void {
		(calendarView as any).subControl = selectedSubControl;
		calendarView.isCooling = isCooling;
		calendarView.openDialog = true;
	}

	/**
	 * Populates `calendarEntryView` from an existing schedule entry and opens
	 * the entry editor dialog.
	 *
	 * @param item - the calendar list item selected by the user.
	 */
	function updateEntry(item: CalendarListItem): void {
		selectedEntry = entries.entry.find((entry: Entry) =>
			entry.to === item.to && entry.from === item.from &&
			entry.needActivate === item.needActivate && entry.value === item.value &&
			entry.mode === getOperatingMode(item.name[0])
		);
		if (selectedEntry) {
			calendarEntryView.label = $_('Update entry');
			calendarEntryView.control = control;
			calendarEntryView.subControl = selectedSubControl;
			calendarEntryView.isIRC = true;
			calendarEntryView.isCooling = isCooling;
			calendarEntryView.enableDelete = true;
			calendarEntryView.openDialog = true;
		}
	}

	/**
	 * Prepopulates `calendarEntryView` with a new entry template starting at
	 * the next full hour and opens the entry editor dialog.
	 */
	function addEntry(): void {
		const coolingNr = isCooling ? 2 : 1;
		selectedEntry = {
			mode: String(gridMode),
			from: utils.epoch2TimeStrNextHour(Date.now() / 1000),
			to: utils.epoch2TimeStrNextHour((Date.now() / 1000) + 3600),
			needActivate: '0',
			value: temperatureList[coolingNr]?.id ?? '0'
		};
		calendarEntryView.label = $_('Add entry');
		calendarEntryView.control = control;
		calendarEntryView.subControl = selectedSubControl;
		calendarEntryView.isIRC = true;
		calendarEntryView.isCooling = isCooling;
		calendarEntryView.enableDelete = false;
		calendarEntryView.openDialog = true;
	}

	/**
	 * Sets the comfort temperature to the current target value (manual mode, V2 only).
	 * Uses `setComfortTemperatureCool` when currently cooling, otherwise `setComfortTemperature`.
	 */
	function setTempManual(): void {
		controlStore.setControl(control, (isCooling ? 'setComfortTemperatureCool/' : 'setComfortTemperature/') + tempTarget);
	}

	/**
	 * Activates a temperature preset via an override command (`override`).
	 * Time is specified in seconds from now, relative to the Loxone time reference
	 * (1-1-2009) with DST correction applied.
	 * Manual mode (id=3) uses `setTempManual` instead.
	 * Shows a toast when the selected duration is too short (< 60 s).
	 *
	 * @param item - the temperature preset list item selected by the user.
	 */
	function setTemperature(item: ListItem): void {
		if (item.id === 3) { setTempManual(); return; }
		const coeff = 1000 * 60;
		let overrideTimeSec = Math.round((date.getTime() - Date.now()) / coeff) * coeff / 1000;
		if (overrideTimeSec > 60) {
			overrideDate = { start: Date.now(), end: Date.now() + overrideTimeSec * 1000 };
			// V2 counts from 1-1-2009 (loxTimeRef) and requires DST correction
			overrideTimeSec += Math.round((Date.now() - utils.loxTimeRef) / 1000);
			overrideTimeSec += utils.isDST(date) ? -3600 : 0;
			controlStore.setControl(control, 'override/' + String(item.id) + '/' + String(overrideTimeSec));
		} else {
			console.error('[LbIrcV2] timer period too low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!' });
		}
	}

	/** Cancels the active temperature preset override. */
	function cancelOverride(): void {
		controlStore.setControl(control, 'stopOverride');
	}

	/**
	 * Updates `date` when the user picks a new end time in the date/time picker.
	 *
	 * @param e - event carrying the new Date value.
	 */
	function updateTimer(e: any): void {
		date = e.value;
	}

	/**
	 * Recomputes scroll-indicator visibility from the current viewport metrics.
	 *
	 * @param height - current window inner height (guards against SSR zero).
	 * @param view - the scrollable div element bound via bind:this.
	 */
	function parseScroll(height: number, view: any = undefined): void {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && view.scrollTop > 10;
		showScrollBottom = height > 0 && hasScroll && view.scrollTop + view.clientHeight < view.scrollHeight - 10;
	}
</script>

<LbControl {controlOptions} iconName="" iconText={tempActual} iconColor="fill-surface-950 dark:fill-surface-50"
	{statusName} {statusColor} textName={getTextName()} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={getTextName()}>
		{#snippet description()}
			{#if selectedTab === 'control'}
				<div class="w-full mt-4 p-2 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50">
					<div class="flex flex-row items-center justify-between">
						<p class="pl-2 text-base text-left truncate {statusColor}">{statusName} ({tempFormat(selectedItem?.value)})</p>
						<div class="relative flex items-center justify-end">
							{#if isAutomatic}<LbIcon class="text-surface-50 mr-2" name="automatic-circle" width="24" height="24"/>{/if}
							{#if isCooling}<LbIcon class="text-cyan-400 mr-2" name="cooling" width="24" height="24"/>{/if}
							{#if isHeating}<LbIcon name="flame" class="text-red-500 fill-red-500 mr-2"/>{/if}
							{#if isEco}<LbIcon name="leaf" class="text-green-500 mr-2"/>{/if}
							{#if override > 0}<LbIcon name="timer" class="text-purple-500 mr-2"/>{/if}
						</div>
					</div>
					<div class="flex flex-col items-center justify-center" onclick={(e) => e.stopPropagation()}>
						<LbTemperatureSlider min={5} max={28} step={0.1} target={tempTarget} manual={!isAutomatic} actual={tempActualNum} onValueChange={() => {}}/>
						<div class="text-md dark:text-surface-50 text-surface-950">{$_('Actual')}: {tempFormat(tempActualNum)}</div>
					</div>
				</div>
				<div class="w-full mt-2 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); openCalendarView(); }}>
					<LbTimeGrid mode={gridMode} {entries} {overrideDate} {override}/>
					<h2 class="m-2 text-md text-center dark:text-surface-50 text-surface-950">{dayOfTheWeek}</h2>
				</div>
				{#if override > 0}
					<div class="text-center">
						<p class="mt-2 mb-2 text-lg">{$_('Duration')} {format(timerEnds, 'PPP p')}</p>
						<button type="button" class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={cancelOverride}>
							<p class="text-lg">{$_('Cancel timer')}</p>
						</button>
					</div>
				{/if}
			{/if}
			{#if selectedTab === 'preset'}
				<div class="container mt-2 overflow-y-auto grid gap-2" {style} bind:this={viewport}
						onscroll={() => parseScroll(windowHeight, viewport)}>
					{#each temperatureList as listItem}
						<button type="button"
								class="w-full pr-4 btn btn-lg {listItem.id === selectedItem?.id ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); setTemperature(listItem); }}>
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
						bg-surface-50-950 px-2 py-2"
						onclick={() => (dateTimeOpen = true)}>
					<div class="w-full flex items-center truncate">
						<div class="mt-0 ml-3 mr-2 flex w-full justify-between truncate">
							<p class="truncate text-lg">{$_('Duration')}</p>
							<p class="text-lg">{format(date, 'PPP p')}</p>
						</div>
					</div>
				</button>
			{/if}
			{#if selectedTab === 'schedule'}
				<div class="container mt-2 mb-3 overflow-y-auto" {style} bind:this={viewport}
						onscroll={() => parseScroll(windowHeight, viewport)}>
					<div class="flex flex-col space-y-2">
						{#each filteredEntries() as entry}
							<button type="button"
									class="w-full bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={() => updateEntry(entry)}>
								<div class="pl-3 p-1 flex flex-col justify-center text-left">
									<div class="flex flex-row gap-2">
										<p class="text-base dark:text-surface-50 text-surface-950">{getTemperatureMode(entry)}</p>
										<p class="text-base dark:text-surface-300 text-surface-700">{getTemperature(entry)}</p>
									</div>
									<p class="text-xs truncate dark:text-surface-300 text-surface-700">{entry.name}</p>
									<p class="text-xs dark:text-surface-300 text-surface-700">{entry.from} - {entry.to}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
				<div class="container grid grid-cols-2 gap-2">
					<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
							onclick={openCalendarView}>
						<span class="text-base">{$_('Open calendar')}</span>
					</button>
					<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
							onclick={addEntry}>
						<span class="text-base">{$_('Add entry')}</span>
					</button>
				</div>
			{/if}
			<div class="relative w-full mt-6 mb-2">
				<div class="grid h-full max-w-lg grid-cols-3 mx-auto">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('control')}"
							onclick={() => { viewport = undefined; selectedTab = 'control'; }}>
						<LbIcon class={selectedTab === 'control' ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-50'} name="thermostat" width="24" height="24"/>
						<span class="mt-1 text-xs">{$_('Control')}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('preset')}"
							onclick={() => { viewport = undefined; selectedTab = 'preset'; }}>
						<LbIcon name="list"/>
						<span class="mt-1 text-xs">{$_('Preset')}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('schedule')}"
							onclick={() => { viewport = undefined; selectedTab = 'schedule'; }}>
						<LbIcon name="calendar-clock"/>
						<span class="mt-1 text-xs">{$_('Schedule')}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}

<LbDateTimePicker date={date} bind:open={dateTimeOpen} title={$_('Duration')} isDateView={true} onValueChange={(e: any) => updateTimer(e)}/>

<LbCalendar bind:view={calendarView} mode={gridMode} {dayModes} {entries} {temperatureList}/>

<LbCalendarEntry bind:view={calendarEntryView} {entries} {selectedEntry} {dayModes} {temperatureList}/>

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
