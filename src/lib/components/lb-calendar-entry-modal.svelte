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

	let { view = $bindable(), entries, selectedEntry, dayModes } = $props();

	let isAnalog = Boolean(view.control.details.analog);

	let isStartTime = $state(false);
	let dateTime = $state();
	let updatedEntries = $derived(entries.entry) as Entry[];
	let startTime = $derived(selectedEntry.from);
	let endTime = $derived(selectedEntry.to);
	let isFullDay = $derived(selectedEntry.from == '00:00' && selectedEntry.to =='00:00');
	let needActivate = $derived(Number(selectedEntry.needActivate) == 1);
	let sameEntries = $derived(entries && selectedEntry ? 
			entries.entry.filter( (entry: Entry) => entry.from == selectedEntry.from &&
																							entry.to == selectedEntry.to &&
																							entry.needActivate == selectedEntry.needActivate &&
																							entry.value == selectedEntry.value) : []) as Entry[];
	let remainingEntries = $derived( entries.entry.filter( (entry: Entry) => !sameEntries.includes(entry))) as Entry[];
	let modes = $derived(sameEntries.length ? sameEntries.map( (m: Entry) => m.mode) : [selectedEntry.mode]) as string[];

	function getDayModes() {
		return Array.from(modes, (x) => dayModes[x]).join(', ');
	}

	function updateTime(e: any) {
		let timeStr = utils.epoch2TimeStr(e.value.valueOf()/1000);
		if (isStartTime) {
			startTime= timeStr;
		} else {
			endTime = timeStr;
		}
	}

	function updateDayModes(e: any) {
		modes = e.modes;
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

	let deleteView = $state({
		label: $_('Delete entry') + '?',
		openModal: false,
		cancel: () => {},
		ok: () => {deleteEntries()},
	});

	function openDeleteView() {
		if (modes.length > 1) {
			deleteView.label = $_('Delete all entries') + '?';
		}
		deleteView.openModal = true;
	}

	function setStartTime() {
		dateTime = utils.hours2date(startTime);
		isStartTime = true;
		dateTimeView.label=$_("Start time");
		dateTimeView.openModal=true;
	}

	function setEndTime() {
		dateTime = utils.hours2date(endTime);
		isStartTime = false;
		dateTimeView.label=$_("End time");
		dateTimeView.openModal=true;
	}

	function deleteEntries() {
		updatedEntries = [...remainingEntries];
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
		let changedEntries: Entry[] = [];
		let endTimeCorr = endTime == '00:00' ? '24:00' : endTime;
		const from = isFullDay ? '00:00' : startTime;
		const to = isFullDay ? '24:00' : endTimeCorr;
		const needsActivation = needActivate ? '1' : '0';
		const valueOfEntry = (isAnalog ? '1' : '0'); // TODO set analog value, always 0 for digital daytimers
		modes.forEach( (mode) => {
			changedEntries.push({ 
				mode: mode, 
				from: from,
				to: to,
				needActivate: needsActivation,
				value: valueOfEntry
			});
		});
		updatedEntries = [...remainingEntries, ...changedEntries]; // todo remove duplicated/overlapping entries
		publishEntries();
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
			<h2 class="h4 text-center items-center justify-center w-[80%]">Schakeltijden instellen</h2>
			<div class="mt-4 space-y-2 w-full">
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); dayModeView.openModal=true;}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Dag / mode")}</h1>
						<p class="text-right text-xs max-w-55 text-wrap truncate line-clamp-2">{getDayModes()}</p>
					</div>
				</button>
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
							<h1 class="truncate text-lg">{startTime}</h1>
						</div>
					</button>
					<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={setEndTime}>
						<div class="flex w-full items-center justify-between">
							<h1 class="truncate text-lg">{$_("End time")}</h1>
							<h1 class="truncate text-lg">{endTime}</h1>
						</div>
					</button>
				</div>
				{/if}
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation()}}>
					<div class="flex w-full items-center justify-between">
						<h1 class="truncate text-lg">{$_("Activation required")}</h1>
						<Switch controlClasses="w-12 h-8" name="slide" controlActive="dark:bg-primary-500 bg-primary-700" 
										controlInactive="preset-filled-surface-300-700" thumbInactive="bg-white" checked={needActivate} onCheckedChange={(e) => needActivate = e.checked} />
					</div>
				</button>
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
<LbGeneralModal bind:view={deleteView}/>