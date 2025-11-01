<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, ModalView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { loxWsClient } from '$lib/communication/loxwsclient';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { X, Wrench, Info, ChevronUp, ChevronDown } from '@lucide/svelte';
	import Info2 from '$lib/components/lb-info.svelte';
	import { tick } from 'svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let timeServiceMode = $derived(Number(store.getState(control.states.timeServiceMode)));
	let level = $derived((timeServiceMode > 0) ? 99 : Number(store.getState(control.states.level)));

	let statusName = $state('');
	let statusColor = $state('');
	let selectedTab = $state(0);
	let serviceTime = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let duration = $state('');

	$effect( () => {
		updateStatus(level);
		if (timeServiceMode==0) duration = '';
	});

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
				statusName = 'Alarm suppression enabled'
				duration = ' (' + ((timeServiceMode>60) ? 
												(Math.round(timeServiceMode/60) + ' min)') : 
												(timeServiceMode + ' sec)'));
				statusColor = 'text-blue-500 fill-blue-500';
				break;
			default: 
				statusName = '';
				statusColor = '';
    }
	}

	function stopService() {
		if (timeServiceMode > 0) { // only stop if servicemode is running
			loxWsClient.control(control.uuidAction, 'servicemode/0');
		}
		duration = '';
	}

	function startService() {
    if (serviceTime > 0) { // TODO minimal time for service
      let cmd = 'servicemode/' + String(serviceTime);
      loxWsClient.control(control.uuidAction, cmd);
    }
	}

	function setTimer(h: number, m: number) {
		hours += h;
		hours = (hours>23) ? (hours = 0) : (hours<0) ? (hours = 23) : hours;
		minutes += m;
		minutes = (minutes>59) ? (minutes = 0) : (minutes<0) ? (minutes = 59) : minutes;
		serviceTime= hours * 3600 + minutes * 60;
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
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: statusColor,
		textName: control.name,
		statusName: statusName,
		statusColor: statusColor,
		modal: modal
	});
	
	async function close() {
		controlView.modal.action(false);
		await tick();
		selectedTab = 0;
	}
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
		onOpenChange={()=>{}}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 overflow-auto w-[380px]"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
			<!-- TODO better method to create multiple modal overlays with backdrop? -->
			<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={close}></div> 
			<Info2 control={controlView.control}/>
			<header class="relative flex">
				<div class="flex justify-center text-center w-[300px]">
					<p class="h5 truncate">{controlView.textName}</p>
				</div>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={close}>
						<X/>
					</button>
				</div>
			</header>
			{#if selectedTab==0}
			<div class="truncate justify-center text-center">
				{#if controlView.statusName}
					<p class="text-lg truncate {controlView.statusColor}">{$_(controlView.statusName)} {duration}</p>
				{/if}
			</div>
			{/if}
			{#if selectedTab==1}
			<div class="justify-center text-center">
				<p class="h5 text-lg dark:text-surface-300 text-surface-700">{$_("Duration servicemode")} ({$_("Uren").toLocaleLowerCase()} : {$_("Minuten").toLocaleLowerCase()})</p>
			</div>
			<div class="w-[100px] m-auto justify-center text-center">
				<div class="grid grid-cols-3">
					<div class="-mb-1"><button class="btn-icon p-1 dark:bg-surface-950 bg-surface-50 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(1,0)}><ChevronUp/></button></div>
					<div class="-mb-1"></div>
					<div class="-mb-1"><button class="btn-icon p-1 dark:bg-surface-950 bg-surface-50 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(0,1)}><ChevronUp/></button></div>
					<div>{hours}</div>
					<div>:</div>
					<div>{minutes}</div>
					<div><button type="button" class="btn-icon p-1 dark:bg-surface-950 bg-surface-50 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(-1,0)}><ChevronDown/></button></div>
					<div></div>
					<div><button type="button" class="btn-icon p-1 dark:bg-surface-950 bg-surface-50 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(0,-1)}><ChevronDown/></button></div>
				</div>
			</div>
			<div class="m-3">
				<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50
								{(serviceTime > 0) || (timeServiceMode > 0) ? 'text-primary-800-200' : 'text-primary-400-600'}" 
								onclick={(e) => {e.stopPropagation(); e.preventDefault(); serviceButton.click();}}>
					{#if serviceButton.name}
						<span class="text-lg">{$_(serviceButton.name)}</span>
					{/if}
				</button>
			</div>
			{/if}
			<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
				<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
						{selectedTab==0 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectedTab=0;}}>
						<Info/>
						<span class="mt-1 text-xs">{$_("Status")}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
						{selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectedTab=1;}}>
						<Wrench/>
						<span class="mt-1 text-xs">{$_("Service mode")}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</Modal>
</div>
