<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions, ScreenItem } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbJalousie from '$lib/components/Jalousie/LbJalousie.svelte';
	import LbJalousieIcon from '$lib/components/Jalousie/LbJalousieIcon.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';
	import { scrollMarkers } from '$lib/actions/scrollMarkers';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const margin = 200;
	let pendingAction: ((visuPw?: string) => void) | null = null;

	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let screenSelected = $state(false);
	let selectedControl: Control | undefined = $state();
	let selectedControlOptions: ControlOptions | undefined = $state();
	let screenList = $derived(control.details?.controls) as ScreenItem[];
	let screenUuid = $derived(control.details?.controls.map((item: ScreenItem) => item.uuid));

	let screenControls = $derived(controlStore.controlList.filter(
		(c: Control) => screenUuid.indexOf(c.uuidAction) > -1
	));

	let screensClosed = $derived(
		screenControls.filter((c: Control) => (Number(controlStore.getState(c.states?.position)) * 100 > 1) && !Number(controlStore.getState(c.states?.locked) ?? 0))
	);

	let screensOpen = $derived(
		screenControls.filter((c: Control) => (Number(controlStore.getState(c.states?.position)) * 100 < 1) && !Number(controlStore.getState(c.states?.locked) ?? 0))
	);

	let screensLocked = $derived(
		screenControls.filter((c: Control) => Number(controlStore.getState(c.states?.locked)) == 1)
	);

	let selectedScreenCount = $derived(screenList.filter((item) => item.selected == true).length);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let statusName = $derived(getActiveScreens(screensClosed, screensOpen, screensLocked));
	let statusColor = $derived(screensClosed.length + screensLocked.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');

	$effect(() => { screenList.forEach((item) => item.selected = false); });

	/**
	 * Builds a localised status string summarising how many screens are
	 * closed, open, and locked.
	 *
	 * @param closed - list of Controls where screens are closed
	 * @param open - list of Controls where screens are open
	 * @param locked - list of Controls where screens are locked
	 * @returns e.g. "3 closed 1 open 2 locked", or empty string when all idle.
	 */
	function getActiveScreens(closed: Control[], open: Control[], locked: Control[]): string {
		let status = '';
		status += closed.length > 0 ? `${closed.length} ${$_('Closed').toLowerCase()}` : '';
		status += open.length > 0 ? (closed.length > 0 ? ',' : '') + ` ${open.length} ${$_('Open').toLowerCase()}` : '';
		status += locked.length > 0 ? (closed.length > 0 || open.length > 0 ? ',' : '') + ` ${locked.length} ${$_('Locked').toLowerCase()} ` : '';
		return status;
	}

	/**
	 * Toggles the selection state of a screen row and updates screenSelected
	 * to reflect whether exactly one screen is now selected.
	 *
	 * @param c - the jalousie control whose row was tapped.
	 */
	function selectScreen(c: Control): void {
		const index = screenList.findIndex((item) => item.uuid == c.uuidAction);
		if (screenList[index]) screenList[index].selected = !screenList[index].selected;
		screenSelected = selectedScreenCount == 1;
	}

	/**
	 * Returns whether the given control's row is currently selected.
	 *
	 * @param c - the jalousie control to check.
	 */
	function isSelected(c: Control): boolean {
		const screen = screenList.find((item) => item.uuid == c.uuidAction);
		return screen?.selected || false;
	}

	/**
	 * Opens the individual LbJalousie dialog for the single selected screen.
	 * Does nothing when more than one (or zero) screens are selected.
	 */
	function selectScreenOptions(): void {
		if (!screenSelected) return;
		const screen = screenList.find((item) => item.selected);
		const ctrl = controlStore.controlList.find((c: Control) => c.uuidAction == screen?.uuid);
		if (ctrl) {
			selectedControl = ctrl;
			selectedControlOptions = { ...DEFAULT_CONTROLOPTIONS, showDialog: true, showControl: false };
		}
	}

	/**
	 * Returns tue when the automatic sun-position mode is active for the given control,
	 * and false otherwise
	 *
	 * @param c - the jalousie control to query.
	 */
	function isAutoActive(c: Control): boolean {
		return Number(controlStore.getState(c.states?.autoActive)) == 1;
	}

	/**
	 * Returns true when the given jalousie control is locked, and false otherwise
	 *
	 * @param c - the jalousie control to query.
	 */
	function isLocked(c: Control): boolean {
		return Number(controlStore.getState(c.states?.locked)) == 1;
	}

	/**
	 * Returns the Tailwind colour class for the position text in a screen row.
	 * Primary when the screen is more than 1% closed, surface otherwise.
	 *
	 * @param c - the jalousie control to query.
	 */
	function getStatusColor(c: Control): string {
		return Math.round(Number(controlStore.getState(c.states?.position)) * 100) > 1
			? 'dark:text-primary-500 text-primary-700'
			: 'text-surface-950 dark:text-surface-50';
	}

	/**
	 * Returns the display name for a screen row. When the control has the
	 * default Jalousie name, the room name is shown instead.
	 *
	 * @param c - the jalousie control to name.
	 */
	function getControlName(c: Control): string {
		const origNameFound = $_('Jalousie').includes(c.name);
		const room = controlStore.rooms.get(c.room);
		return origNameFound && room ? room.name : c.name;
	}

	/**
	 * Returns the room name subtitle for a screen row, or empty string when
	 * the control has a custom name (which already identifies it uniquely).
	 *
	 * @param c - the jalousie control to query.
	 */
	function getRoomName(c: Control): string {
		const origNameFound = $_('Jalousie').includes(c.name);
		const room = controlStore.rooms.get(c.room);
		return origNameFound || !room ? '' : room.name;
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
	 * Closes the control dialog and resets all screen selections and the
	 * individual jalousie sub-dialog state.
	 */
	function closeControl(): void {
		screenList.forEach((item) => item.selected = false);
		screenSelected = false;
		selectedControl = undefined;
		selectedControlOptions = undefined;
		controlOpen = false;
	}

	/**
	 * Cancels the password prompt, discarding the pending screen action.
	 */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred screen action with the supplied password,
	 * then clears the pending state.
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
	 * If a cached password exists it is used directly; otherwise the password
	 * dialog is opened and the action is deferred until the user confirms.
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
	 * Sends a jalousie action command to all currently selected screens,
	 * prompting for a password first if the control is secured.
	 * Resolves selected UUIDs against screenControls to obtain the Control
	 * objects required by controlStore.setControl.
	 *
	 * @param action - Loxone command string, e.g. 'FullDown', 'FullUp', 'shade', 'stop'.
	 */
	function screenAction(action: string): void {
		const selectedUuids = new Set(screenList.filter((s) => s.selected).map((s) => s.uuid));
		handleSecuredClick((visuPw) => {
			screenControls
				.filter((control) => selectedUuids.has(control.uuidAction))
				.forEach((control) => controlStore.setControl(control, action, visuPw));
		});
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet actions()}
		<div class="flex flex-row items-center gap-2 mr-1">
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullDown'); }}>
				<LbIcon name="chevron-down"/>
			</button>
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullUp'); }}>
				<LbIcon name="chevron-up"/>
			</button>
		</div>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<p class="mb-4 -mt-2 text-lg text-center {screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">{statusName}</p>
				<div class="container grid grid-cols-5 gap-2 mb-2">
					<button type="button" class="btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/10 hover:border-white/50 active:bg-primary-500"
							onclick={() => screenAction('FullDown')}>
						<span class="w-[32px] flex justify-center items-center">
							<LbIcon name="chevron-down"/>
						</span>
					</button>
					<button type="button" class="btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/10 hover:border-white/50 active:bg-primary-500"
							onclick={() => screenAction('FullUp')}>
						<span class="w-[32px] flex justify-center items-center">
							<LbIcon name="chevron-up"/>
						</span>
					</button>
					<button type="button" class="btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/10 hover:border-white/50 active:bg-primary-500"
							onclick={() => screenAction('shade')}>
						<span class="w-[32px] flex justify-center items-center">
							<LbIcon name="blinds"/>
						</span>
					</button>
					<button type="button" class="btn btn-lg h-[48px] bg-surface-50-950 shadow-sm text-surface-950-50 rounded-lg border border-white/10 hover:border-white/50 active:bg-primary-500"
							onclick={() => screenAction('stop')}>
						<span class="w-[32px] flex justify-center items-center">
							<LbIcon name="octagon-minus"/>
						</span>
					</button>
					<button type="button" class="btn btn-lg h-[48px] bg-surface-50-950 shadow-sm {screenSelected ? 'text-surface-800-200 active:bg-primary-500' : 'text-surface-200-800'} rounded-lg border border-white/10 hover:border-white/50"
							onclick={selectScreenOptions}>
						<span class="w-[32px] flex justify-center items-center">
							<LbIcon name="settings"/>
						</span>
					</button>
				</div>
				<div class="relative flex flex-col w-full">
					<div class="flex flex-col overflow-y-auto space-y-2" use:scrollMarkers={margin}>
						{#each screenControls as c}
							<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/10 hover:border-white/50
									{isSelected(c) ? 'bg-surface-200-800' : 'bg-surface-50-950'} px-2 py-2"
									onclick={() => selectScreen(c)}>
								<div class="relative flex truncate w-full">
									<div class="p-2 grid grid-cols-2 w-full justify-between items-center h-[60px]">
										<div class="justify-self-start truncate">
											<p class="leading-6 truncate text-base {getStatusColor(c)}">{getControlName(c)}</p>
											<p class="truncate text-left text-xs dark:text-surface-300 text-surface-700">{getRoomName(c)}</p>
										</div>
										<div class="relative inline-flex h-12 p-0 justify-self-end">
											<LbJalousieIcon control={c} width="32" height="32"/>
											{#if c.details?.isAutomatic || isLocked(c)}
												<div class="absolute -right-[2px] inline-flex items-center justify-center w-[20px] h-[20px] rounded-full {isSelected(c) ? 'bg-surface-200-800' : 'bg-surface-50-950'}">
													<LbIcon class={isLocked(c) ? 'text-warning-500' : isAutoActive(c) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-500'}
														name={isLocked(c) ? 'lucide:lock-keyhole' : 'bold_loxbuddy:letter-a'} height="12" width="12"/>
												</div>
											{/if}
										</div>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}

<!-- Individual jalousie dialog, opened via settings button when exactly one screen is selected -->
{#if selectedControl && selectedControlOptions}
	{#key selectedControlOptions}
		<LbJalousie control={selectedControl} controlOptions={selectedControlOptions}/>
	{/key}
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>
