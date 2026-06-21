<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { innerHeight } from 'svelte/reactivity/window';
	import type { Control, ControlOptions, WindowListItem, Room } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	type Summary = { name: string; isColor: boolean };

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const margin = 200;

	let controlOpen = $state(false);
	let viewport: any = $state();
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	let windowStates = $derived(String(controlStore.getState(control.states?.windowStates)));
	let windowList: WindowListItem[] = $derived(control.details?.windows);
	let windowStatesList = $derived(getSortedWindowList(windowStates.split(',')));
	let numOpen = $derived(Number(controlStore.getState(control.states?.numOpen)));
	let numTilted = $derived(Number(controlStore.getState(control.states?.numTilted)));
	let numUnlocked = $derived(Number(controlStore.getState(control.states?.numUnlocked)));
	let allClosed = $derived((numOpen + numTilted + numUnlocked) === 0);
	let numLocked = $derived(Number(controlStore.getState(control.states?.numLocked))); // TODO
	let numClosed = $derived(Number(controlStore.getState(control.states?.numClosed))); // TODO
	let numOffline = $derived(Number(controlStore.getState(control.states?.numOffline))); // TODO
	let summary = $derived(getSummary(numOpen, numTilted, numUnlocked));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(allClosed ? 'text-surface-950 dark:text-surface-50' : 'dark:text-primary-500 text-primary-700');
	let statusColor = $derived(allClosed ? 'text-surface-950 dark:text-surface-50' : 'dark:text-primary-500 text-primary-700');
	let statusName = $derived(getStatus());
	let windowHeight = $derived(innerHeight.current || 0);
	let availableHeight = $derived(Math.floor(windowHeight * 0.9) - margin);

	let style = $derived(
		viewport && viewport.scrollHeight > availableHeight
			? `height: ${availableHeight}px`
			: 'height: auto' );

	$effect(() => { parseScroll(windowHeight, viewport); });

	/**
	 * Builds the summary list of open, tilted and unlocked window counts.
	 *
	 * @param open - number of open windows.
	 * @param tilted - number of tilted windows.
	 * @param unlocked - number of unlocked windows.
	 * @returns array of summary entries shown in the card and dialog header.
	 */
	function getSummary(open: number, tilted: number, unlocked: number): Summary[] {
		const result: Summary[] = [];
		if (open) result.push({ name: String(open) + ' ' + $_('Open'), isColor: true });
		if (tilted) result.push({ name: String(tilted) + ' ' + $_('Tilted'), isColor: true });
		if (unlocked) result.push({ name: String(unlocked) + ' ' + $_('Unlocked'), isColor: true });
		//if (numOffline) { summary.push({ name: String(numClosed) + ' ' + $_('Offline'), isColor: false}) }
		//if (numLocked) { summary.push({ name: String(numClosed) + ' ' + $_('Locked'), isColor: false}) }
		//if (numClosed) { summary.push({ name: String(numClosed) + ' ' + $_('Closed'), isColor: false}) }
		return result;
	}

	/**
	 * Sorts the raw state-string array into a `WindowListItem` list ordered by
	 * priority (highest-priority state first), then by room name, then by window name.
	 *
	 * Priority mapping (lower number = higher priority):
	 * Open=1, Tilted=2, Unlocked=4, Closed=8, Locked=16, Offline=32
	 *
	 * @param states - array of decimal state strings, one per window.
	 * @returns sorted list of window items with computed priority and room name.
	 */
	function getSortedWindowList(states: string[]): WindowListItem[] {
		const list: WindowListItem[] = [];
		for (let i = 0; i < windowList.length; i++) {
			const prio = [32, 32, 32, 32, 32, 32];
			const s = Number(states[i]);
			if (s === 0) { prio[0] = 32; }
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
				prio: Math.min(...prio)
			};
		}
		return list
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
			.sort((a, b) => a.roomName.localeCompare(b.roomName, appStore.locale))
			.sort((a, b) => a.prio - b.prio);
	}

	/**
	 * Returns the room name for a window by index into the details window list.
	 *
	 * @param i - index into `windowList`.
	 * @returns room name, or empty string when no room is assigned.
	 */
	function getRoomName(i: number): string {
		const room: Room | undefined = windowList[i]?.room
			? controlStore.rooms.get(windowList[i].room)
			: undefined;
		return room ? room.name : '';
	}

	/**
	 * Returns the card/dialog status string (summary of open/tilted/unlocked counts).
	 *
	 * @returns localised status string, e.g. 'All closed' or '2 open, 1 tilted'.
	 */
	function getStatus(): string {
		if (allClosed) return $_('All closed');
		return summary.map((i: Summary) => ' ' + i.name).toString().toLowerCase();
	}

	/**
	 * Returns the list of state labels for a single window's combined state bitmask.
	 *
	 * @param state - the bitmask value from the sorted window list.
	 * @returns array of label/colour pairs for all active states.
	 */
	function getState(state: number): Summary[] {
		const result: Summary[] = [];
		if (state === 0) result.push({ name: $_('Offline'), isColor: false });
		if (state & 1) result.push({ name: $_('Closed'), isColor: false });
		if (state & 2) result.push({ name: $_('Tilted'), isColor: true });
		if (state & 4) result.push({ name: $_('Open'), isColor: true });
		if (state & 8) result.push({ name: $_('Locked'), isColor: false });
		if (state & 16) result.push({ name: $_('Unlocked'), isColor: true });
		return result;
	}

	/**
	 * Returns the colour class for a window row based on its state bitmask.
	 * Bits 1 (Tilted), 2 (Open) and 4 (Unlocked) together = bitmask 22 = non-closed state.
	 *
	 * @param item - the sorted window list item.
	 * @returns Tailwind colour class string.
	 */
	function getStatusColor(item: WindowListItem): string {
		return (item.state & 22) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50';
	}

	/**
	 * Recomputes scroll-indicator visibility from the current viewport metrics.
	 * Called on mount/resize (via $effect) and on every scroll event.
	 *
	 * @param height - current window inner height (guards against SSR zero).
	 * @param view - the scrollable div element bound via bind:this.
	 */
	function parseScroll(height: number, view: any = undefined): void {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && view.scrollTop > 10;
		showScrollBottom = height > 0 && hasScroll && view.scrollTop + view.clientHeight < view.scrollHeight - 10;
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<p class="flex relative text-lg text-center mt-2 mb-2 lowercase">
					{#each summary as state, i}
						{@const isLast = i === summary.length - 1}
						<span class={state.isColor ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50'}>{state.name}</span>{#if !isLast}<span>,&nbsp;</span>{/if}
					{/each}
				</p>
				<div class="flex flex-col relative w-full">
					{#if showScrollTop}
						<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 top-[17px] text-surface-500" transition:fade={{ duration: 300 }}>
							<LbIcon name="chevron-up" height="30" width="30"/>
						</div>
					{/if}
					{#if showScrollBottom}
						<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 -bottom-[20px] text-surface-500" transition:fade={{ duration: 300 }}>
							<LbIcon name="chevron-down" height="30" width="30"/>
						</div>
					{/if}
					<div class="flex flex-col space-y-2 overflow-y-auto w-full mt-2" {style} bind:this={viewport}
							onscroll={() => parseScroll(windowHeight, viewport)}>
						{#each windowStatesList as window}
							<div class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50 bg-surface-50-950 px-2 py-2">
								<div class="flex items-center truncate w-full">
									<div class="mt-0 ml-2 mr-2 grid grid-cols-2 w-full justify-between truncate items-center">
										<div>
											<p class="text-left truncate leading-6 text-base {getStatusColor(window)}">{window.name}</p>
											<p class="text-left truncate bg-transparent text-xs dark:text-surface-300 text-surface-700">{window.roomName}</p>
										</div>
										<p class="text-right text-base truncate">
											{#each getState(window.state) as state, i}
												{@const isLast = i === getState(window.state).length - 1}
												<span class={state.isColor ? 'dark:text-primary-500 text-primary-700' : (window.state ? 'text-surface-950 dark:text-surface-50' : 'dark:text-surface-300 text-surface-700')}>{state.name}</span>{#if !isLast}<span>,&nbsp;</span>{/if}
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
	</LbDialog>
{/if}
