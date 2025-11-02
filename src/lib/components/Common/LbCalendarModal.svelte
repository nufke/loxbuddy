<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { utils } from '$lib/helpers/Utils';
	import { Plus, ArrowLeft } from '@lucide/svelte';
	import type { Entry, CalendarEntryView } from '$lib/types/models';
	import LbCalendarEntryModal from '$lib/components/Common/LbCalendarEntryModal.svelte';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/Store.svelte';

	let { view = $bindable(), mode, dayModes, entries, temperatureList = [] } = $props();

	const notation = (num: number) => String(num).padStart(2, '0') + ':00'
	const hours = [...Array(24).keys(), 0];

	// these variables should not be reative, as we keep their initial state
	let initialEntries: Entry[] = [];
	let length = 0;
	let initialModes: number[] = [];

	let modeEntries: number[] = $derived(entries.entry.map( (m: Entry) => m.mode));
	let modes = $derived(modeEntries.filter((mode, idx) => modeEntries.indexOf(mode) == idx));
	let opModes = $derived(store.structure.operatingModes);

	let selectedEntry = $state();

	$effect( () => {
		if (entries && initialEntries.length < entries.entry.length) {
			initialEntries = entries.entry;
			initialModes = modes;
			length = initialEntries.length * 156 + 60;
		}
	});

	function getDayTimerColor(needActivate: string) {
		return needActivate == '0' ? 'dark:fill-primary-500 fill-primary-700' : 'dark:fill-tertiary-500 fill-tertiary-700'
	}

	function getIRCColor(mode: string) {
		let fillColor = '';
		let mode_ = Number(mode);
		mode_ = view.isIRCV1 ? mode_ : (mode_ + 10); // differentiate between IRC V1 and V2
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

	function getTextColor() {
		return 'dark:fill-surface-950 fill-surface-50';
	}

	function getTime(time: string) {
		return utils.hours2dec(time);
	}

	function getTemperature(entry: Entry) {
		let idx = temperatureList.findIndex( item => item.id == entry.value);
		return (idx != -1) ? temperatureList[idx].value + '°' : '';
	}

	function getModeIndex(mode: string) { // check index using the initial modes, as entries could have been removed
		return initialModes.findIndex(item => item == Number(mode));
	}

	// although we calculate with 24:00 for the graphics, we use 00:00 notation to display time 
	// TODO: fix formatting of date-fnd notation 0:00
	function showTime(time: Entry) {
		return 	utils.hours2hours(time.from) + ' - ' + 
						utils.hours2hours(time.to, true);  // correct 24:00 -> 00:00
	}

	function addEntry() {
		let isCooling = view.isCooling ? 2 : 1;
		selectedEntry = {
			mode: String(mode),
			from: utils.epoch2TimeStrNextHour(Date.now()/1000),
			to: utils.epoch2TimeStrNextHour((Date.now()/1000)+3600),
			needActivate: '0',
			value: view.isIRC && temperatureList && temperatureList[isCooling].id ? temperatureList[isCooling].id : '0',
		}
		calendarEntryView.label = $_('Add entry');
		calendarEntryView.control = view.control;
		calendarEntryView.subControl = view.subControl;
		calendarEntryView.isIRC = view.isIRC;
		calendarEntryView.isCooling = view.isCooling;
		calendarEntryView.enableDelete = false;
		calendarEntryView.openModal = true;
	}

	function updateEntry(entry: Entry) {
		selectedEntry = entry;
		calendarEntryView.label = $_('Update entry');
		calendarEntryView.control = view.control;
		calendarEntryView.subControl = view.subControl;
		calendarEntryView.isIRC = view.isIRC;
		calendarEntryView.isCooling = view.isCooling;
		calendarEntryView.enableDelete = true;
		calendarEntryView.openModal = true;
	}

	function getCoolingDayTimerInfo() {
		if (view.isIRCV1) {
			return ' (' + (view.isCooling ? $_("Cooling") : $_("Heating") ) + ')';
		}
		return '';
	}

	function close() {
		initialEntries = [];
		view.openModal = false;
	}

	let calendarEntryView: CalendarEntryView = $state({
		control: view.control,
		subControl: view.subControl,
		isIRC: false, // updated when Modal is opened
		isCooling: false, // updated when Modal is opened
		label: '',
		enableDelete: true,
		openModal: false
	});
</script>

<Modal
	open={view.openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase=""
	contentBase="container mx-auto max-w-full w-full overflow-auto h-full"
	positionerPadding="p-2"
	backdropClasses=""
	backdropBackground="dark:bg-surface-950 bg-surface-50">
	{#snippet content()}
		<!-- TODO better method to close full-screen modal? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 dark:bg-surface-950 bg-surface-50"></div>
		<header class="fixed w-full top-0 left-0 preset-filled-surface-100-900 z-1 shadow-md">
			<div class="grid grid-cols-2 text-center items-center m-auto h-[60px]">
				<div class="flex flex-row text-center items-center gap-3">
					<button class="btn-icon w-auto ml-4 mr-0 text-left" onclick={close}>
						<ArrowLeft/>
					</button>
					<p class="text-lg">{$_("Calendar")} {getCoolingDayTimerInfo()}</p>
				</div>
				<div class="mr-3 flex flex-row gap-3 justify-end">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={addEntry}>
						<Plus />
					</button>
				</div>
			</div>
		</header>
		<div class="mt-[36px]">
			<div class="flex flex-row">
				<div>
					<svg width="65" height="1050">
						{#each hours as hour,j}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" x="10" y={60+j*40}>{notation(hour)}</text>
						{/each}
					</svg>
				</div>
				<div class="overflow-x-auto">
					<svg width={length-80} height="1050">
						<rect class="dark:fill-surface-900 fill-surface-100" x={0+getModeIndex(mode)*156} y="55" width="150" height="960" fill="currentColor"></rect>
						{#each initialModes as mode,i}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" text-anchor="middle" x={75+i*156} y="40">{opModes[mode]}</text>
						{/each}
						{#each hours as hour,j}
							<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="150 6" d="m 0 {55+j*40} H {length}"></path>
							{#if j<24}
								<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="6"  d="m 0 {75+j*40} H {length}"></path>
							{/if}
						{/each}
						{#each entries?.entry as entry}
					 	 <g onclick={() => {updateEntry(entry)}}>
				  		  {#if view.isIRC}
									<rect class={getIRCColor(entry.value)} x={0+getModeIndex(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} 
											rx="6"></rect>
								{:else}
									<rect class={getDayTimerColor(entry.needActivate)} x={0+getModeIndex(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} 
											rx="6"></rect>
								{/if}
								<text class={getTextColor()} x={5+getModeIndex(entry.mode)*156} y={70+getTime(entry.from)*40} font-size="14">{showTime(entry)}</text>
								{#if view.isIRC}
				 					<text class={getTextColor()} x={5+getModeIndex(entry.mode)*156} y={90+getTime(entry.from)*40} font-size="14">{getTemperature(entry)}</text>
								{/if}
							</g>
						{/each}
					</svg>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>

<LbCalendarEntryModal bind:view={calendarEntryView} {entries} {selectedEntry} {dayModes} {temperatureList}/>