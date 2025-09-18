<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, WindowListItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
  let showScrollTop = $state(false);
	let showScrollBottom = $state(true);

	let windowList: WindowListItem[] = control.details.windows;
	let windowStates = $derived(String(store.getState(control.states.windowStates)));
	let windowStatesList = $derived(getSortedWindowList(windowStates.split(',')));

	let numOpen = $derived(Number(store.getState(control.states.numOpen)));
	let numClosed = $derived(Number(store.getState(control.states.numClosed)));
	let numTilted = $derived(Number(store.getState(control.states.numTilted)));
	let numOffline = $derived(Number(store.getState(control.states.numOffline)));
	let numLocked = $derived(Number(store.getState(control.states.numLocked)));
	let numUnlocked = $derived(Number(store.getState(control.states.numUnlocked)));
	let allClosed = $derived((numOpen + numTilted + numUnlocked) == 0);

	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(false); 
	let summary  = $derived(getSummary(numOpen, numTilted, numUnlocked));

	// TODO check what the summary is
	function getSummary(open: number, tilted: number, unlocked: number) {
		let summary: any = [];
		if (open) { summary.push({ name: String(open) + ' ' + $_('Open'), color: true}) }
		//if (numClosed) { summary.push({ name: String(numClosed) + ' ' + $_('Closed'), color: false}) }
		if (tilted) { summary.push({ name: String(tilted) + ' ' + $_('Tilted'), color: true}) }
		//if (numOffline) { summary.push({ name: String(numClosed) + ' ' + $_('Offline'), color: false}) }
		//if (numLocked) { summary.push({ name: String(numClosed) + ' ' + $_('Locked'), color: false}) }
		if (unlocked) { summary.push({ name: String(unlocked) + ' ' + $_('Unlocked'), color: true}) }
		return summary;
	}

	/* window states -> prio states (1 = highest prio)
		0: Offline	32 
		1: Closed		8
		2: Titled		2
		4: Open			1
		8: Locked		16
		16: Unlocked 4 
	*/

	function getSortedWindowList(states: string[]) {
		let list: WindowListItem[] = [];
		for( let i = 0; i < windowList.length; i++) {
			let prio: number[] = [32,32,32,32,32,32];
			let s = Number(states[i]);
			if (s == 0) { prio[0] = 32; }
			if (s & 1) { prio[1] = 8; }
			if (s & 2) { prio[2] = 2; }
			if (s & 4) { prio[3] = 1; }
			if (s & 8) { prio[4] = 16; }
			if (s & 16) { prio[5] = 4; }
			list[i] = {
				name: windowList[i].name,
				installPlace: windowList[i].installPlace,
				uuid: windowList[i].uuid,
				room: windowList[i].room,
				roomName: getRoomName(i),
				state: s,
				prio: Math.min(prio[0], prio[1], prio[2], prio[3], prio[4], prio[5])
			};
		}
		list.sort((a, b) => a.name.localeCompare(b.name, store.locale))
			.sort((a, b) => a.roomName.localeCompare(b.roomName, store.locale))
			.sort((a, b) => a.prio - b.prio);
		return list;
	}

	function getRoomName(i: number) {
		if (windowList[i] && windowList[i].room && store.rooms[windowList[i].room]) {
			return store.rooms[windowList[i].room].name;
		} else {
		  return '';
		} 
	}

	function getStatus() {
		if (allClosed) { 
			return $_('All closed');
		}
		let str: string = summary.map( (i:any) => ' ' + i.name ).toString()
		return str.toLowerCase();
	}

	function getState(state: number) {
		let stateList: any = [];
		if (state == 0) { stateList.push({ name: $_('Offline'), color: false}) }
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
    showScrollTop = limitHeight && hasScroll && (viewport?.scrollTop > 10);
		showScrollBottom = limitHeight && hasScroll && (viewport.scrollTop + viewport?.clientHeight < (viewport?.scrollHeight - 10));
  }

	$effect( () => {
		parseScroll();
	});

	$effect( () => {
		if (windowHeight && modalViewport && summary) { /* trigger on windowHeight and summary change */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 3) < 0;
			});
		}
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
		iconColor: allClosed ? 'dark:fill-primary-500 fill-primary-700' : 'fill-orange-500',
		textName: control.name,
		statusName: getStatus(),
		statusColor: allClosed ? 'dark:text-primary-500 text-primary-700' : 'text-orange-500', 
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
		contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px] {limitHeight ? 'h-full': '' }"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div>
		<Info control={controlView.control}/>
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {controlView.modal.action(false)}}>
					<X />
				</button>
			</div>
		</header>
		<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
			<h2 class="flex relative text-lg text-center mt-2 mb-2">
				{#each summary as state, i}
					{@const isLast = i === summary.length - 1}
						<span class={ state.color ? 'text-orange-500' : 'dark:text-primary-500 text-primary-700'}>{state.name}</span>{#if !isLast }
							<span>,&nbsp;</span>{/if}
				{/each}
			</h2>
			<div class="flex flex-col relative w-full overflow-y-auto h-full">
				{#if showScrollTop}
					<div class="absolute z-10 left-[50%] lb-center top-[17px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
				{/if}
				{#if showScrollBottom}
					<div class="absolute z-10 left-[50%] lb-center -bottom-[20px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
				{/if}
				<div class="flex flex-col space-y-2 overflow-y-auto w-full h-full mt-2"  bind:this={viewport} onscroll={parseScroll}>
					{#each windowStatesList as window, index}
						<div class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
													dark:bg-surface-950 bg-surface-50 px-2 py-2">
							<div class="flex items-center truncate w-full">
								<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center">
									<div class="flex flex-col">
										<p class="text-left leading-6 truncate text-lg {getStatusColor(index)}">{window.name}</p>
										<p class="text-left truncate bg-transparent text-xs dark:text-surface-300 text-surface-700">{window.roomName}</p>
									</div>
									<p class="text-lg">
										{#each getState(window.state) as state, i}
											{@const isLast = i === getState(window.state).length - 1}
											<span class={ state.color ? 'text-orange-500' : ( window.state ? 'dark:text-primary-500 text-primary-700' :
											'dark:text-surface-300 text-surface-700')}>{state.name}</span>{#if !isLast }
												<span>,&nbsp;</span>{/if}
										{/each}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
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
