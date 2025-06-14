<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { ControlView, ListItem } from '$lib/types/models';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { store } from '$lib/stores/store.svelte';	
	import { X, Timer, Leaf, Flame, List } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';
	import { fade200 } from '$lib/helpers/transition';
	import { publishTopic } from '$lib/communication/mqttclient';
	import LbCicleSlider from '$lib/components/lb-circle-slider.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

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

	let modeId = $derived(temperatureModeList[mode].id);
	let isAutomatic = $derived(modeId<5);
	let isHeating = $derived(modeId==1 || modeId==3 || modeId==5);
	let isCooling = $derived(modeId==2 || modeId==4 || modeId==6);
	let isEco = $derived(selectedItem==0);

	function setTempPresent(i: number) {
    let cmd = 'starttimer/' + i + '/60'; // TODO specify timer (now 60sec)
		if (controlView.control) {
			publishTopic(controlView.control.uuidAction, cmd);
		}
	}

	function updatePosition(e: any) { // TODO
	}
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>{ controlView.modal.action(false); selectedTab = 0;}}>
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
				<div class="flex items-center justify-center ml-2">
					{#if isAutomatic}
						<svg class="fill-white mr-2" use:inlineSvg={"/icons/svg/automatic.svg"} width="24" height="24"></svg>
					{/if}
					{#if isCooling}
					<svg class="fill-cyan-400 mr-2" use:inlineSvg={"/icons/svg/mode_cool.svg"} width="24" height="24"></svg>
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
						<button type="button" class="w-full mt-2 btn btn-lg {(index==selectedItem) ? 'preset-tonal' : 'preset-tonal-primary' }
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
		<div class="grid h-full max-w-lg grid-cols-2  mx-auto">
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-green-500' : ''} " onclick={() => selectedTab=0}>
				<svg class={selectedTab==0 ? 'fill-green-500' : 'fill-white'} use:inlineSvg={"/icons/svg/thermostat.svg"} width="24" height="24"></svg>
				<span class="mt-1 text-xs">{$_("Control")}</span>
			</button>
			<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-green-500' : ''} " onclick={() => selectedTab=1}>
				<List/>
				<span class="mt-1 text-xs">{$_("Preset")}</span>
			</button>
		</div>
	</div>
	{/snippet}
</Modal>
