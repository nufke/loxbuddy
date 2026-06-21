<script lang="ts">
	import { page } from '$app/state';
	import { tick, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import { innerHeight } from 'svelte/reactivity/window';
	import type { Control, ControlOptions, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbSwitch from '$lib/components/Switch/LbSwitch.svelte';
	import LbLightDimmer from '$lib/components/LightController/LbLightDimmer.svelte';
	import LbColorPickerV2 from '$lib/components/LightController/LbColorpickerV2.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';

	type Tab = 'scenes' | 'controls' | 'colors';
	const marginPerTab: Record<Tab, number> = { scenes: 300, controls: 200, colors: 200 };

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let controlOpen = $state(untrack(() => controlOptions.showDialog ?? false));
	let passwordOpen = $state(false);
	let selectedTab = $state<Tab>('scenes');
	let viewport: any = $state();
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);
	let id = $state(0);

	let moodList = $derived(controlStore.getState(control.states?.moodList)) as MoodList[];
	let activeMoodsNum = $derived(Number(controlStore.getState(control.states?.activeMoodsNum)));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(activeMoodsNum != 778 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusColor = $derived(activeMoodsNum != 778 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let textName = $derived(getTextName());
	let statusName = $derived(getStatus());
	let selectedItem = $derived(moodList ? moodList.findIndex((item: MoodList) => item.name === statusName) : 0);
	let subControls = $derived(control.subControls ? Object.values(control.subControls) as Control[] : []);
	let subControlsColorPicker = $derived(subControls.filter((c) => c.type === 'ColorPickerV2'));
	let windowHeight = $derived(innerHeight.current || 0);
	let margin = $derived(marginPerTab[selectedTab]);
	let availableHeight = $derived(Math.floor(windowHeight * 0.9) - margin);
	let style = $derived(
		viewport && viewport.scrollHeight > availableHeight
			? `height: ${availableHeight}px`
			: 'height: auto'
	);

	// default id to the first ColorPickerV2 subcontrol; overridden when user selects one from the controls tab
	$effect(() => { id = subControls.findIndex((c: any) => c.type === 'ColorPickerV2'); });
	$effect(() => { parseScroll(windowHeight, viewport); });

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

	/** Returns the active colour class when the given tab is selected. */
	function tabActive(tab: Tab): string {
		return selectedTab === tab ? 'dark:text-primary-500 text-primary-700' : '';
	}

	/**
	 * Resets the scroll viewport and switches to the given tab.
	 * Resetting viewport before switching prevents the old tab's constrained
	 * height from briefly applying to the new tab's content.
	 *
	 * @param tab - the tab to switch to.
	 */
	function switchTab(tab: Tab): void {
		viewport = undefined;
		selectedTab = tab;
	}

	/**
	 * Returns the display name for the control card. Falls back to the room name
	 * when the control carries the generic 'LightControllerV2' default name.
	 */
	function getTextName(): string {
		const origNameFound = $_('LightControllerV2').includes(control.name);
		const room = controlStore.rooms.get(control.room);
		return origNameFound && room ? room.name : control.name;
	}

	/**
	 * Returns the name of the currently active mood, or 'Manual' when the
	 * activeMoodsNum is negative (manual override active).
	 */
	function getStatus(): string {
		if (activeMoodsNum < 0) return $_('Manual');
		if (moodList) {
			const moodObj = moodList.find((item: MoodList) => item.id == activeMoodsNum);
			if (moodObj) return moodObj.name;
		}
		return '';
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
	 * Closes the control dialog and resets the tab to Scenes after the dialog
	 * has finished closing (tick ensures the reset is not visible during exit).
	 */
	async function closeControl(): Promise<void> {
		controlOpen = false;
		await tick();
		selectedTab = 'scenes';
	}

	/** Cancels the password prompt, discarding the pending mood action. */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred mood action, then clears the pending state.
	 *
	 * @param pw - the visualisation password entered by the user.
	 */
	function confirmPassword(pw: string): void {
		appStore.setVisuPw(control.uuidAction, pw);
		pendingAction?.(pw);
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Handles a click that may require a secured-control password.
	 * Uses a cached password when available; otherwise opens the password dialog
	 * and defers the action until the user confirms.
	 *
	 * @param action - callback executed with the resolved password once confirmed.
	 */
	function handleSecuredClick(action: (visuPw?: string) => void): void {
		const cachedVisuPw = appStore.getVisuPw(control.uuidAction);
		if (control.isSecured && cachedVisuPw) { action(cachedVisuPw); return; }
		if (control.isSecured) { pendingAction = action; passwordOpen = true; return; }
		action();
	}

	/**
	 * Advances to the next mood in the list, wrapping around at the end.
	 * Used by the card's + button.
	 */
	function selectNextMood(): void {
		handleSecuredClick((visuPw) => {
			let moodIndex = moodList.findIndex((item: MoodList) => item.id == activeMoodsNum);
			moodIndex = (moodIndex + 1) % moodList.length;
			controlStore.setControl(control, 'changeTo/' + String(moodList[moodIndex].id), visuPw);
		});
	}

	/**
	 * Activates a specific mood by its index in the mood list.
	 * Used by the Scenes tab list buttons.
	 *
	 * @param index - zero-based index into moodList.
	 */
	function selectMoodAt(index: number): void {
		handleSecuredClick((visuPw) => {
			controlStore.setControl(control, 'changeTo/' + String(moodList[index].id), visuPw);
		});
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={textName} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		<div class="flex flex-row items-center gap-2 mr-1">
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); selectNextMood(); }}>
				<LbIcon name="plus"/>
			</button>
		</div>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={textName}>
		{#snippet description()}
			{#if selectedTab === 'scenes'}
				<div class="flex flex-col items-center justify-center">
					<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
						<LbIcon class={iconColor} name={iconName} width="36" height="36"/>
					</div>
					<div class="flex items-center justify-center mt-2">
						<p class="text-lg truncate {statusColor}">{statusName}</p>
					</div>
				</div>
				<div class="flex flex-col relative w-full mt-2">
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
					<div class="flex flex-col overflow-y-auto w-full" {style} bind:this={viewport}
							onscroll={() => parseScroll(windowHeight, viewport)}>
						{#if moodList}
							<div class="grid gap-2">
								{#each moodList as listItem, index}
									<button type="button"
											class="w-full gap-2 btn btn-lg {index === selectedItem ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { e.stopPropagation(); e.preventDefault(); selectMoodAt(index); }}>
										<span class="text-lg">{$_(listItem.name)}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
			{#if selectedTab === 'controls'}
				<div class="flex flex-col relative w-full">
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
					<div class="overflow-y-auto" {style} bind:this={viewport}
							onscroll={() => parseScroll(windowHeight, viewport)}>
						{#each subControls as subControl, index}
							{#if index > 0}<div class="mt-2"></div>{/if}
							{#if subControl.type === 'Switch'}
								<LbSwitch control={subControl} controlOptions={{...DEFAULT_CONTROLOPTIONS, isSubControl: true}}/>
							{/if}
							{#if subControl.type === 'Dimmer'}
								<LbLightDimmer control={subControl} controlOptions={{...DEFAULT_CONTROLOPTIONS, isSubControl: true}}/>
							{/if}
							{#if subControl.type === 'ColorPickerV2'}
								<LbLightDimmer control={subControl} controlOptions={{...DEFAULT_CONTROLOPTIONS, isSubControl: true, action: () => { id = index; switchTab('colors'); }}}/>
							{/if}
						{/each}
					</div>
				</div>
			{/if}
			{#if selectedTab === 'colors' && subControlsColorPicker.length}
				<div class="relative w-full">
					<div class="container">
						{#if subControls[id]?.type === 'Dimmer' || subControls[id]?.type === 'ColorPickerV2'}
							<LbLightDimmer control={subControls[id]} controlOptions={{...DEFAULT_CONTROLOPTIONS, isSubControl: true}}/>
							<LbColorPickerV2 control={subControls[id]}/>
						{/if}
					</div>
				</div>
			{/if}
			<div class="relative w-full mt-6 mb-2">
				<div class="grid max-w-lg {subControlsColorPicker.length ? 'grid-cols-3' : 'grid-cols-2'}">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('scenes')}"
							onclick={() => switchTab('scenes')}>
						<LbIcon name="lightbulb"/>
						<span class="mt-1 text-xs">{$_('Scenes')}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('controls')}"
							onclick={() => switchTab('controls')}>
						<LbIcon name="sliders-horizontal"/>
						<span class="mt-1 text-xs">{$_('Controls')}</span>
					</button>
					{#if subControlsColorPicker.length}
						<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('colors')}"
								onclick={() => switchTab('colors')}>
							<LbIcon name="color-palette" fill="white" width="24" height="24"/>
							<span class="mt-1 text-xs">{$_('Colors')}</span>
						</button>
					{/if}
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>
