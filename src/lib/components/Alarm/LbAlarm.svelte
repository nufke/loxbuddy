<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);

	let armed = $derived(Number(controlStore.getState(control.states?.armed)) === 1);
	let disabledMove = $derived(Number(controlStore.getState(control.states?.disabledMove)) === 1);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(armed ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusColor = $derived(armed ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let statusName = $derived(
		(armed ? $_('Armed') : $_('Disarmed')) +
		(armed && !disabledMove ? ' (' + $_('Presence detection on') + ')' : '')
	);

	/**
	 * Sends an arm or disarm command. When arming, the presence detection state
	 * is appended as a suffix (1 = enabled, 0 = disabled).
	 *
	 * @param delay - true to use delayed arming ('delayedon/'), false for immediate ('on/').
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	function setUnsetAlarm(delay: boolean, visuPw?: string): void {
		let cmd = armed ? 'off' : (delay ? 'delayedon/' : 'on/');
		cmd += armed ? '' : (disabledMove ? '0' : '1');
		controlStore.setControl(control, cmd, visuPw);
	}

	/**
	 * Toggles presence movement detection.
	 * Sends 'dismv/0' to enable detection (checked=true) or 'dismv/1' to disable it.
	 *
	 * @param e - onCheckedChange event from the Switch component.
	 */
	function setUnsetMovement(e: any, visuPw?: string): void {
		controlStore.setControl(control, 'dismv/' + (e.checked ? '0' : '1'), visuPw);
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
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

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
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => setUnsetAlarm(false, pw)); }}>
						<span class="text-lg">{armed ? $_('Disarm alarm') : $_('Arm alarm')}</span>
					</button>
					{#if !armed}
						<button type="button"
								class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => setUnsetAlarm(true, pw)); }}>
							<span class="text-lg">{$_('Arming delayed')}</span>
						</button>
					{/if}
					<button class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => e.stopPropagation()}>
						<div class="flex w-full justify-between items-center">
							<span class="truncate text-lg">{$_('Presence detection')}</span>
							<Switch checked={!disabledMove} onCheckedChange={(e) => handleSecuredClick((pw) => setUnsetMovement(e, pw))}>
								<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
									<Switch.Thumb />
								</Switch.Control>
								<Switch.HiddenInput />
							</Switch>
						</div>
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
