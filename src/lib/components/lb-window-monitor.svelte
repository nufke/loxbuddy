<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, WindowListItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition'
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
  let showScrollTop = $state(false);
	let showScrollBottom = $state(true);

	let windowList = control.details.windows as WindowListItem[];

	let windowStates = $derived(String(store.getState(control.states.activeMoodsNum)));
	let windowStatesList = $derived(windowStates.split(','));

	let numOpen = $derived(Number(store.getState(control.states.numOpen)));
	let numClosed = $derived(Number(store.getState(control.states.numClosed)));
	let numTilted = $derived(Number(store.getState(control.states.numTilted)));
	let numOffline = $derived(Number(store.getState(control.states.numOffline)));
	let numLocked = $derived(Number(store.getState(control.states.numLocked)));
	let numUnlocked = $derived(Number(store.getState(control.states.numUnlocked)));

	let allClosed = $derived((numOpen + numTilted + numUnlocked) == 0);

	// TODO check what the summary is
	function getSummary() {
		let summary: any = [];
		if (numOpen) { summary.push({ name: String(numOpen) + ' ' + $_('Open'), color: true}) }
		//if (numClosed) { summary.push({ name: String(numClosed) + ' ' + $_('Closed'), color: false}) }
		if (numTilted) { summary.push({ name: String(numClosed) + ' ' + $_('Tilted'), color: true}) }
		//if (numOffline) { summary.push({ name: String(numClosed) + ' ' + $_('Offline'), color: false}) }
		//if (numLocked) { summary.push({ name: String(numClosed) + ' ' + $_('Locked'), color: false}) }
		if (numUnlocked) { summary.push({ name: String(numClosed) + ' ' + $_('Unlocked'), color: true}) }
		return summary;
	}

	function getStatus() {
		if (allClosed) { 
			return $_('All closed');
		}
		let str: string = getSummary().map( (i:any) => ' ' + i.name ).toString()
		return str.toLowerCase();
	}

	function getState(i: number) {
		let state = Number(windowStatesList[i]);
		let stateList: any = [];
		if (state & 1) { stateList.push({ name: $_('Closed'), color: false}) }
		if (state & 2) { stateList.push({ name: $_('Tilted'), color: true}) }
		if (state & 4) { stateList.push({ name: $_('Open'), color: true}) }
		if (state & 8) { stateList.push({ name: $_('Locked'), color: false}) }
		if (state & 16) { stateList.push({ name: $_('Unlocked'), color: true}) }
		return stateList
	}

	function getStatusColor(index: number) {
		let state = Number(windowStatesList[index]);
		return (state & 22) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50';
	}

	function parseScroll() {
		hasScroll = viewport?.scrollHeight > viewport?.clientHeight;
    showScrollTop = hasScroll && (viewport?.scrollTop > 20);
		showScrollBottom = hasScroll && (viewport.scrollTop + viewport?.clientHeight < (viewport?.scrollHeight - 20));
  }

	$effect( () => {
		parseScroll();
	});

	let modal: ModalView = $state({
		action: (state: boolean) => {	modal.state = state; },
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: allClosed ? 'fill-surface-950 dark:fill-surface-50' : 'dark:fill-primary-500 fill-primary-700',
		textName: control.name,
		statusName: getStatus(),
		statusColor: allClosed ? 'dark:text-surface-300 text-surface-700' : 'dark:text-primary-500 text-primary-700', 
		modal: modal
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
		onOpenChange={() => controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px]"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
			<Info control={controlView.control}/>
			<header class="relative">
				<div class="mb-2 flex justify-center">
					<h2 class="h4 text-center ">{controlView.textName}</h2>
				</div>
				<h2 class="text-lg text-center">
					{#each getSummary() as state, i}
						{@const isLast = i === getSummary().length - 1}
							<span class={ state.color ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50'}>{state.name}</span>{#if !isLast }
								<span>,&nbsp;</span>{/if}
					{/each}
				</h2>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {controlView.modal.action(false)}}>
						<X />
					</button>
				</div>
			</header>
			<div class="container relative w-full">
				{#if showScrollTop}
					<div class="absolute z-10 left-[50%] lb-center top-[16px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
				{/if}
				{#if showScrollBottom}
					<div class="absolute z-10 left-[50%] lb-center -bottom-[16px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
				{/if}
				<div class="overflow-y-auto space-y-2 max-h-[474px]" bind:this={viewport} onscroll={parseScroll}>
					{#each windowList as window, index}
						<div class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
													dark:bg-surface-950 bg-surface-50 px-2 py-2">
							<div class="flex items-center truncate w-full">
								<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center">
									<div class="flex flex-col">
										<p class="leading-6 truncate text-lg {getStatusColor(index)}">{window.name}</p>
										<p class="truncate bg-transparent text-left text-xs dark:text-surface-300 text-surface-700">{store.rooms[window.room].name}</p>
									</div>
									<p class="text-lg">
										{#each getState(index) as state, i}
											{@const isLast = i === getState(index).length - 1}
											<span class={ state.color ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50'}>{state.name}</span>{#if !isLast }
												<span>,&nbsp;</span>{/if}
										{/each}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/snippet}
	</Modal>
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
