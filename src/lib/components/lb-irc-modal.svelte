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
	import LbTimePickerModal from '$lib/components/lb-time-picker-modal.svelte';
	import Info from '$lib/components/lb-info.svelte';
	import { utils } from '$lib/helpers/utils';
	import { format } from 'date-fns';

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

	/* this modal is used for V1 and V2, so we need to select the proper attributes */
	let isV1 = controlView.control.type !== 'IRoomControllerV2'; 

	let selectedItem = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let selectedTab = $state(0);
	let tempActual = $derived(fmt.sprintf('%.1f', Number(store.getState(controlView.control?.states.tempActual))));
	let tempTarget = $derived(fmt.sprintf('%.1f', Number(store.getState(controlView.control?.states.tempTarget))));
	let date: SvelteDate = $state(new SvelteDate(Date.now() + 3600000));

	let overrideV1 = $derived(Number(store.getState(controlView.control.states.override)));
	let overrideEntriesV2 = store.getState(controlView.control.states.overrideEntries);
	let overrideV2 = $derived(overrideEntriesV2 && overrideEntriesV2[0] ? (overrideEntriesV2[0].isTimer ?  1: 0 ) : 0);

	let modeV1 = $derived(Number(store.getState(controlView.control.states.mode)));
	let modeIdV1 = $derived(temperatureModeList[modeV1].id);
	let isAutomaticV1 = $derived(modeIdV1<5);
	let isHeatingV1 = $derived(modeIdV1==1 || modeIdV1==3 || modeIdV1==5);
	let isCoolingV1 = $derived(modeIdV1==2 || modeIdV1==4 || modeIdV1==6);
	let isEcoV1 = $derived(selectedItem==0);

	let modeV2 = $derived(Number(store.getState(controlView.control.states.currentMode)));
	let isAutomaticV2 = $derived(Number(store.getState(controlView.control.states.operatingMode))<3);
	let isHeatingV2 = $derived(modeV2==1 || modeV2 == 4);
	let isCoolingV2 = $derived(modeV2==2 || modeV2 == 5);
	let isEcoV2 = $derived(Number(store.getState(controlView.control.states.activeMode))==0);

	let override = $derived(isV1 ? overrideV1 : overrideV2);
	let isAutomatic = $derived(isV1 ? isAutomaticV1 : isAutomaticV2);
	let isHeating = $derived(isV1 ? isHeatingV1 : isHeatingV2);
	let isCooling = $derived(isV1 ? isCoolingV1 : isCoolingV2);
	let isEco = $derived(isV1 ? isEcoV1 : isEcoV2);

	let timerEndsV1 = $state(new SvelteDate());
	let timerEndsV2 = $state(new SvelteDate());

	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: true,
		openModal: false
	});

	function setTempPresent(i: number) {
		let coeff = 1000 * 60; // round to minute
		let overrideTimeSec = Math.round((date.getTime() - Date.now())/coeff)*coeff/1000;
    if (overrideTimeSec > 60 && controlView.control) {// TODO define minimum time of 1 minute
	    let cmd = isV1 ? 'starttimer/' : 'override/';
			overrideTimeSec += (isV1 ? 0 : Math.round((Date.now() - utils.loxTimeRef)/1000)); // V2 starts to count from 1-1-2009
			overrideTimeSec += (!isV1 && utils.isDST(date) ? -3600 : 0); // DST correction for V2
			overrideTimeSec = (isV1 ? Math.round(overrideTimeSec/60) : overrideTimeSec); // V1 in minutes!!
			cmd += String(i) + '/' + String(overrideTimeSec);
			publishTopic(controlView.control.uuidAction, cmd);
    } else {
			console.error('IRC: timer period to low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!'});
		}
	}

	function cancelOverride() {
		if (controlView.control) {
			publishTopic(controlView.control.uuidAction, isV1 ? 'stoptimer' : 'stopOverride');
		}
	}

	function updatePosition(e: any) { // TODO
	}

	function updateTimer(e: any) {
		date = e.value;
	}

	function getTimerEpoch(entries: any) {
		console.log('entries', entries);
		if (!entries) return;
		let timerDate = entries[0].end * 1000 + utils.loxTimeRef;
		return utils.isDST(new Date(timerDate)) ? timerDate+3600000 : timerDate;
	}

	function resetTab() {
    setTimeout(() => {
      selectedTab = 0;
    }, 500);
	}
	
	$effect( () => {
		timerEndsV1 = new SvelteDate(store.time.valueOf() + overrideV1*1000);
	});

	$effect( () => {
		timerEndsV2 = new SvelteDate(getTimerEpoch(overrideEntriesV2));
	});
</script>

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
	<Info control={controlView.control}/>
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
					<p class="mt-2 mb-2 text-lg">{$_("Timer till")} { isV1 ? format(timerEndsV1, 'PPP p') : format(timerEndsV2, 'PPP p')} </p>
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={cancelOverride}>
						<p class="text-lg">{$_("Cancel timer")}</p>
					</button>
				{/if}
			</div>
		</div>
	{/if} 
	{#if selectedTab==1}
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
									 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); setTempPresent(listItem.id)}}>
							<span class="text-lg">{$_(listItem.name)}</span>
						</button>
					{/each}
				{/if}
				<button class="w-full m-0 mt-4 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
								dark:bg-surface-950 bg-surface-50 px-2 py-2"
								onclick={() => {dateTimeView.openModal=true}}>
					<div class="w-full flex items-center truncate">
						<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
							<p class="truncate text-lg">{$_("Set timer")}</p>
							<p class="text-lg">{format(date, 'PPP p')}</p>
						</div>
					</div>
				</button>
			</div>
		</div>
	{/if}
	<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
		<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-primary-500' : ''} " onclick={() => selectedTab=0}>
				<LbIcon class={selectedTab==0 ? 'fill-primary-500' : 'fill-surface-50'} name={"/icons/svg/thermostat.svg"} width="24" height="24"/>
				<span class="mt-1 text-xs">{$_("Control")}</span>
			</button>
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-primary-500' : ''} " onclick={() => selectedTab=1}>
				<List/>
				<span class="mt-1 text-xs">{$_("Preset")}</span>
			</button>
		</div>
	</div>
	{/snippet}
</Modal>

<LbTimePickerModal date={date} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateTimer(e)}}/>
	
<Toaster {toaster}></Toaster>
