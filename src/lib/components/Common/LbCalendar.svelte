<script lang="ts">
	import { utils } from '$lib/helpers/Utils';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import type { Entry } from '$lib/types/models';
	import LbCalendarEntry from '$lib/components/Common/LbCalendarEntry.svelte';
	import { _ } from 'svelte-i18n';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { format } from 'date-fns';

	let { open = $bindable(false), control, subControl = undefined, isIRC = false, isIRCV1 = false,
		isCooling = false, mode, dayModes, entries, temperatureList = [] } = $props();

	const hours = [...Array(24).keys(), 0];

	// these variables should not be reactive, as we keep their initial state
	let initialEntries: Entry[] = [];
	let length = 0;
	let initialModes: number[] = [];	

	let selectedEntry = $state();
	let calendarEntryOpen = $state(false);
	let calendarEntryTitle = $state('');
	let calendarEntryEnableDelete = $state(true);

	let modeEntries: number[] = $derived(entries.entry.map( (m: Entry) => m.mode));
	let modes = $derived(modeEntries.filter((mode, idx) => modeEntries.indexOf(mode) == idx));
	let currentTime = $derived(format(appStore.date, 'p'));

	/**
	 * Formats a zero-based hour number as a zero-padded HH:00 time string.
	 *
	 * @param hour - hour value (0–24).
	 * @returns formatted string, e.g. `'08:00'` or `'24:00'`.
	 */
	function notation(hour: number): string {
		return String(hour).padStart(2, '0') + ':00';
	}

	/**
	 * Returns the Tailwind fill class for a daytimer calendar block based on
	 * whether the entry needs activation.
	 *
	 * @param needActivate - `'0'` when the entry is active, any other value when it needs activation.
	 * @returns Tailwind fill class string (primary for active, tertiary for needs-activation).
	 */
	function getDayTimerColor(needActivate: string): string {
		return needActivate == '0' ? 'dark:fill-primary-500 fill-primary-700' : 'dark:fill-tertiary-500 fill-tertiary-700'
	}

	/**
	 * Returns the Tailwind fill class for an IRC calendar block based on the
	 * operating mode. Offsets the mode value by 10 for IRC V2 to differentiate
	 * from V1 modes in the switch statement.
	 *
	 * @param mode - operating mode value as a numeric string.
	 * @returns Tailwind fill class string, or an empty string for Eco modes (0 / 10).
	 */
	function getIRCColor(mode: string): string {
		let fillColor = '';
		let mode_ = Number(mode);
		mode_ = isIRCV1 ? mode_ : (mode_ + 10); // differentiate between IRC V1 and V2
		switch(mode_) {
			case 1: // Comfort heating (green)
			case 2: fillColor = 'dark:fill-primary-500 fill-primary-700'; break; 			// V1 cComfort cooling (green)
			case 3: fillColor = 'dark:fill-secondary-500 fill-secondary-700'; break;	// V1 Empty house / deep sleep (blue)
			case 4: fillColor = 'dark:fill-warning-500 fill-warning-700'; break;			// V1 Heat protection (orange)
			case 5: fillColor = 'dark:fill-error-500 fill-error-700'; break;					// V1 Increased heat  (red)
			case 6: fillColor = 'dark:fill-purple-500 fill-purple-700'; break;				// V1 Party (purple)
			case 11: fillColor = 'dark:fill-primary-500 fill-primary-700'; break;			// V2 Comfort temperature (green)
			case 12: fillColor = 'dark:fill-secondary-500 fill-secondary-700'; break;	// V2 Building protection (blue)
			case 13: fillColor = 'dark:fill-gray-500 fill-gray-700'; break;						// V2 Manual (gray)
			case 14: fillColor = 'dark:fill-secondary-500 fill-secondary-700'; break;	// V2 Off (blue)
			default: ''; // V1 and V2 Eco (blank) for 0 and 10
		}
		return fillColor;
	}

	/**
	 * Converts an HH:MM time string to a decimal hour value used for SVG
	 * y-position calculations (e.g. `'06:30'` → `6.5`).
	 *
	 * @param time - time string in HH:MM format.
	 * @returns decimal hours, where each unit corresponds to 40 px on the calendar grid.
	 */
	function getTime(time: string): number {
		return utils.hours2dec(time);
	}

	/**
	 * Looks up the temperature label for an IRC calendar entry from the
	 * temperature list passed as a prop.
	 *
	 * @param entry - calendar entry whose `value` field holds a temperature list ID.
	 * @returns temperature string with degree symbol (e.g. `'21°'`), or an empty string if not found.
	 */
	function getTemperature(entry: Entry): string {
		let idx = temperatureList.findIndex((item) => item.id == entry.value);
		return (idx != -1) ? temperatureList[idx].value + '°' : '';
	}

	/**
	 * Returns the column index of an operating mode in the initial snapshot of
	 * modes. Using the initial list avoids column shifts when entries are deleted.
	 *
	 * @param mode - operating mode number to locate.
	 * @returns zero-based column index, or `-1` if not found.
	 */
	function getModeIndex(mode: number): number {
		return initialModes.findIndex((item) => item == mode);
	}

	/**
	 * Formats the from–to time range of a calendar entry for display.
	 * Internally 24:00 is used for graphics, but the label corrects this to 00:00.
	 *
	 * @param time - calendar entry containing `from` and `to` time strings.
	 * @returns human-readable range string, e.g. `'08:00 - 10:00'`.
	 */
	// TODO: fix formatting of date-fns notation 0:00
	function showTime(time: Entry): string {
		return 	utils.hours2hours(time.from) + ' - ' + 
						utils.hours2hours(time.to, true);  // correct 24:00 -> 00:00
	}

	/**
	 * Opens the entry editor pre-populated with a new entry for the current
	 * operating mode, defaulting to the next full hour and a one-hour duration.
	 * For IRC controls the initial temperature is taken from the temperature list.
	 */
	function addEntry(): void {
		let coolingIdx = isCooling ? 2 : 1;
		selectedEntry = {
			mode: String(mode),
			from: utils.epoch2TimeStrNextHour(Date.now()/1000),
			to: utils.epoch2TimeStrNextHour((Date.now()/1000)+3600),
			needActivate: '0',
			value: isIRC && temperatureList && temperatureList[coolingIdx].id ? temperatureList[coolingIdx].id : '0',
		}
		calendarEntryTitle = $_('Add entry');
		calendarEntryEnableDelete = false;
		calendarEntryOpen = true;
	}

	/**
	 * Opens the entry editor pre-populated with an existing entry for editing
	 * or deletion.
	 *
	 * @param entry - the calendar entry to edit.
	 */
	function updateEntry(entry: Entry): void {
		selectedEntry = entry;
		calendarEntryTitle = $_('Update entry');
		calendarEntryEnableDelete = true;
		calendarEntryOpen = true;
	}

	/**
	 * Returns a localised parenthetical suffix indicating whether the calendar
	 * shows the heating or cooling schedule, shown only for IRC V1 controls.
	 *
	 * @returns string such as `' (Cooling)'` or `' (Heating)'`, or an empty string for non-V1 controls.
	 */
	function getCoolingDayTimerInfo(): string {
		if (isIRCV1) {
			return ' (' + (isCooling ? $_("Cooling") : $_("Heating") ) + ')';
		}
		return '';
	}

	/**
	 * Closes the calendar dialog and clears the initial-entries snapshot so
	 * it is rebuilt fresh the next time the dialog opens.
	 */
	function close(): void {
		initialEntries = [];
		open = false;
	}

	/**
	 * Snapshots the entry list and operating modes the first time entries arrive,
	 * and recomputes the SVG canvas width based on the number of distinct modes.
	 */
	$effect( () => {
		if (entries && initialEntries.length < entries.entry.length) {
			initialEntries = entries.entry;
			initialModes = modes;
			length = initialModes.length * 155;
		}
	});
</script>

<LbDialog {open} onClose={close}
	title={$_("Calendar")} isFullscreen={true} zIndex="z-20">
	{#snippet header()}
		<header class="sticky top-0 z-1 preset-filled-surface-100-900 shadow-md">
			<div class="grid grid-cols-2 text-center items-center h-[60px]">
				<div class="flex flex-row items-center gap-3">
					<button class="btn-icon ml-4" onclick={close}>
						<LbIcon name="arrow-left"/>
					</button>
					<p class="text-lg">{$_("Calendar")} {getCoolingDayTimerInfo()}</p>
				</div>
				<div class="mr-3 flex flex-row gap-3 justify-end">
					<button type="button" aria-label="add" class="btn-icon" onclick={addEntry}>
						<LbIcon name="plus"/>
					</button>
				</div>
			</div>
		</header>
	{/snippet}
	{#snippet description()}
		<div class="overflow-x-auto">
			<div class="flex flex-row">
				<div>
					<svg width="65" height="1050">
						{#each hours as hour,j}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" x="10" y={60+j*40}>{notation(hour)}</text>
						{/each}
					</svg>
				</div>
				<div>
					<svg width={length+20} height="1050">
						<rect class="dark:fill-surface-900 fill-surface-100" x={0+getModeIndex(mode)*156} y="55" width="150" height="960" fill="currentColor"></rect>
						{#each initialModes as mode}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" text-anchor="middle" x={75+getModeIndex(mode)*156} y="40">{controlStore.operatingModes.get(String(mode))}</text>
						{/each}
						{#each hours as _,j}
							<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="150 6" d="m 0 {55+j*40} H {length}"></path>
							{#if j<24}
								<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="6" d="m 0 {75+j*40} H {length}"></path>
							{/if}
						{/each}
						{#each entries?.entry as entry}
							<g onclick={() => updateEntry(entry)}>
								{#if isIRC}
									<rect class={getIRCColor(entry.value)} x={0+getModeIndex(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} rx="6"></rect>
								{:else}
									<rect class={getDayTimerColor(entry.needActivate)} x={0+getModeIndex(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} rx="6"></rect>
								{/if}
								<text class="fill-surface-50-950" x={5+getModeIndex(entry.mode)*156} y={70+getTime(entry.from)*40} font-size="14">{showTime(entry)}</text>
								{#if isIRC}
									<text class="fill-surface-50-950" x={5+getModeIndex(entry.mode)*156} y={90+getTime(entry.from)*40} font-size="14">{getTemperature(entry)}</text>
								{/if}
							</g>
						{/each}
						<path class="dark:stroke-surface-50 stroke-surface-950" stroke-width="2" d="m 0 {55+getTime(currentTime)*40} H {length}"></path>
					</svg>
				</div>
			</div>
		</div>
	{/snippet}
</LbDialog>

<LbCalendarEntry
	bind:open={calendarEntryOpen}
	title={calendarEntryTitle}
	{isIRC}
	{isCooling}
	enableDelete={calendarEntryEnableDelete}
	{control}
	{subControl}
	{entries} {selectedEntry} {dayModes} {temperatureList}/>
