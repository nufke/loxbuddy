<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView, AlarmClockEntries, AlarmClockEntry } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { X } from '@lucide/svelte';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import LbInPlaceEdit from '$lib/helpers/in-place-ediit.svelte';
	import LbTimePickerModal from '$lib/components/lb-time-picker-modal.svelte';
	import LbDayPickerModal from '$lib/components/lb-day-picker-modal.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let isEnabled = $derived(store.getState(control.states.isEnabled));
	let entryList = $derived(store.getState(control.states.entryList) as AlarmClockEntries);
	let entryListIds = $derived(entryList ? Object.keys(entryList) : []);
	let entryListArray = $derived(entryList ? Object.values(entryList) : []);

	let alarms = $derived(entryList ? Object.values(entryList).filter( entry => entry.isActive) : []); //Utils.dec2hours(entry.alarmTime)

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	function updateEntry(i: number) {
		let cmd = 'entryList/put/' + entryListIds[i] + '/' +
		    entryListArray[i].name  + '/' + entryListArray[i].alarmTime + '/' + 
				(entryListArray[i].isActive ? '1' : '0') + '/' + 	entryListArray[i].modes.map(s => s.toString());
		//console.log('cmd', cmd);
		publishTopic(control.uuidAction, cmd);
	}

	function updateName(i: number, e: any) {
		entryListArray[i].name = e.value;
		updateEntry(i);
	}

	function updateAlarmTime(i: number, e: any) {
		entryListArray[i].alarmTime = e.value;
		updateEntry(i);
	}

	function updateIsActive(i: number, e: any) {
		entryListArray[i].isActive = e.checked;
		updateEntry(i);
	}

	function updateModes(i: number, e: any) {
		entryListArray[i].modes = e.value;
		updateEntry(i);
	}

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		iconColor: alarms.length ? 'fill-primary-500' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: alarms.length ? 'Active' : $_('No alarm time active'),
		statusColor: alarms.length ? 'text-primary-500' : 'text-surface-500',
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>

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
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute top-0 right-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
				<X />
			</button>
		</div>
	</header>
	<div class="">
			{#each entryListArray as entry, i}
			<div class="container mt-2 p-4 dark:bg-surface-950 bg-surface-50 rounded-lg" > <!-- onclick={(e) => {openSlider(i)}}-->
				<div class="flex w-full m-auto h-[30] justify-between">
					<div>
						<h1 class="text-lg truncate">
							<LbInPlaceEdit value={entryListArray[i].name} onValueChange={(e:any)=>{ updateName(i, e)}}/>
						</h1>
						<h1 class="text-3xl {entryListArray[i].isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
							<LbTimePickerModal alarmTime={entry.alarmTime} onValueChange={(e:any)=>{ updateAlarmTime(i, e)}}/>
						</h1>
					</div>
					<div onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
						<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-primary-500" checked={entryListArray[i].isActive} onCheckedChange={(e) => {updateIsActive(i, e)}} />
					</div>
				</div>
				<div>
					<LbDayPickerModal modes={entry.modes} isActive={entryListArray[i].isActive} onValueChange={(e:any)=>{updateModes(i, e)}}/>
				</div>
			</div>
			{/each}
	</div>
	{/snippet}
</Modal>

</div>