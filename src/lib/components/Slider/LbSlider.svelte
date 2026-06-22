<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);

	let min = $derived(Number(control.details?.min));
	let max = $derived(Number(control.details?.max));
	let step = $derived(Number(control.details?.step));
	let position = $derived(Number(controlStore.getState(control.states?.value)));

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let statusName = $derived(fmt.sprintf(control.details?.format, position));

	/**
	 * Steps the slider position up or down by one `step` increment and sends
	 * the new value to the miniserver. Clamps silently at `min` and `max`
	 * without sending a command when the limit is already reached.
	 *
	 * @param isUp   - Multiplier for the step direction: 1 increments (default), -1 decrements.
	 * @param visuPw - Optional visualisation password for secured controls.
	 */
	function updatePosition(isUp: number = 1, visuPw?: string): void {
		let pos = position + step * isUp; // TODO resolve rounding errors
		if (pos > max) {
			pos = max;
			return;
		}
		if (pos < min) {
			pos = min;
			return;
		}
		controlStore.setControl(control, String(pos), visuPw);
	}

	/**
	 * Sends an absolute slider position to the miniserver.
	 * Accepts either a number or a single-element array (the format returned
	 * by the Skeleton `Slider` component's `onValueChange` event).
	 *
	 * @param position - The new position value, use the first element in case of a list
	 */
	function setPostion(position: any): void {
		let pos: number = position.length ? position[0] : position; // skeleton Slider returns array, select first one
		controlStore.setControl(control, String(pos)); // TODO visuPw
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

<LbControl {controlOptions} {iconName} {statusName}
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
				<LbIcon name={iconName} width="36" height="36"/>
			</div>
			<p class="text-lg dark:text-surface-300 text-surface-700">{statusName}</p>
		</div>
		<div class="container mt-3 flex flex-col justify-center items-center p-1 pb-3">
			<!-- TODO slider thumbSize not working??-->
			<Slider thumbSize={{ width: 20, height: 20}} 
				value={[position]}
				min={min}
				max={max}
				step={step}
				onValueChange={(e: any) => setPostion(e.value)}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Range />
					</Slider.Track>
					<Slider.Thumb index={0}  >
						<Slider.HiddenInput />
					</Slider.Thumb>
				</Slider.Control>
				<Slider.MarkerGroup>
					<Slider.Marker value={min} />
					<Slider.Marker value={max} />
				</Slider.MarkerGroup>
			</Slider>
		</div>
		{/snippet}
	</LbDialog>
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>
