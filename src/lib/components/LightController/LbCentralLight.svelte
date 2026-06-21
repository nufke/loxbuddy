<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { innerHeight } from 'svelte/reactivity/window';
	import type { Control, ControlOptions, LightItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbLightControllerV2 from '$lib/components/LightController/LbLightControllerV2.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const margin = 200;

	let controlOpen = $state(false);
	let selectedControl: Control | undefined = $state();
	let selectedControlOptions: ControlOptions | undefined = $state();
	let viewport: any = $state();
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	let lightList = $derived(control.details?.controls) as LightItem[];
	let lightsUuid = $derived(control.details?.controls.map((item: LightItem) => item.uuid));

	let lightControls = $derived(controlStore.controlList.filter(
		(c: Control) => lightsUuid.indexOf(c.uuidAction) > -1
	));

	let lightsOff = $derived(
		lightControls.filter((c: Control) => controlStore.getState(c.states?.activeMoodsNum) == 778)
	);

	let lightsOn = $derived(lightList.length - lightsOff.length);
	let selectedLightCount = $derived(lightList.filter((item: LightItem) => item.selected === true).length);
	let scenesEnabled = $derived(selectedLightCount === 1);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(lightsOn ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusColor = $derived(lightsOn ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let statusName = $derived(getActiveLights());
	let windowHeight = $derived(innerHeight.current || 0);
	let availableHeight = $derived(Math.floor(windowHeight * 0.9) - margin);

	let style = $derived(
		viewport && viewport.scrollHeight > availableHeight
			? `height: ${availableHeight}px`
			: 'height: auto'
	);

	// handle scrolling
	$effect(() => { parseScroll(windowHeight, viewport); });

	// reset all selections when the light list changes (e.g. on miniserver reconnect)
	$effect(() => { lightList.forEach((item: LightItem) => (item.selected = false)); });

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
	 * Returns a localised summary of how many light zones are currently on.
	 */
	function getActiveLights(): string {
		switch (lightsOn) {
			case 0: return $_('All off');
			case 1: return fmt.sprintf($_('On in %s room'), 1);
			default: return fmt.sprintf($_('On in %s rooms'), lightsOn);
		}
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

	/**
	 * Closes the control dialog and resets all per-session state: selected
	 * lights and the open sub-controller reference.
	 */
	function closeControl(): void {
		controlOpen = false;
		lightList.forEach((item: LightItem) => (item.selected = false));
		selectedControl = undefined;
		selectedControlOptions = undefined;
	}

	/**
	 * Returns the display name for a light controller. Falls back to the room
	 * name when the controller carries the generic 'LightControllerV2' name.
	 *
	 * @param c - the individual light-controller Control object.
	 */
	function getControlName(c: Control): string {
		const origNameFound = $_('LightControllerV2').includes(c.name);
		const room = controlStore.rooms.get(c.room);
		return origNameFound && room ? room.name : c.name;
	}

	/**
	 * Returns the room name for display below the controller name, or an empty
	 * string when the controller already uses the room name as its own name.
	 *
	 * @param c - the individual light-controller Control object.
	 */
	function getRoomName(c: Control): string {
		const origNameFound = $_('LightControllerV2').includes(c.name);
		const room = controlStore.rooms.get(c.room);
		return origNameFound || !room ? '' : room.name;
	}

	/**
	 * Returns the name of the currently active mood for a light controller,
	 * or 'Manual' when a manual override is active.
	 *
	 * @param c - the individual light-controller Control object.
	 */
	function getStatusName(c: Control): string {
		const moodList = controlStore.getState(c.states?.moodList) as MoodList[];
		const activeMoodsNum = Number(controlStore.getState(c.states?.activeMoodsNum));
		return activeMoodsNum < 0
			? $_('Manual')
			: moodList?.find((item: MoodList) => item.id == activeMoodsNum)?.name ?? '';
	}

	/**
	 * Returns the status colour class for a light controller based on whether
	 * its activeMoodsNum indicates all lights off (778) or some lights on.
	 *
	 * @param c - the individual light-controller Control object.
	 */
	function getStatusColor(c: Control): string {
		const activeMoodsNum = Number(controlStore.getState(c.states?.activeMoodsNum));
		return activeMoodsNum == 778
			? 'text-surface-950 dark:text-surface-50'
			: 'dark:text-primary-500 text-primary-700';
	}

	/**
	 * Toggles the selected state of a light controller in the list.
	 *
	 * @param c - the Control object whose selection to toggle.
	 */
	function selectLight(control: Control): void {
		const index = lightList.findIndex((item: LightItem) => item.uuid == control.uuidAction);
		if (lightList[index]) {
			lightList[index].selected = !lightList[index].selected;
		}
	}

	/**
	 * Returns true when the given light controller is currently selected.
	 */
	function isSelected(c: Control): boolean {
		return lightList.find((item: LightItem) => item.uuid == control.uuidAction)?.selected ?? false;
	}

	/**
	 * Sends an On or Off command to all currently selected light controllers.
	 * 'On' activates the first mood in the list; 'Off' sends mood ID 778.
	 *
	 * @param mood - 'On' to switch on, 'Off' to switch off.
	 */
	function changeLight(mood: string): void {
		lightList.forEach((light) => {
			if (!light.selected) return;
			const c = controlStore.controlList.find((ctrl: Control) => ctrl.uuidAction == light.uuid);
			const moodList = controlStore.getState(c?.states.moodList) as MoodList[];
			const moodCmd = mood === 'On' ? String(moodList[0].id) : mood === 'Off' ? '778' : undefined;
			if (c && moodList && moodCmd) controlStore.setControl(c, 'changeTo/' + moodCmd);
		});
	}

	/**
	 * Opens the scenes sub-dialog for the single selected light controller.
	 * No-op when more or fewer than one controller is selected.
	 */
	function selectScenes(): void {
		if (!scenesEnabled) return;
		const light = lightList.find((item: LightItem) => item.selected);
		const c = controlStore.controlList.find((ctrl: Control) => ctrl.uuidAction == light?.uuid);
		if (c) {
			selectedControl = c;
			selectedControlOptions = { ...DEFAULT_CONTROLOPTIONS, showDialog: true, showControl: false };
		}
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<p class="text-lg text-center {statusColor}">{statusName}</p>
			<div class="grid grid-cols-3 gap-2 mt-2 mb-2">
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50
						rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={() => changeLight('On')}>{$_('On')}</button>
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50
						rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={() => changeLight('Off')}>{$_('Off')}</button>
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm {scenesEnabled ? 'text-surface-800-200 active:bg-primary-500' : 'text-surface-200-800'}
						rounded-lg border border-white/15 hover:border-white/50"
						onclick={selectScenes}>{$_('Scenes')}</button>
			</div>
			<div class="relative flex flex-col items-center justify-center">
				<div class="flex flex-col w-full">
					{#if showScrollTop}
						<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 top-[10px] text-surface-500" transition:fade={{ duration: 300 }}>
							<LbIcon name="chevron-up" height="30" width="30"/>
						</div>
					{/if}
					{#if showScrollBottom}
						<div class="absolute z-10 left-[50%] -translate-x-1/2 -translate-y-1/2 -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}>
							<LbIcon name="chevron-down" height="30" width="30"/>
						</div>
					{/if}
					<div class="flex flex-col space-y-2 overflow-y-auto" {style} bind:this={viewport}
							onscroll={() => parseScroll(windowHeight, viewport)}>
						{#each lightControls as c}
							<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
									{isSelected(c) ? 'bg-surface-200-800' : 'bg-surface-50-950'} px-2 py-2"
									onclick={() => selectLight(c)}>
								<div class="p-2 grid grid-cols-2 w-full items-center h-[60px]">
									<div class="text-left">
										<p class="truncate leading-6 text-base {getStatusColor(c)}">{getControlName(c)}</p>
										<p class="truncate bg-transparent text-xs dark:text-surface-300 text-surface-700">{getRoomName(c)}</p>
									</div>
									<p class="truncate text-right text-base {getStatusColor(c)}">{getStatusName(c)}</p>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}

{#if selectedControl && selectedControlOptions}
	{#key selectedControlOptions}
		<LbLightControllerV2 control={selectedControl} controlOptions={selectedControlOptions}/>
	{/key}
{/if}
