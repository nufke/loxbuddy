<script lang="ts">
	import { tick } from 'svelte';
	import type { Control, ControlOptions, ControlView, ModalView, AlarmClockEntries, AlarmClockEntry } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { X, Trash2 } from '@lucide/svelte';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import LbInPlaceEdit from '$lib/helpers/in-place-ediit.svelte';
	import LbDateTimePickerModal from '$lib/components/lb-date-time-picker-modal.svelte';
	import LbAlarmClockDayPickerModal from '$lib/components/lb-alarm-clock-day-picker-modal.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { utils } from '$lib/helpers/utils';
	import Info from '$lib/components/lb-info.svelte';
	import { innerHeight } from 'svelte/reactivity/window';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let entryList = $derived(store.getState(control.states.entryList) as AlarmClockEntries);
	let entryListIds = $derived(entryList ? Object.keys(entryList).map(n => Number(n)) : []);
	let entryListArray = $derived(entryList ? Object.values(entryList) : []);
	let prevEntryListLength: number = $state(0);
	let alarms = $derived(entryList ? Object.values(entryList).filter( entry => entry.isActive) : []);
	let nextEntryTime = $derived(Number(store.getState(control.states.nextEntryTime)));
	let selectedEntry = $state(0);

	let viewport: any = $state(); // TODO make HTMLDivElement
	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(false); 

	let dateTimeView = $state({
		isDateView: false,
		isMinuteView: false,
		label: $_('Wake-up time'),
		openModal: false
	});

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: alarms.length ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: alarms.length ? getAlarmTime() : $_('No alarm time active'),
		statusColor: alarms.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		modal: modal
	});

	function newId() {
		let max = entryListIds.length ? Math.max(...entryListIds) : 0;
		for( let i = 0; i <= max; i++) {
			if (!entryListIds.includes(i)) return i;
		}
		return max + 1; // new ID
	}

	function publishEntry(entry: AlarmClockEntry, i: number = -1) {
		let id = (i == -1) ? newId() : entryListIds[i]; /* -1 is new entry */
		let n = (i == -1) ? id : ''; /* extend name for new entries */
		let setting = entry.nightLight ? (entry.daily ? '1' : '0') : entry.modes.map(s => s.toString());
		let cmd = 'entryList/put/' + String(id) + '/' +
		    entry.name + n + '/' + entry.alarmTime + '/' + 
				(entry.isActive ? '1' : '0') + '/' + setting;
		//console.log('cmd', cmd, id, entryListIds);
		publishTopic(control.uuidAction, cmd);
	}

	function updateName(i: number, e: any) {
		entryListArray[i].name = e.value;
		publishEntry(entryListArray[i], i);
	}

	function updateAlarmTime(e: any) {
		let time = utils.hours2sec(utils.epoch2TimeStr(e.value.valueOf()/1000));
		entryListArray[selectedEntry].alarmTime = time;
		publishEntry(entryListArray[selectedEntry], selectedEntry);
	}

	function updateIsActive(i: number, e: any) {
		entryListArray[i].isActive = e.checked;
		publishEntry(entryListArray[i], i);
	}

	function updateSettings(i: number, e: any) {
		if (entryListArray[i].nightLight) {
			entryListArray[i].daily = e.value;
		} else {
			entryListArray[i].modes = e.value;
		}
		publishEntry(entryListArray[i], i);
	}

	function addEntry() {
		if (entryListIds.length > 15) return; // limit to 16 entries
		let day = format(new Date(), 'eeee');
		let opModes = store.structure.operatingModes;
		let idx = Object.keys(opModes).find( (key) => opModes[key].toLowerCase() == day);
		let entry: AlarmClockEntry = {
			name: $_('Alarm clock'),
			alarmTime: utils.hours2sec(format(new Date(), 'p')),
			isActive: true,
			modes: [Number(idx)], 
			nightLight: false,
			daily: false
		};
		publishEntry(entry, -1); /* new entry */
	}

	function deleteEntry(i: number) {
		let cmd = 'entryList/delete/' + entryListIds[i];
		publishTopic(control.uuidAction, cmd);
	}

	function getAlarmTime() {
		const loxTimeRef = 1230764400000;
		let date = new Date(nextEntryTime * 1000 + loxTimeRef);
		date = utils.isDST(date) ? new Date(nextEntryTime * 1000 + loxTimeRef - 3600000) : date;
		return format(date, 'PPP p');
	}

	function getTimerDate() {
		return entryListArray && entryListArray[selectedEntry] ? 
			utils.decTime2date(entryListArray[selectedEntry].alarmTime) : null;
	}

	$effect( () => {
		if (entryListArray) { /* to trigger the scroll, we need to be sensitive to the entryList */
			tick().then( () => {
				if ( viewport && prevEntryListLength != entryListIds.length ) {
					viewport.scroll({ top: viewport.scrollHeight, behavior: 'smooth' });
					tick().then( () => {
						limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 10) < 0;
					});
					prevEntryListLength = entryListIds.length;
				}
			});
		}
  });

	$effect( () => {
		if (windowHeight && modalViewport) { /* trigger on windowHeight change */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 10) < 0;
			});
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={()=>controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[380px] { limitHeight ? 'h-full': '' }"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
		<Info control={controlView.control}/>
		<header class="relative" >
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
					<X />
				</button>
			</div>
		</header>
		<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
		<div bind:this={viewport} class="container mt-2 overflow-y-auto w-full">
			{#each entryListArray as entry, i}
				<div class="mt-2 p-4 dark:bg-surface-950 bg-surface-50 rounded-lg">
					<div class="flex w-full m-auto h-[72px] justify-between">
						<div>
							<h1 class="text-lg truncate">
								<LbInPlaceEdit value={entry.name} onValueChange={(e:any)=>{ updateName(i, e)}}/>
							</h1>
							<button class="text-3xl {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}"
										onclick={() => {selectedEntry = i; dateTimeView.openModal=true;}}>
								<h1>{utils.dec2hours(entryListArray[i].alarmTime)}</h1>
						</button>
						</div>
						<div onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
							<Switch controlClasses="w-12 h-8" name="slide" controlActive="dark:bg-primary-500 bg-primary-700" controlInactive="preset-filled-surface-300-700" thumbInactive="bg-white" checked={entry.isActive} onCheckedChange={(e) => {updateIsActive(i, e)}} />
						</div>
					</div>
					<div class="flex w-full m-auto justify-between">
						<LbAlarmClockDayPickerModal {entry} label={$_("Alarm")} onValueChange={(e:any)=>{updateSettings(i, e)}}/>
						{#if i > 0}
						<button type="button" class="dark:text-surface-300 text-surface-700" aria-label="delete" onclick={() =>deleteEntry(i)}>
							<Trash2/>
						</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<footer class="mt-2 container w-full">
			<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50
				 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
					onclick={addEntry}>
				<span class="text-lg {entryListIds.length > 15 ? 'dark:text-surface-800 text-surface-200' : ''}">{$_("Add new alarm time")}</span>
			</button>
		</footer>
		</div>
		{/snippet}
	</Modal>

	<LbDateTimePickerModal date={getTimerDate()} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateAlarmTime(e)}}/>
</div>
