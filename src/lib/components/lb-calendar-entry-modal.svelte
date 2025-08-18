<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { utils } from '$lib/helpers/utils';
	import { X, Trash2 } from '@lucide/svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import LbDateTimePickerModal from '$lib/components/lb-date-time-picker-modal.svelte';
	import LbDayModePickerModal from '$lib/components/lb-day-mode-picker-modal.svelte';
	import LbGeneralModal from '$lib/components/lb-general-modal.svelte';
	import type { Entry } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { slide } from 'svelte/transition'
	import { publishTopic } from '$lib/communication/mqttclient';
	import { store } from '$lib/stores/store.svelte';

	let { view = $bindable(), entries, selectedEntry, dayModes, temperatureList = [] } = $props();

	let isAnalog = Boolean(view.control.details.analog);
	let opModes = $derived(store.structure.operatingModes);
	let isStartTime = $state(false);
	let dateTime = $state();
	let updatedEntries = $derived(entries.entry) as Entry[];
	let startTime = $derived(selectedEntry.from); // TODO fix notation
	let endTime = $derived(selectedEntry.to);
	let value = $derived(selectedEntry.value)
	let isFullDay = $derived((startTime == '0:00' || startTime == '00:00') && endTime =='24:00'); // TODO startTime notation
	let needActivate = $derived(Number(selectedEntry.needActivate) == 1);
	let sameEntries = $derived( updatedEntries && selectedEntry ? 
			entries.entry.filter( (entry: Entry) => entry.from == selectedEntry.from &&
																							entry.to == selectedEntry.to &&
																							entry.needActivate == selectedEntry.needActivate &&
																							entry.value == selectedEntry.value) : []) as Entry[];
	let otherEntries = $derived( entries.entry.filter( (entry: Entry) => !sameEntries.includes(entry))) as Entry[];
	let modes = $derived(sameEntries.length ? sameEntries.map( (m: Entry) => m.mode) : [selectedEntry.mode]) as string[];
	let timeValid = $derived(utils.hours2min(startTime) < utils.hours2min(endTime));

	function getDayModes() {
		return Array.from(modes, (x) => opModes[x]).join(', ');
	}

	function getTemperature() {
		let entry = temperatureList.find( item => item.id == value);
		return entry ? (entry.name + ' (' + entry.value + '°)') : '';
	}

	function updateTime(e: any) {
		let timeStr = utils.epoch2TimeStr(e.value.valueOf()/1000);
		if (isStartTime) {
			startTime= timeStr;
		} else {
			endTime = timeStr == '00:00' ? '24:00' : timeStr;
		}
	}

	function updateDayModes(e: any) {
		modes = e.modes;
		otherEntries = [...updatedEntries];
	}

	let dateTimeView = $state({
		isDateView: false,
		isMinuteView: false,
		label: $_('Time'),
		openModal: false
	});

	let dayModeView = $state({
		label: $_('Select days'),
		openModal: false
	});

	let itemDeleteView = $state({
		label: '',
		openModal: false,
		cancel: () => {},
		ok: () => {}
	});

	let temperatureView = $state({
		label: $_('Select temperature'),
		openModal: false,
		buttons: [],
		cancel: () => {},
		ok: (e: any) => {}
	});

	/*
	let temperatureSelectViewButtons = $derived([
		{
			name: language['nl'],
			selected: true
		},
		{
			name: language['en'],
			selected: language[localeSettings] == language.en
		},
		{
			name: language['de'],
			selected: language[localeSettings] == language.de
		}
	]);
*/

	function openDeleteView() {
		itemDeleteView.label = (modes.length > 1) ? ($_('Delete all entries') + '?') : ($_('Delete entry') + '?');
		itemDeleteView.ok = () => {deleteEntries()};
		itemDeleteView.openModal = true;
	}

	function openTimeCheckView() {
		itemDeleteView.label = $_('End time should be later than start time');
		itemDeleteView.cancel = () => {itemDeleteView.openModal = false};
		itemDeleteView.ok = () => {itemDeleteView.openModal = false};
		itemDeleteView.openModal = true;
	}

	function setStartTime() {
		dateTime = utils.hours2date(startTime);
		isStartTime = true;
		dateTimeView.label = $_("Start time");
		dateTimeView.openModal = true;
	}

	function setEndTime() {
		dateTime = utils.hours2date(endTime);
		isStartTime = false;
		dateTimeView.label = $_("End time");
		dateTimeView.openModal = true;
	}

	function deleteEntries() {
		updatedEntries = [...otherEntries];
		publishEntries();
	}

	function publishEntries() {
		let cmd = 'set/' + updatedEntries.length;
		updatedEntries.forEach( (entry: Entry) => { cmd += '/' + entry.mode + ';' +
			utils.hours2min(entry.from) + ';' + 
			utils.hours2min(entry.to) + ';' +
			entry.needActivate + ';' + entry.value
		});
		//console.log('cmd', cmd);
		publishTopic(view.control.uuidAction, cmd);
		view.openModal = false;
	}

	function updateEntries() {
		if (!timeValid) {
			openTimeCheckView();
			return;
		}
		let changedEntries: Entry[] = [];
		const from = isFullDay ? '00:00' : startTime;
		const to = isFullDay ? '24:00' : endTime;
		const needsActivation = needActivate ? '1' : '0';
		const valueOfEntry = (isAnalog ? '1' : '0'); // TODO set analog value, always 0 for digital daytimers
		modes.forEach( (mode) => {
			changedEntries.push({ 
				mode: mode, 
				from: from,
				to: to,
				needActivate: needsActivation,
				value: valueOfEntry,
				latest: true
			});
		});
		let entries = [...otherEntries, ...changedEntries];
		let modi = entries.map( (m: Entry) => Number(m.mode)).sort();
		let filteredModes = modi.filter((mode, idx) => modi.indexOf(mode) == idx); // remove duplicates
		updatedEntries = [];
		filteredModes.forEach( mode => {
			let mergedEntries = mergeEntries( entries.filter(e => e.mode == String(mode)));
			updatedEntries = [...updatedEntries, ...mergedEntries];
		});
		publishEntries();
	}

	function mergeEntries(entries: Entry[] ) {
		entries.sort((a, b) => utils.hours2min(a.from) - utils.hours2min(b.from));
		const mergedEntries = [];
		let currentEntry = entries[0];
		for (let i = 1; i < entries.length; i++) {
			const nextEntry = entries[i];
			if (utils.hours2min(currentEntry.to) >= utils.hours2min(nextEntry.from)) {
				// overlap, check if other properties are not conflicting
				if (currentEntry.needActivate == nextEntry.needActivate &&
					currentEntry.value == nextEntry.value) { // same properties, merge possible
				 	currentEntry.to = (utils.hours2min(currentEntry.to) >= utils.hours2min(nextEntry.to)) ? 
					currentEntry.to : nextEntry.to;
				} else { // not the same properties, so add new entry but update overlapping timeslot
					if (currentEntry.latest) { // latest has priority, so add it to the list
						if (utils.hours2min(currentEntry.to) < utils.hours2min(nextEntry.to)) { // no full overlap
							nextEntry.from = currentEntry.to;
							mergedEntries.push(currentEntry);
							currentEntry = nextEntry;
						} else { // full overlap with next entry, and priority, so override the next entry
							nextEntry.from = currentEntry.from;
							nextEntry.to = currentEntry.to;
							nextEntry.needActivate = currentEntry.needActivate;
							nextEntry.value = currentEntry.value;
							currentEntry = nextEntry;
						}
					} else { // overlap but no priority, so remove overlap based on next entry
						if (utils.hours2min(currentEntry.to) >= utils.hours2min(nextEntry.to)) { // full overlap
							currentEntry.from = nextEntry.to;
							mergedEntries.push(nextEntry); // add next entry
						} else {
							mergedEntries.push(currentEntry);
							currentEntry = nextEntry;
						}
					}
				}
			} else { // No overlap, add current entry
				mergedEntries.push(currentEntry);
				currentEntry = nextEntry;
			}
		}
		// Add the last entry
		mergedEntries.push(currentEntry);
		mergedEntries.forEach( m => m.latest = false);  // reset priority flag
		return mergedEntries;
	}
</script>

<Modal
	open={view.openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{view.openModal = false}}
	triggerBase=""
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75 backdrop-blur-xs" onclick={(e) => { view.openModal = false;}}></div> 
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {view.openModal = false;}}>
					<X />
				</button>
			</div>
		</header>
		<div class="flex flex-col items-center justify-center">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{view.label}</h2>
			<div class="mt-4 space-y-2 w-full">
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); dayModeView.openModal=true;}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Dag / mode")}</h1>
						<p class="text-right text-xs max-w-55 text-wrap truncate line-clamp-2">{getDayModes()}</p>
					</div>
				</button>
				{#if view.isIRC}
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); temperatureView.openModal=true;}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Temperature")}</h1>
						<p class="text-right text-base max-w-55 text-wrap truncate line-clamp-2">{getTemperature()}</p>
					</div>
				</button>
				{/if}
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation()}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("All day")}</h1>
						<Switch controlClasses="w-12 h-8" name="slide" controlActive="dark:bg-primary-500 bg-primary-700" 
										controlInactive="preset-filled-surface-300-700" thumbInactive="bg-white" checked={isFullDay} onCheckedChange={(e) => isFullDay = e.checked} />
					</div>
				</button>
				{#if !isFullDay}
				<div class="space-y-2" transition:slide="{{duration: 300}}">
					<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={setStartTime}>
						<div class="flex w-full items-center justify-between">
							<h1 class="truncate text-lg">{$_("Start time")}</h1>
							<h1 class="truncate text-lg {timeValid ? 'text-surface-50' : 'text-error-500'}">{utils.hours2hours(startTime)}</h1> <!-- 00:00 notation -->
						</div>
					</button>
					<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={setEndTime}>
						<div class="flex w-full items-center justify-between">
							<h1 class="truncate text-lg">{$_("End time")}</h1>
							<h1 class="truncate text-lg {timeValid ? 'text-surface-50' : 'text-error-500'}">{utils.hours2hours(endTime,true)}</h1> <!-- 00:00 notation -->
						</div>
					</button>
				</div>
				{/if}
				{#if !view.isIRC}
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation()}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Activation required")}</h1>
						<Switch controlClasses="w-12 h-8" name="slide" controlActive="dark:bg-primary-500 bg-primary-700" 
										controlInactive="preset-filled-surface-300-700" thumbInactive="bg-white" checked={needActivate} onCheckedChange={(e) => needActivate = e.checked} />
					</div>
				</button>
				{/if}
				<div class="flex grid {view.enableDelete ? 'grid-cols-5' : 'grid-cols-4'} gap-2 mt-2">
					{#if view.enableDelete}
					<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={openDeleteView}>
						<div class="w-[20px] items-center justify-center text-red-500 flex w-full">
								<Trash2/>
						</div>
					</button>
					{/if}
					<button class="w-full col-span-2 btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={() => {view.openModal = false}}>
						<p class="truncate text-lg">{$_("Cancel")}</p>
					</button>
					<button class="w-full col-span-2 btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={updateEntries}>
						<p class="truncate text-lg">{$_("OK")}</p>
					</button>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>
<LbDayModePickerModal bind:view={dayModeView} {modes} {dayModes} onValueChange={(e:any)=>{ updateDayModes(e)}}/>
<LbDateTimePickerModal date={dateTime} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTime(e)}}/>
<LbGeneralModal bind:view={itemDeleteView}/>