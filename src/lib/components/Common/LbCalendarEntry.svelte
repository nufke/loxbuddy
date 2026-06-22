<script lang="ts">
	import { utils } from '$lib/helpers/Utils';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbDateTimePicker from '$lib/components/Common/LbDateTimePicker.svelte';
	import LbDayModePicker from '$lib/components/Common/LbDayModePicker.svelte';
	import type { Entry } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { slide } from 'svelte/transition'
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { open = $bindable(false), title = '', isIRC = false, isCooling = false, enableDelete = true,
		control, subControl, entries, selectedEntry, dayModes, temperatureList = [] } = $props();

	let isAnalog = $derived(Boolean(control.details?.analog));
	let isStartTime = $state(false);
	let dateTime = $state();
	let dateTimeOpen = $state(false);
	let dateTimeTitle = $state($_('Time'));
	let dayModeOpen = $state(false);
	let itemDeleteOpen = $state(false);
	let itemDeleteTitle = $state('');
	let itemDeleteOnOk = $state<() => void>(() => {});
	let temperatureOpen = $state(false);

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

	function getDayModes(): string {
		return Array.from(modes, (x) => controlStore.operatingModes.get(x)).join(', ');
	}

	function getTemperature(): string {
		let entry = temperatureList.find((item) => item.id == value);
		return entry ? (entry.name + ' (' + entry.value + '°)') : '';
	}

	function updateTime(e: any): void {
		let timeStr = utils.epoch2TimeStr(e.value.valueOf()/1000);
		if (isStartTime) {
			startTime= timeStr;
		} else {
			endTime = timeStr == '00:00' ? '24:00' : timeStr;
		}
	}

	function updateDayModes(e: any): void {
		modes = e.modes;
		otherEntries = [...updatedEntries];
	}

	function openTemperatureView(): void {
		temperatureOpen = true;
	}

	function openDeleteView(): void {
		itemDeleteTitle = (modes.length > 1) ? ($_('Delete all entries') + '?') : ($_('Delete entry') + '?');
		itemDeleteOnOk = () => { deleteEntries(); };
		itemDeleteOpen = true;
	}

	function openTimeCheckView(): void {
		itemDeleteTitle = $_('End time should be later than start time');
		itemDeleteOnOk = () => {};
		itemDeleteOpen = true;
	}

	function setStartTime(): void {
		dateTime = utils.hours2date(startTime);
		isStartTime = true;
		dateTimeTitle = $_("Start time");
		dateTimeOpen = true;
	}

	function setEndTime(): void {
		dateTime = utils.hours2date(endTime);
		isStartTime = false;
		dateTimeTitle = $_("End time");
		dateTimeOpen = true;
	}

	function deleteEntries(): void {
		updatedEntries = [...otherEntries];
		publishEntries();
	}

	function publishEntries(): void {
		let cmd = (isCooling ? 'setc/' : 'set/') + updatedEntries.length;
		updatedEntries.forEach( (entry: Entry) => { cmd += '/' + entry.mode + ';' +
			utils.hours2min(entry.from) + ';' +
			utils.hours2min(entry.to) + ';' +
			entry.needActivate + ';' + entry.value
		});

		let uuid = isIRC ? subControl : control; // for IRC we need to use the subControl
		controlStore.setControl(uuid, cmd); // TODO VisuPw?
		close();
	}

	function close(): void {
		open = false;
	}

	function updateEntries(): void {
		if (!timeValid) {
			openTimeCheckView();
			return;
		}
		let changedEntries: Entry[] = [];
		const from = isFullDay ? '00:00' : startTime;
		const to = isFullDay ? '24:00' : endTime;
		const needsActivation = needActivate ? '1' : '0';
		const valueOfEntry = ((isAnalog || isIRC) ? value : '0'); // TODO set analog value, always 0 for digital daytimers
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

	function mergeEntries(entries: Entry[] ): Entry[] {
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
		mergedEntries.forEach((m) => m.latest = false);  // reset priority flag
		return mergedEntries;
	}
</script>

<LbDialog {open} onClose={close} {title} zIndex="z-30">
	{#snippet description()}
		<div class="flex flex-col items-center justify-center">
			<div class="space-y-2 w-full">
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); dayModeOpen = true; }}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Day / mode")}</h1>
						<p class="text-right text-xs max-w-55 text-wrap truncate line-clamp-2">{getDayModes()}</p>
					</div>
				</button>
				{#if isIRC}
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); openTemperatureView();}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Temperature")}</h1>
						<p class="text-right text-base max-w-55 text-wrap truncate line-clamp-2">{getTemperature()}</p>
					</div>
				</button>
				{/if}
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
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
					<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={setStartTime}>
						<div class="flex w-full items-center justify-between">
							<h1 class="truncate text-lg">{$_("Start time")}</h1>
							<h1 class="truncate text-lg {timeValid ? 'text-surface-50' : 'text-error-500'}">{utils.hours2hours(startTime)}</h1>
						</div>
					</button>
					<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={setEndTime}>
						<div class="flex w-full items-center justify-between">
							<h1 class="truncate text-lg">{$_("End time")}</h1>
							<h1 class="truncate text-lg {timeValid ? 'text-surface-50' : 'text-error-500'}">{utils.hours2hours(endTime,true)}</h1>
						</div>
					</button>
				</div>
				{/if}
				{#if !isIRC}
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
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
				<div class="flex grid {enableDelete ? 'grid-cols-5' : 'grid-cols-4'} gap-2 mt-2">
					{#if enableDelete}
					<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
									onclick={openDeleteView}>
						<div class="w-[20px] items-center justify-center text-red-500 flex w-full">
							<LbIcon name="trash-2"/>
						</div>
					</button>
					{/if}
					<button class="w-full col-span-2 btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
									onclick={close}>
						<p class="truncate text-lg">{$_("Cancel")}</p>
					</button>
					<button class="w-full col-span-2 btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
									onclick={updateEntries}>
						<p class="truncate text-lg">{$_("OK")}</p>
					</button>
				</div>
			</div>
		</div>
	{/snippet}
</LbDialog>

<LbDayModePicker bind:open={dayModeOpen} title={$_('Select days')} {modes} {dayModes} onValueChange={(e:any) => updateDayModes(e)}/>

<LbDateTimePicker date={dateTime} bind:open={dateTimeOpen} title={dateTimeTitle} onValueChange={(e:any) => updateTime(e)}/>

<LbDialog open={itemDeleteOpen} onClose={() => itemDeleteOpen = false}
	title={itemDeleteTitle} zIndex="z-40">
	{#snippet description()}
		<div class="w-full mt-4 grid grid-cols-2 gap-2">
			<button type="button"
					class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
					onclick={() => itemDeleteOpen = false}>
				<p class="truncate text-lg">{$_('Cancel')}</p>
			</button>
			<button type="button"
					class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
					onclick={() => { itemDeleteOnOk(); itemDeleteOpen = false; }}>
				<p class="truncate text-lg">{$_('OK')}</p>
			</button>
		</div>
	{/snippet}
</LbDialog>

<LbDialog open={temperatureOpen} onClose={() => temperatureOpen = false}
	title={$_('Select temperature')} zIndex="z-40">
	{#snippet description()}
		<div class="w-full mt-4 mb-2 grid gap-2">
			{#each temperatureList.slice(1) as temp}
				<button type="button"
						class="w-full h-[48px] btn btn-lg {temp.id == Number(value) ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={() => { value = temp.id; temperatureOpen = false; }}>
					<span class="text-lg">{temp.name} ({temp.value}°)</span>
				</button>
			{/each}
		</div>
	{/snippet}
</LbDialog>
