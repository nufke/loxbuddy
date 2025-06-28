<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { Toaster, createToaster } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import type { ControlView, ListItem } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';	
	import { X, Timer, Leaf, Flame, List, CalendarClock } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';
	import { fade200 } from '$lib/helpers/transition';
	import { publishTopic } from '$lib/communication/mqttclient';
	import LbCicleSlider from '$lib/components/lb-circle-slider.svelte';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbDatePicker from '$lib/components/lb-date-picker.svelte';
	import LbTimePicker from '$lib/components/lb-time-picker.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	const toaster = createToaster({duration: 1500});

	let temperatureModeList : ListItem[] = [
		{ id: 0, name: 'Automatic', visible: false },
		{ id: 1, name: 'Automatic (currently heating)', visible: false },
		{ id: 2, name: 'Automatic (currently cooling)', visible: false },
		{ id: 3, name: 'Automatic heating', visible: false },
		{ id: 4, name: 'Automatic cooling', visible: false },
		{ id: 5, name: 'Manual heating', visible: false },
		{ id: 6, name: 'Manual cooling', visible: false }
	];

	let selectedItem = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let selectedTab = $state(0);
	let tempActual = $derived(fmt.sprintf('%.1f', Number(store.getState(controlView.control?.states.tempActual))));
	let tempTarget = $derived(fmt.sprintf('%.1f', Number(store.getState(controlView.control?.states.tempTarget))));
	let override = $derived(Number(store.getState(controlView.control?.states.override)));
	let mode = $derived(Number(store.getState(controlView.control?.states.mode)));
	let date: SvelteDate = $state(new SvelteDate());
	let modeId = $derived(temperatureModeList[mode].id);
	let isAutomatic = $derived(modeId<5);
	let isHeating = $derived(modeId==1 || modeId==3 || modeId==5);
	let isCooling = $derived(modeId==2 || modeId==4 || modeId==6);
	let isEco = $derived(selectedItem==0);

	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false
	});

	function setTempPresent(i: number) {
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((date.getTime() - Date.now())/coeff)*coeff/1000;
    if (overrideTimeSec > 60 && controlView.control) {// TODO define minimum time of 1 minute
	    let cmd = 'starttimer/' + i + '/' + String(overrideTimeSec);
			publishTopic(controlView.control.uuidAction, cmd);
    } else {
			console.error('IRC: timer period to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function cancelOverride() {
		if (controlView.control) {
			publishTopic(controlView.control.uuidAction, 'stoptimer');
		}
	}

	function updatePosition(e: any) { // TODO
	}

	function resetTab() {
    setTimeout(() => {
      selectedTab = 0;
    }, 500);
	}
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							bg-surface-100-900 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>{ controlView.modal.action(false); resetTab();}}>
				<X/>
			</button>
		</div>
	</header>
	{#if selectedTab==0}
		<div class="items-center justify-center">
			<button class="w-full mt-2" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for slider -->
				<LbCicleSlider min={10} max={30} step={0.5} target={tempTarget} actual={tempActual} onValueChangeEnd={(e: any) => {updatePosition(e.value)}}/>
			</button>
			<div class="text-center">
				<div class="relative flex items-center justify-center ml-2">
					{#if isAutomatic}
						<LbIcon class="fill-surface-50 mr-2" name={"/icons/svg/automatic.svg"} width="24" height="24"/>
					{/if}
					{#if isCooling}
					<LbIcon class="fill-cyan-400 mr-2" name={"/icons/svg/mode_cool.svg"} width="24" height="24"/>
					{/if}
					{#if isHeating}
					<Flame class="text-red-500 fill-red-500 mr-2"/>
					{/if}
					{#if isEco}
					<Leaf class="text-green-500 mr-2"/>
					{/if}
					{#if override > 0}
					<Timer class="text-purple-500 mr-2"/>
					{/if}
				</div>
				{#if controlView.statusName}
				<p class="text-lg truncate mt-3 mb-2 {controlView.statusColor}">{$_(controlView.statusName)}</p>
				{/if}
				{#if override > 0}
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-xl rounded-lg border border-white/15 hover:border-white/50"
						onclick={cancelOverride}>Cancel override</button>
				{/if}
			</div>
		</div>
	{/if} 
	{#if selectedTab==1}
	<div class="flex flex-col items-center justify-center m-2">
		{#if dateTimeView.isDateView}
			<LbDatePicker bind:date={date} bind:view={dateTimeView}/>
		{:else}
			<LbTimePicker bind:date={date} bind:view={dateTimeView}/>
		{/if}
	</div>
	{/if}
	{#if selectedTab==2}
		<div class="flex flex-col items-center justify-center m-2">
			{#if controlView.statusName}
				<div class="mb-2 truncate">
					<p class="text-lg truncate {controlView.statusColor}">{$_(controlView.statusName)}</p>
				</div>
			{/if}
			<div class="container mt-2">
				{#if controlView.list}
					{#each controlView.list as listItem, index}
						<button type="button" class="w-full mt-2 btn btn-lg {(index==selectedItem) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
									 shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); setTempPresent(listItem.id)}}>
							<span class="text-lg">{$_(listItem.name)}</span>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
	<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
		<div class="grid h-full max-w-lg grid-cols-3 mx-auto">
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-primary-500' : ''} " onclick={() => selectedTab=0}>
				<LbIcon class={selectedTab==0 ? 'fill-primary-500' : 'fill-surface-50'} name={"/icons/svg/thermostat.svg"} width="24" height="24"/>
				<span class="mt-1 text-xs">{$_("Control")}</span>
			</button>
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-primary-500' : ''} " onclick={() => {dateTimeView.isDateView=true; selectedTab=1;}}>
				<CalendarClock/>
				<span class="mt-1 text-xs">{$_("Timer")}</span>
			</button>
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'text-primary-500' : ''} " onclick={() => selectedTab=2}>
				<List/>
				<span class="mt-1 text-xs">{$_("Preset")}</span>
			</button>
		</div>
	</div>
	{/snippet}
</Modal>

<Toaster {toaster}></Toaster>
