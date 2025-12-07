<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, WindowListItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { XIcon, ChevronUpIcon, ChevronDownIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let windowList: WindowListItem[] = control.details.windows;

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	let windowStates = $derived(String(controlStore.getState(control.states.windowStates)));
	let windowStatesList = $derived(getSortedWindowList(windowStates.split(',')));

	let numOpen = $derived(Number(controlStore.getState(control.states.numOpen)));
	let numClosed = $derived(Number(controlStore.getState(control.states.numClosed))); // TODO
	let numTilted = $derived(Number(controlStore.getState(control.states.numTilted)));
	let numOffline = $derived(Number(controlStore.getState(control.states.numOffline))); // TODO
	let numLocked = $derived(Number(controlStore.getState(control.states.numLocked))); // TODO
	let numUnlocked = $derived(Number(controlStore.getState(control.states.numUnlocked)));
	let allClosed = $derived((numOpen + numTilted + numUnlocked) == 0);

	let windowHeight = $derived(innerHeight.current || 0);
	let summary = $derived(getSummary(numOpen, numTilted, numUnlocked));

	let margin = 200;
	let size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	// TODO check what the summary is
	function getSummary(open: number, tilted: number, unlocked: number) {
		let summary: any = [];
		if (open) { summary.push({ name: String(open) + ' ' + $_('Opened'), color: true}) }
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
		4: Opened		1
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
		list.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
			.sort((a, b) => a.roomName.localeCompare(b.roomName, appStore.locale))
			.sort((a, b) => a.prio - b.prio);
		return list;
	}

	function getRoomName(i: number) {
		if (windowList[i] && windowList[i].room && controlStore.rooms[windowList[i].room]) {
			return controlStore.rooms[windowList[i].room].name;
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
		if (state & 4) { stateList.push({ name: $_('Opened'), color: true}) }
		if (state & 8) { stateList.push({ name: $_('Locked'), color: false}) }
		if (state & 16) { stateList.push({ name: $_('Unlocked'), color: true}) }
		return stateList
	}

	function getStatusColor(index: number) {
		let state = Number(windowStatesList[index]);
		return (state & 22) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50';
	}

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});

	function parseScroll(height: number, view: any = undefined) {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

	function close() {
		controlView.dialog.action(false);
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {	dialog.state = state; },
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: allClosed ? 'dark:fill-primary-500 fill-primary-700' : 'fill-orange-500',
		textName: control.name,
		statusName: getStatus(),
		statusColor: allClosed ? 'dark:text-primary-500 text-primary-700' : 'text-orange-500', 
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
					<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										md:max-w-9/10 md:max-h-9/10 w-[450px]">
						<!--<Info control={controlView.control}/>-->
						<header class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<XIcon class="size-4"/>
								</button>
							</div>
						</header>
						<Dialog.Description>
							<div class="flex flex-col items-center justify-center">
								<p class="flex relative text-lg text-center mt-2 mb-2">
									{#each summary as state, i}
										{@const isLast = i === summary.length - 1}
											<span class={ state.color ? 'text-orange-500' : 'dark:text-primary-500 text-primary-700'}>{state.name}</span>{#if !isLast }
												<span>,&nbsp;</span>{/if}
									{/each}
								</p>
								<div class="flex flex-col relative w-full">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[17px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUpIcon size="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[20px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDownIcon size="30"/></div>
									{/if}
									<div class="flex flex-col space-y-2 overflow-y-auto w-full mt-2" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
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
						</Dialog.Description>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
	{/if}
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
