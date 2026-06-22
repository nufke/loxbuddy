<script lang="ts">
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	/*
		deactivationDelay:
		 0: output turned off
		-1: output permanently on
		other: count down from deactivationDelayTotal
	*/

	let deactivationDelay = $derived(Number(controlStore.getState(control.states?.deactivationDelay)) || 0);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let active = $derived(deactivationDelay !== 0);
	let iconColor = $derived(active ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let badgeIconName = $derived(deactivationDelay > 0 ? 'Timer' : '');
	let badgeIconColor = $derived(deactivationDelay > 0 ? 'dark:bg-primary-500 bg-primary-700' : '');
	let statusName = $derived(formatTime(deactivationDelay));
	let statusColor = $derived(active ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');

	// Dialog button labels and commands vary by deactivationDelay state
	let button1Label = $derived(
		deactivationDelay === 0 ? $_('Turn on') :
		(deactivationDelay === -1 ? $_('Turn off') : $_('Switch on permanently'))
	);

	let button1Command = $derived(deactivationDelay === -1 ? 'off' : 'on');
	let button2Label = $derived(deactivationDelay === 0 ? $_('Start timer') : $_('Turn off'));
	let button2Command = $derived(deactivationDelay === 0 ? 'pulse' : 'off');

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
	 * Closes the control dialog and resets any in-progress password prompt,
	 * discarding the pending action and cancel callback.
	 */
	function closeControl(): void {
		controlOpen = false;
		passwordOpen = false;
		pendingAction = null;
		pendingCancel = null;
	}

	/**
	 * Handles a click that may require a secured-control password.
	 * If the control is secured and a cached password exists it is used
	 * directly. If no cached password is available the password dialog is
	 * opened and the action is deferred until the user confirms.
	 *
	 * @param action - callback executed with the resolved password once confirmed.
	 * @param onCancel - optional callback invoked if the user cancels the password prompt.
	 */
	function handleSecuredClick(action: (visuPw?: string) => void, onCancel?: () => void): void {
		const cachedVisuPw = appStore.getVisuPw(control.uuidAction);
		if (control.isSecured && cachedVisuPw) { action(cachedVisuPw); return; }
		if (control.isSecured) { pendingAction = action; pendingCancel = onCancel ?? null; passwordOpen = true; return; }
		action();
	}

	/**
	 * Cancels the password prompt, invoking the registered cancel callback
	 * and discarding the pending action.
	 */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingCancel?.();
		pendingAction = null;
		pendingCancel = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred action with the supplied password, then
	 * clears the pending state.
	 *
	 * @param pw - the visualisation password entered by the user.
	 */
	function confirmPassword(pw: string): void {
		appStore.setVisuPw(control.uuidAction, pw);
		pendingAction?.(pw);
		passwordOpen = false;
		pendingAction = null;
		pendingCancel = null;
	}

	/**
	 * Sends a command string to the control store.
	 *
	 * @param command - the Loxone command string (e.g. 'on', 'off', 'pulse').
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	function sendCommand(command: string, visuPw?: string): void {
		controlStore.setControl(control, command, visuPw);
	}

	/**
	 * Formats a deactivation delay value into a human-readable string.
	 * Returns 'On' for −1 (permanently on), 'Off' for 0, or a mm:ss
	 * countdown string for positive values.
	 *
	 * @param delay - the raw deactivationDelay state value.
	 * @returns formatted time string or localised on/off label.
	 */
	function formatTime(delay: number): string {
		if (delay > 0) {
			const minutes = Math.floor(delay / 60);
			const seconds = delay - minutes * 60;
			const time = (minutes > 0) ? String(minutes) + ' min ' : '';
			return time + String(seconds) + ' s';
		}
		return (delay === -1) ? $_('On') : $_('Off');
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {badgeIconName} {badgeIconColor}
	{statusName} {statusColor} textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
				onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => sendCommand('pulse', pw)); }}>
			<LbIcon name="timer-2" class="dark:text-surface-50 text-surface-950"/>
		</button>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon class={iconColor} name={iconName} width="36" height="36"/>
				</div>
				<p class="text-lg {statusColor}">{statusName}</p>
				<div class="w-full mt-3 flex flex-col gap-2">
					<button type="button"
							class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => sendCommand(button1Command, pw)); }}>
						<span class="text-lg">{button1Label}</span>
					</button>
					{#if deactivationDelay !== -1}
						<button type="button"
								class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => sendCommand(button2Command, pw)); }}>
							<span class="text-lg">{button2Label}</span>
						</button>
					{/if}
					{#if deactivationDelay > 0}
						<button type="button"
								class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => sendCommand('pulse', pw)); }}>
							<span class="text-lg">{$_('Restart timer')}</span>
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
