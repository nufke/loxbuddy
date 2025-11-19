<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { utils } from '$lib/helpers/Utils';
	import { XIcon, Trash2Icon } from '@lucide/svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import LbDateTimePickerDialog from '$lib/components/Common/LbDateTimePickerDialog.svelte';
	import LbDayModePickerDialog from '$lib/components/Common/LbDayModePickerDialog.svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';
	import type { Entry, Button, GeneralView } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { slide } from 'svelte/transition'
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import { store } from '$lib/stores/Store.svelte';

	let { view = $bindable(), entries, selectedEntry, dayModes, temperatureList = [] } = $props();

	let isAnalog = Boolean(view.control.details.analog);
	let opModes = $derived(store.structure.operatingModes);
	let isStartTime = $state(false);
	let dateTime = $state();
	let updatedEntries = $derived(entries.entry) as Entry[];
	let startTime = $derived(selectedEntry?.from); // TODO fix notation
	let endTime = $derived(selectedEntry?.to == '0:00' || selectedEntry?.to == '00:00' ? '24:00' : selectedEntry?.to );
	let value = $derived(selectedEntry?.value)
	let isFullDay = $derived((startTime == '0:00' || startTime == '00:00') && endTime == '24:00'); // TODO startTime notation
	let needActivate = $derived(Number(selectedEntry?.needActivate) == 1);
	let sameEntries = $derived( updatedEntries && selectedEntry ? 
			entries.entry.filter( (entry: Entry) => entry.from == selectedEntry.from &&
																							entry.to == selectedEntry.to &&
																							entry.needActivate == selectedEntry.needActivate &&
																							entry.value == selectedEntry.value) : []) as Entry[];
	let otherEntries = $derived( entries.entry.filter( (entry: Entry) => !sameEntries.includes(entry))) as Entry[];
	let modes = $derived(sameEntries.length ? sameEntries.map( (m: Entry) => m.mode) : [selectedEntry?.mode]) as string[];
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
		openDialog: false
	});

	let dayModeView = $state({
		label: $_('Select days'),
		openDialog: false
	});

	let itemDeleteView = $state({
		label: '',
		openDialog: false,
		cancel: () => {},
		ok: () => {}
	});

	let temperatureView: GeneralView = $state({
		label: $_('Select temperature'),
		openDialog: false,
		buttons: [],
		cancel: () => {},
		ok: () => {}
	});

	function openTemperatureView() {
		let buttons: Button[] = [];
		for (let i = 1; i < temperatureList.length; i++) { // we skip i=0, eco mode
			buttons.push({
				id: temperatureList[i].id,
				name: temperatureList[i].name + ' (' + temperatureList[i].value + '°)',
				selected: temperatureList[i].id == Number(value)
			});
		}
		temperatureView.cancel = () => {};
		temperatureView.ok = (e: any) => {value = e};
		temperatureView.buttons = buttons;
		temperatureView.openDialog = true;
	}

	function openDeleteView() {
		itemDeleteView.label = (modes.length > 1) ? ($_('Delete all entries') + '?') : ($_('Delete entry') + '?');
		itemDeleteView.ok = () => {deleteEntries()};
		itemDeleteView.openDialog = true;
	}

	function openTimeCheckView() {
		itemDeleteView.label = $_('End time should be later than start time');
		itemDeleteView.cancel = () => {itemDeleteView.openDialog = false};
		itemDeleteView.ok = () => {itemDeleteView.openDialog = false};
		itemDeleteView.openDialog = true;
	}

	function setStartTime() {
		dateTime = utils.hours2date(startTime);
		isStartTime = true;
		dateTimeView.label = $_("Start time");
		dateTimeView.openDialog = true;
	}

	function setEndTime() {
		dateTime = utils.hours2date(endTime);
		isStartTime = false;
		dateTimeView.label = $_("End time");
		dateTimeView.openDialog = true;
	}

	function deleteEntries() {
		updatedEntries = [...otherEntries];
		publishEntries();
	}

	function publishEntries() {
		let cmd = (view.isCooling ? 'setc/' : 'set/') + updatedEntries.length;
		updatedEntries.forEach( (entry: Entry) => { cmd += '/' + entry.mode + ';' +
			utils.hours2min(entry.from) + ';' + 
			utils.hours2min(entry.to) + ';' +
			entry.needActivate + ';' + entry.value
		});

		let control = view.isIRC ? view.subControl.uuidAction : view.control.uuidAction; // for IRC we need to use the subControl
		loxWsClient.control(control, cmd);
		close();
	}

	function close() {
		view.openDialog = false;
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
		const valueOfEntry = ((isAnalog || view.isIRC) ? value : '0'); // TODO set analog value, always 0 for digital daytimers
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

{#if view.openDialog}
<Dialog
	open={view.openDialog}
	onInteractOutside={close}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-30 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-30 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]">
				<!--<Info control={controlView.control}/>-->
				<header class="grid grid-cols-[5%_90%_5%]">
					<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
							<XIcon class="size-4"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="flex flex-col items-center justify-center">
						<div class="mt-4 space-y-2 w-full">
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { e.stopPropagation(); dayModeView.openDialog=true;}}>
								<div class="flex w-full items-center justify-between">
									<h1 class="truncate text-lg">{$_("Day / mode")}</h1>
									<p class="text-right text-xs max-w-55 text-wrap truncate line-clamp-2">{getDayModes()}</p>
								</div>
							</button>
							{#if view.isIRC}
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { e.stopPropagation(); openTemperatureView();}}>
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
									<Switch checked={isFullDay} onCheckedChange={(e) => isFullDay = e.checked}>
										<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
											<Switch.Thumb />
										</Switch.Control>
										<Switch.HiddenInput />
									</Switch>
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
									<Switch checked={needActivate} onCheckedChange={(e) => needActivate = e.checked}>
										<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
											<Switch.Thumb />
										</Switch.Control>
										<Switch.HiddenInput />
									</Switch>
								</div>
							</button>
							{/if}
							<div class="flex grid {view.enableDelete ? 'grid-cols-5' : 'grid-cols-4'} gap-2 mt-2">
							{#if view.enableDelete}
								<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
												onclick={openDeleteView}>
									<div class="w-[20px] items-center justify-center text-red-500 flex w-full">
										<Trash2Icon/>
									</div>
								</button>
								{/if}
								<button class="w-full col-span-2 btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
												onclick={close}>
									<p class="truncate text-lg">{$_("Cancel")}</p>
								</button>
								<button class="w-full col-span-2 btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
												onclick={updateEntries}>
									<p class="truncate text-lg">{$_("OK")}</p>
								</button>
							</div>
						</div>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
{/if}

<LbDayModePickerDialog bind:view={dayModeView} {modes} {dayModes} onValueChange={(e:any)=>{ updateDayModes(e)}}/>
<LbDateTimePickerDialog date={dateTime} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTime(e)}}/>
<LbGeneralDialog bind:view={itemDeleteView}/>
<LbGeneralDialog bind:view={temperatureView}/>
