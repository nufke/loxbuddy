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

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let isEnabled = $derived(store.getState(control.states.isEnabled));
	let entryMap = $derived(store.getState(control.states.entryList) as AlarmClockEntries);
	let entryList = $derived(entryMap ? Object.values(entryMap) : []);
	let textModal = $state(false);
	let alarms = $derived(entryMap ? Object.values(entryMap).filter( entry => entry.isActive) : []); //Utils.dec2hours(entry.alarmTime)
	let days = $_('Days').split('|');

	let selectedEntryIndex = $state(0);

	let newEntryList: AlarmClockEntry[] = $state([]);

	function getWeekDay(i: number) {
		return (i>9 || i<3) ? '' : ((i==9) ? days[0] : days[i-2]); // TODO check with operatingmodes
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	function selectedEntry(idx: number) {
		selectedEntryIndex = idx;
	}

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: alarms.length ? 'first' : $_('No alarm time active'),
		statusColor: alarms.length ? 'text-primary-500' : 'text-surface-500',
		modal: modal
	});

	$effect( () => {newEntryList = entryList ? [...entryList] : []; })
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
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5 hover:border-white/10
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
			{#each entryList as entry, i}
			<div class="container mt-2 p-4 dark:bg-surface-950 bg-surface-50 rounded-lg" > <!-- onclick={(e) => {openSlider(i)}}-->
				<div class="flex w-full m-auto h-[30] justify-between">
					<div>
						<h1 class="text-lg truncate">
							<LbInPlaceEdit bind:value={newEntryList[i].name} />
						</h1>
						<h1 class="text-3xl {newEntryList[i].isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
							<LbTimePickerModal bind:alarmTime={entry.alarmTime} />
						</h1>
					</div>
					<div onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
						<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-primary-500" checked={newEntryList[i].isActive} onCheckedChange={(e) => (newEntryList[i].isActive = e.checked)} />
					</div>
				</div>
				<div class="flex flex-row gap-1">
				{#each entry.modes as mode}
				{#if getWeekDay(mode).length}
					<div class="text-sm {newEntryList[i].isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">{getWeekDay(mode)}</div>
				{/if}
				{/each}
				</div>
			</div>
			{/each}
	</div>
	{/snippet}
</Modal>

<Modal
	open={textModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{textModal=false}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-50-950 p-4 space-y-4 shadow-xl rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[300px]"
	backdropClasses="bg-transparent"
	backdropBackground="">
	{#snippet content()}
	<form class="mx-auto w-full max-w-md space-y-2" onsubmit={() => {textModal=false}}>
  	<input type="text" class="input" placeholder="Name of alarm" bind:value={newEntryList[selectedEntryIndex].name}/>
	</form>
	{/snippet}
</Modal>

</div>