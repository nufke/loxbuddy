<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
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

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let resetSwitch = $state(false); // remounts switch to revert visual state when password is cancelled

	let active = $derived(Number(controlStore.getState(control.states?.active)) === 1);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(active ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusColor = $derived(active ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let statusName = $derived(active ? $_('On') : $_('Off'));
	let toggleLabel = $derived(active ? $_('Switch off') : $_('Switch on'));

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; } // custom action overrides dialog
		if (!iconName.length) return; // no dialog at subcontrol level (no icon)
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
	 * Sends an on/off command for the control to the control store.
	 *
	 * @param checked - true to switch on, false to switch off.
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	function toggle(checked: boolean, visuPw?: string): void {
		controlStore.setControl(control, checked ? 'on' : 'off', visuPw);
	}

	/**
	 * Handles a toggle request with optional secured-control protection.
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
	 * (e.g. to revert a switch that was visually toggled) and discarding the
	 * pending action.
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
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		{#key resetSwitch}
			<button class="flex items-center justify-center" onclick={(e) => { e.stopPropagation() }}> <!-- workaround: stop card click propagation for switch -->
				<Switch checked={active} onCheckedChange={(e) => handleSecuredClick((pw) => toggle(e.checked, pw), () => { resetSwitch = !resetSwitch; })}>
					<Switch.Control class="w-12 h-8 mr-1 preset-filled-surface-400-600 data-[state=checked]:preset-filled-primary-500">
						<Switch.Thumb />
					</Switch.Control>
					<Switch.HiddenInput />
				</Switch>
			</button>
		{/key}
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
				<div class="w-full mt-3">
					<button type="button"
							class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => toggle(!active, pw)); }}>
						<span style="font-size:18px">{toggleLabel}</span>
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
