<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbStatusBar from '$lib/components/Common/LbStatusBar.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { innerHeight } from 'svelte/reactivity/window';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(true);
	let hasScroll = $state(true);
	let viewport: any = $state(); // TODO make HTMLDivElement

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let loads = $derived(control.details?.loads);
	let mode = $derived(control.details?.mode);
	let currentPower = $derived(Number(controlStore.getState(control.states?.currentPower)));
	let peakOverloadPower = $derived(Number(controlStore.getState(control.states?.peakOverloadPower)));
	let maxPower = $derived(Number(controlStore.getState(control.states?.maxPower)));
	let availablePower = $derived(Number(controlStore.getState(control.states?.availablePower))); // remaining free power
	let maxPowerExceeded = $derived(Number(controlStore.getState(control.states?.maxPowerExceeded)));
	let maxTp = $derived(Number(controlStore.getState(control.states?.maxTp)));
	let lockedLoads = $derived(Number(controlStore.getState(control.states?.lockedLoads)));
	let statusLoads = $derived(Number(controlStore.getState(control.states?.statusLoads)));
	let iconColor = $derived(setColor(currentPower/maxPower));
	let statusName =  $derived(getPowerLevel(availablePower));
	let statusColor = $derived(setColor(currentPower/maxPower));
	let windowHeight = $derived(innerHeight.current || 0);

	/**
	 * Formats a power value as a localised string with unit and availability label.
	 *
	 * @param n - power value in kW.
	 * @returns formatted string, e.g. "3.2 kW available".
	 */
	function getPowerLevel(n: number): string {
		return (n.toLocaleString(appStore.locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })) + ' kW ' + $_('Available').toLowerCase();
	}

	/**
	 * Returns the display name and colour for a load's status based on its bitmask position.
	 *
	 * @param mask - zero-based index of the load in the loads array.
	 * @returns object with localised `name` ('On'/'Off'/'Locked') and a Tailwind `color` class.
	 */
	function getPowerStatus(mask: number): {name: string, color: string} {
		const statusLoads_ = statusLoads & (mask+1);
		const lockedLoads_ = lockedLoads & (mask+1);
		return {
			name: lockedLoads_ ? $_('Locked') : (statusLoads_ ? $_('On') : $_('Off')),
			color: lockedLoads_ ? 'dark:text-error-500 text-error-700' : (statusLoads_ ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700')
		}
	}

	/**
	 * Maps a power ratio to a Tailwind colour class indicating load level.
	 * Returns neutral below 1%, primary below 70%, warning below 90%, error otherwise.
	 *
	 * @param powerRatio - currentPower divided by maxPower.
	 * @returns Tailwind text colour class string.
	 */
	function setColor(powerRatio: number): string {
		if (powerRatio == 0.01) return 'dark:text-surface-300 text-surface-700';
		if (powerRatio < 0.7) return 'dark:text-primary-500 text-primary-700';
		if (powerRatio < 0.9) return 'dark:text-warning-500 text-warning-700';
		return 'dark:text-error-500 text-error-700';
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return; // no dialog at subcontrol level (no icon)
		controlOpen = true;
	}

	/**
	 * Closes the control dialog and resets any in-progress password prompt,
	 * discarding the pending action and cancel callback.
	 */
	function closeControl(): void {
		controlOpen = false;
	}

	/**
	 * Updates scroll indicator visibility based on the current scroll position of the list viewport.
	 * Called on mount (via $effect), on viewport resize, and on every scroll event.
	 *
	 * @param height - current window inner height; used to detect resize events.
	 * @param view - the scrollable list container element.
	 */
	function parseScroll(height: number, view: any = undefined): void {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="w-full mt-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50">
				<LbStatusBar {maxPower} {currentPower} {mode} />
			</div>
			<div class="relative flex flex-col w-full">
				{#if showScrollTop}
					<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 top-[19px] text-surface-500" transition:fade={{ duration: 300 }}>
						<LbIcon name="chevron-up" height="30" width="30"/>
					</div>
				{/if}
				{#if showScrollBottom}
					<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}>
						<LbIcon name="chevron-down"height="30" width="30"/>
					</div>
				{/if}
				<div class="overflow-y-auto max-h-[calc(90vh-260px)]" bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
					{#each loads as load,i}
						<button class="mt-2 w-full flex items-center justify-start rounded-lg border border-white/15 hover:border-white/50
													bg-surface-50-950">
							<div class="p-3 flex flex-row w-full justify-between  items-center h-[60px]">
								<div class="flex flex-col truncate">
									<p class="truncate text-lg text-left">{load.name}</p>
									<p class="truncate text-left text-xs dark:text-surface-300 text-surface-700">{getPowerLevel(load.power)}</p>
								</div>
								{#if load.hasStatus}
									<p class="text-left text-lg {getPowerStatus(i).color}">{getPowerStatus(i).name}</p>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}
