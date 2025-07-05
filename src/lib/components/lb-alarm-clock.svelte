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
	import LbTimePickerModal from '$lib/components/lb-time-picker-modal.svelte';
	import LbDayPickerModal from '$lib/components/lb-day-picker-modal.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { Utils } from '$lib/helpers/utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let viewport: any;
	let entryList = $derived(store.getState(control.states.entryList) as AlarmClockEntries);
	let entryListIds = $derived(entryList ? Object.keys(entryList).map(n => Number(n)) : []);
	let entryListArray = $derived(entryList ? Object.values(entryList) : []);
	let prevEntryListLength: number = $state(0);
	let alarms = $derived(entryList ? Object.values(entryList).filter( entry => entry.isActive) : []);
	let nextEntryTime = $derived(Number(store.getState(control.states.nextEntryTime)));

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		iconColor: alarms.length ? 'fill-primary-500' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: alarms.length ? getAlarmTime() : $_('No alarm time active'),
		statusColor: alarms.length ? 'text-primary-500' : 'text-surface-500',
		modal: modal
	});

	function newId() {
		let max = Math.max(...entryListIds);
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

	function updateAlarmTime(i: number, e: any) {
		entryListArray[i].alarmTime = e.value;
		publishEntry(entryListArray[i], i);
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
			alarmTime: Utils.hours2sec(format(new Date(), 'p')),
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
		date = Utils.isDST(date) ? new Date(nextEntryTime * 1000 + loxTimeRef - 3600000) : date;
		return format(date, 'PPP p');
	}

	$effect( () => {
		if (entryListArray) { /* to trigger the scroll, we need to be sensitive to the entryList */
			tick().then( () => {
				if ( viewport && prevEntryListLength != entryListIds.length ) {
   				viewport.scroll({ top: viewport.scrollHeight, behavior: 'smooth' });
					prevEntryListLength = entryListIds.length;
				}
			});
		}
  });
</script>

<div>
	<LbControl bind:controlView />
	<LbWidget bind:controlView />
	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={()=>controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
		backdropClasses="backdrop-blur-sm">
		{#snippet content()}
		<header class="relative" >
			<div class="flex justify-center">
				<h2 class="h4 text-center">{controlView.textName}</h2>
			</div>
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
					<X />
				</button>
			</div>
		</header>
		<div bind:this={viewport} class="max-h-[405px] overflow-auto">
			{#each entryListArray as entry, i}
				<div class="mt-2 p-4 dark:bg-surface-950 bg-surface-50 rounded-lg">
					<div class="flex w-full m-auto h-[72px] justify-between">
						<div>
							<h1 class="text-lg truncate">
								<LbInPlaceEdit value={entry.name} onValueChange={(e:any)=>{ updateName(i, e)}}/>
							</h1>
							<h1 class="text-3xl {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
								<LbTimePickerModal alarmTime={entry.alarmTime} onValueChange={(e:any)=>{ updateAlarmTime(i, e)}}/>
							</h1>
						</div>
						<div onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
							<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-primary-500" checked={entry.isActive} onCheckedChange={(e) => {updateIsActive(i, e)}} />
						</div>
					</div>
					<div class="flex w-full m-auto justify-between">
						<LbDayPickerModal {entry} onValueChange={(e:any)=>{updateSettings(i, e)}}/>
						{#if i > 0}
						<button type="button" class="text-surface-500" aria-label="delete" onclick={() =>deleteEntry(i)}>
							<Trash2/>
						</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		<footer class="">
			<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50
				 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
					onclick={addEntry}>
				<span class="text-lg {entryListIds.length > 15 ? 'dark:text-surface-800 text-surface-200' : ''}">{$_("Add new alarm time")}</span>
			</button>
		</footer>
		{/snippet}
	</Modal>
</div>
