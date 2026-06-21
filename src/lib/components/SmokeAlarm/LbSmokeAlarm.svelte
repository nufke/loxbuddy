<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';

	type Tab = 'status' | 'service';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let selectedTab = $state<Tab>('status');
	let serviceTime = $state(1);
	let hours = $state(0);
	let minutes = $state(0);

	let timeServiceMode = $derived(Number(controlStore.getState(control.states?.timeServiceMode)));
	let level = $derived(timeServiceMode > 0 ? 99 : Number(controlStore.getState(control.states?.level)));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let statusName = $derived(getStatusName(level));
	let statusColor = $derived(getStatusColor(level));

	// show remaining service time; cleared automatically when timeServiceMode drops to 1 or below
	let duration = $derived(
		timeServiceMode > 1 ?
			' (' + (timeServiceMode > 60 ? Math.floor(timeServiceMode / 60) + ' min)' : timeServiceMode + ' sec)') : '');

	/** Returns the localised status label for the given alarm level. */
	function getStatusName(lvl: number): string {
		switch (lvl) {
			case 0: return 'Everything OK';
			case 1: return 'Pre-alarm active';
			case 2: return 'Main alarm active';
			case 99: return 'Alarm suppression enabled';
			default: return '';
		}
	}

	/** Returns the colour class for the given alarm level (primary / red / blue). */
	function getStatusColor(lvl: number): string {
		switch (lvl) {
			case 0: return 'dark:text-primary-500 text-primary-700';
			case 1:
			case 2: return 'text-red-500 fill-red-500';
			case 99: return 'text-blue-500 fill-blue-500';
			default: return '';
		}
	}

	/** Returns the active colour class when the given tab is selected. */
	function tabActive(tab: Tab): string {
		return selectedTab === tab ? 'dark:text-primary-500 text-primary-700' : '';
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
	 * Closes the control dialog and resets the tab to Status after the dialog
	 * has finished closing (tick ensures the reset is not visible during exit).
	 */
	async function closeControl(): Promise<void> {
		controlOpen = false;
		await tick();
		selectedTab = 'status';
	}

	/** Cancels the password prompt, discarding the pending service action. */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred service action, then clears the pending state.
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

	/** Stops the active service mode suppression. */
	function stopService(): void {
		handleSecuredClick((visuPw) => controlStore.setControl(control, 'servicemode/0', visuPw));
	}

	/**
	 * Starts alarm suppression for the duration configured via the timer UI.
	 * No-op when serviceTime is zero (both hours and minutes are at zero).
	 */
	function startService(): void {
		if (serviceTime <= 0) return;
		handleSecuredClick((visuPw) => controlStore.setControl(control, 'servicemode/' + String(serviceTime), visuPw));
	}

	/**
	 * Increments hours and/or minutes by the given deltas, wrapping at 24h / 60m,
	 * then recomputes serviceTime in seconds.
	 *
	 * @param h - hour delta (+1 or -1).
	 * @param m - minute delta (+1 or -1).
	 */
	function setTimer(h: number, m: number): void {
		hours += h;
		hours = hours > 23 ? 0 : hours < 0 ? 23 : hours;
		minutes += m;
		minutes = minutes > 59 ? 0 : minutes < 0 ? 59 : minutes;
		serviceTime = hours * 3600 + minutes * 60;
	}
</script>

<LbControl {controlOptions} {iconName} iconColor={statusColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name} width="w-[380px]">
		{#snippet description()}
			{#if selectedTab === 'status'}
				<div class="truncate justify-center text-center mb-2">
					{#if statusName}
						<p class="text-lg truncate {statusColor}">{$_(statusName)}{duration}</p>
					{/if}
				</div>
			{/if}
			{#if selectedTab === 'service'}
				<div class="justify-center text-center">
					<p class="h5 text-lg dark:text-surface-300 text-surface-700">{$_('Duration servicemode')} ({$_('Hours').toLocaleLowerCase()} : {$_('Minutes').toLocaleLowerCase()})</p>
				</div>
				<div class="w-[100px] m-auto justify-center text-center">
					<div class="grid grid-cols-3">
						<div class="-mb-1"><button class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(1, 0)}><LbIcon name="chevron-up"/></button></div>
						<div class="-mb-1"></div>
						<div class="-mb-1"><button class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(0, 1)}><LbIcon name="chevron-up"/></button></div>
						<div>{hours}</div>
						<div>:</div>
						<div>{minutes}</div>
						<div><button type="button" class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(-1, 0)}><LbIcon name="chevron-down"/></button></div>
						<div></div>
						<div><button type="button" class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(0, -1)}><LbIcon name="chevron-down"/></button></div>
					</div>
				</div>
				<div class="m-3">
					<button type="button" class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); timeServiceMode > 0 ? stopService() : startService(); }}>
						<span class="text-lg">{$_(timeServiceMode > 0 ? 'Stop alarm suppression' : 'Start alarm suppression')}</span>
					</button>
				</div>
			{/if}
			<div class="sticky bottom-0 left-0 w-full h-16 pt-4">
				<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('status')}"
							onclick={() => (selectedTab = 'status')}>
						<LbIcon name="info"/>
						<span class="mt-1 text-xs">{$_('Status')}</span>
					</button>
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {tabActive('service')}"
							onclick={() => (selectedTab = 'service')}>
						<LbIcon name="wrench"/>
						<span class="mt-1 text-xs">{$_('Service mode')}</span>
					</button>
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
