<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { scrollMarkers } from '$lib/actions/scrollMarkers';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';

	const margin = 180;

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let controlOpen = $state(false);
	let passwordOpen = $state(false);

	let radioList = $derived(
		Object.entries(control.details?.outputs).map((entry) => ({
			id: Number(entry[0]),
			name: String(entry[1])
		})).concat([{ id: 0, name: control.details?.allOff }])
	);
	let selectedRadio = $derived(Number(controlStore.getState(control.states?.activeOutput)));
	let radioIndex = $derived(radioList.find((item) => item.id == selectedRadio));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(selectedRadio ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusName = $derived(radioIndex ? radioIndex.name : 'unknown');
	let statusColor = $derived(selectedRadio ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
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

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}

	/** Cancels the password prompt, discarding the pending station action. */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred station action, then clears the pending state.
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
	 * Sends the station command for the given station id to the miniserver.
	 * Station id 0 maps to the 'reset' command (all off).
	 *
	 * @param id - the station id from radioList.
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	function sendCommand(id: number, visuPw?: string): void {
		controlStore.setControl(control, id === 0 ? 'reset' : String(id), visuPw);
	}

	/**
	 * Steps to the next or previous station, wrapping around at either end.
	 * Used by the card's − and + buttons.
	 *
	 * @param step - +1 for next station, -1 for previous.
	 */
	function stepRadio(step: number): void {
		handleSecuredClick((visuPw) => {
			let idx = radioList.findIndex((item) => item.id === selectedRadio);
			idx = (idx + step + radioList.length) % radioList.length;
			sendCommand(radioList[idx].id, visuPw);
		});
	}

	/**
	 * Selects a specific station by its id.
	 * Used by the dialog station list buttons.
	 *
	 * @param id - the station id from radioList.
	 */
	function selectRadioAt(id: number): void {
		handleSecuredClick((visuPw) => sendCommand(id, visuPw));
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		<div class="flex flex-row items-center gap-2 mr-1">
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); stepRadio(-1); }}>
				<LbIcon name="minus"/>
			</button>
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); stepRadio(1); }}>
				<LbIcon name="plus"/>
			</button>
		</div>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
					<LbIcon class={iconColor} name={iconName} width="36" height="36"/>
				</div>
				<div class="flex items-center justify-center mt-2">
					<p class="text-lg truncate {statusColor}">{statusName}</p>
				</div>
			</div>
			<div class="flex flex-col relative w-full mt-2">
				<div class="flex flex-col overflow-y-auto w-full" use:scrollMarkers={margin}>
					<div class="grid gap-2">
						{#each radioList as listItem}
							<button type="button"
									class="w-full gap-2 btn btn-lg {listItem.id === selectedRadio ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); selectRadioAt(listItem.id); }}>
								<span class="text-lg">{$_(listItem.name)}</span>
							</button>
						{/each}
					</div>
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
