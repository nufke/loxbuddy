<script lang="ts">
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbMap from '$lib/components/Common/LbMap.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let pendingCancel: (() => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);

	let url = $derived(control.details?.url);
	let urlHd = $derived(control.details?.urlHd);
	let httpUrl = $derived((urlHd || url).match(/^https?:\/\/(.*)/)[1]); // strip protocol; urlHd takes priority
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let isMap = $derived(
		httpUrl.match(/openstreetmap.org\/#map=.*\/.*\/.*/) ||
		httpUrl.match(/openstreetmap.org\/\?mlat=.*&mlon=.*#map/)
	);

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
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
	 * Opens the webpage URL in a new browser tab with secured-control
	 * protection if required. Uses the full URL including protocol.
	 */
	function openWebPage(): void {
		handleSecuredClick(() => window.open(url || urlHd, '_blank'));
	}
</script>

<LbControl {controlOptions} {iconName} statusName={httpUrl}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		{#if !isMap}
			<button type="button"
					class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); openWebPage(); }}>
				<LbIcon name="square-arrow-out-up-right" height="28" width="28"/>
			</button>
		{/if}
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			{#if isMap}
				<div class="relative w-full">
					<LbMap map={httpUrl}/>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center">
					<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
						<LbIcon name={iconName} width="36" height="36"/>
					</div>
					<p class="w-full text-center text-lg truncate">{httpUrl}</p>
					<div class="w-full mt-3">
						<button type="button"
								class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); openWebPage(); }}>
							<span>{$_('Open link')}</span>
						</button>
					</div>
				</div>
			{/if}
		{/snippet}
	</LbDialog>
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>
