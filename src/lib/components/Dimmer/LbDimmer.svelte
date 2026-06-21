<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbSimpleSlider from '$lib/components/Common/LbSimpleSlider.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let locked = $state(false); // TODO lock dimmer

	let min = $derived(Number(controlStore.getState(control.states?.min)) || 0);
	let max = $derived(Number(controlStore.getState(control.states?.max)) || 100);
	let step = $derived(Number(controlStore.getState(control.states?.step)) || 1);
	let position = $derived(Number(controlStore.getState(control.states?.position)) || 0);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(position > 0 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusName = $derived(String(position) + ' %');
	let statusColor = $derived(position > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');

	/**
	 * Increments or decrements the dimmer position by one step, clamped to [min, max].
	 * Sends the updated position to the control store.
	 *
	 * @param isUp - +1 to increase, -1 to decrease.
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	function updatePosition(isUp: number = 1, visuPw?: string): void {
		let pos = position + step * isUp;
		if (pos > max) { pos = max; return; }
		if (pos < min) { pos = min; return; }
		controlStore.setControl(control, String(pos), visuPw);
	}

	/**
	 * Sets the dimmer to an absolute position as reported by the slider component.
	 *
	 * @param pos - value or single-element array from the Skeleton Slider onValueChange event.
	 */
	function setPosition(pos: any): void {
		let p: number = pos.length ? pos[0] : pos;
		controlStore.setControl(control, String(p)); // TODO visuPw
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
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		<div class="flex flex-row items-center gap-2 mr-1">
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => updatePosition(-1, pw)); }}>
				<LbIcon name="minus"/>
			</button>
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => updatePosition(1, pw)); }}>
				<LbIcon name="plus"/>
			</button>
		</div>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-3 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon class={iconColor} name={iconName} width="36" height="36"/>
				</div>
				<p class="text-lg {statusColor}">{statusName}</p>
			</div>
			<div class="container mt-3 flex justify-center items-center p-1 pb-3">
				<LbSimpleSlider classes='dimmer' orientation='vertical'	{min} {max} {step} {locked} value={position}
					onValueChange={(e: any) => setPosition(e.value)}/>
			</div>
			<div class="w-full mt-1 grid grid-cols-2 gap-2">
				<button type="button"
						class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => updatePosition(-1, pw)); }}>
					<LbIcon name="minus"/>
				</button>
				<button type="button"
						class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => updatePosition(1, pw)); }}>
					<LbIcon name="plus"/>
				</button>
				<button type="button"
						class="col-span-2 w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); handleSecuredClick((pw) => controlStore.setControl(control, position === 0 ? 'on' : 'off', pw)); }}>
					<span class="text-lg">{position === 0 ? $_('Switch on') : $_('Switch off')}</span>
				</button>
			</div>
		{/snippet}
	</LbDialog>
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>
