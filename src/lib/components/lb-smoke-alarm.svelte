<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { X, Wrench, Info } from '@lucide/svelte';
	
	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let timeServiceMode = $derived(Number(store.getState(control.states.timeServiceMode)));
	let level = $derived((timeServiceMode > 0) ? 99 : Number(store.getState(control.states.level)));

	let statusName = $state('');
	let statusColor = $state('');
	let selectedTab = $state(0);
	let oneItemSelected = $state(false);
	let serviceTime = $state(0);

	$effect( () => updateStatus(level));

	function updateStatus(level: number) {
		switch (level) {
			case 0: 
				statusName = 'Everything OK'; 
				statusColor = 'text-green-500 fill-green-500';
				break;
			case 1: 
				statusName = 'Pre-alarm active'; 
				statusColor = 'text-red-500 fill-red-500';
				break;
			case 2: 
				statusName = 'Main alarm active'; 
				statusColor = 'text-red-500 fill-red-500';
				break;
			case 99: // service
				statusName = 'Alarm suppression enabled (' + Math.round(timeServiceMode/60) + ' min)';  
				statusColor = 'text-blue-500 fill-blue-500';
				break;
			default: 
				statusName = '';
				statusColor = '';
    }
	}

	function stopService() {
		if (timeServiceMode > 0) { // only stop if servicemode is running
			publishTopic(control.uuidAction, 'servicemode/0');
		}
	}

	function startService() {
    if (oneItemSelected && serviceTime > 60) { // TODO minimal time for service
      let cmd = 'servicemode/' + String(serviceTime);
      publishTopic(control.uuidAction, cmd);
    }
	}

	type TimeList = {
		time: string;
		seconds: number;
		selected: boolean;
	}

	let timeList: TimeList[] = $state([
		{
			time: '15 min',
			seconds: 900,
			selected: false
		},
		{
			time: '30 min',
			seconds: 1800,
			selected: false
		},
		{
			time: '60 min',
			seconds: 3600,
			selected: false
		}
	]);

	function onClick(s: TimeList) {
		timeList.forEach( item => s.time === item.time ? item.selected = !item.selected : item.selected = false );
		serviceTime = s.seconds;
		oneItemSelected = (timeList.filter(item => item.selected == true).length == 1);
	}

	let serviceButton: SingleButtonView = $derived(
		{
			name: (timeServiceMode > 0) ? 'Stop alarm suppression' : 'Start alarm suppression',
			type: 'button',
			color: '',
			click: () => {
				(timeServiceMode > 0) ? stopService() : startService()
			}
		}
	);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
	});
	
	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: '/icons/svg/flame.svg',
		iconColor: statusColor,
		textName: control.name,
		statusName: statusName,
		statusColor: statusColor,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView />

	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={() => controlView.modal.action(false)}
		triggerBase="btn preset-tonal"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
									from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
		backdropClasses="backdrop-blur-sm">
		{#snippet content()}
			<header class="relative flex">
				<div class="flex justify-center text-center w-[300px]">
					<h2 class="h4 truncate">{controlView.textName}</h2>
				</div>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {controlView.modal.action(false); selectedTab=0;}}>
						<X/>
					</button>
				</div>
			</header>
			{#if selectedTab==0}
			<div class="truncate justify-center text-center">
				{#if controlView.statusName}
					<p class="text-lg truncate {controlView.statusColor}">{$_(controlView.statusName)}</p>
				{/if}
			</div>
			{/if}
			{#if selectedTab==1}
			<div class="justify-center text-center">
				<p class="h4 text-lg">{$_("Duration servicemode")}</p>
			</div>
			<div class="flex flex-row items-center justify-center gap-2 m-2 mt-2">
				{#each timeList as item}
					<button type="button" class="btn btn-lg shadow-xl rounded-lg border border-white/15 hover:border-white/50 
									{item.selected ? 'preset-tonal' : 'preset-tonal-primary'}" 
									onclick={(e) => {e.stopPropagation(); e.preventDefault(); onClick(item);}}>
						<span>{item.time}</span>
					</button>
				{/each}
			</div>
			<div class="m-3">
				<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50
								{oneItemSelected || (timeServiceMode > 0) ? 'text-primary-800-200' : 'text-primary-400-600'}" 
								onclick={(e) => {e.stopPropagation(); e.preventDefault(); serviceButton.click();}}>
					{#if serviceButton.name}
						<span>{$_(serviceButton.name)}</span>
					{/if}
				</button>
			</div>
			{/if}
			<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
				<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
						{selectedTab==0 ? 'text-green-500' : ''} " onclick={() => {selectedTab=0;}}>
						<Info/>
						<span class="mt-1 text-xs">{$_("Status")}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
						{selectedTab==1 ? 'text-green-500' : ''} " onclick={() => {selectedTab=1;}}>
						<Wrench/>
						<span class="mt-1 text-xs">{$_("Service mode")}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</Modal>
</div>
