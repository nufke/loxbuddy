<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, AlarmClockEntries, AlarmClockEntry } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbInPlaceEdit from '$lib/helpers/in-place-ediit.svelte';
	import LbDateTimePicker from '$lib/components/Common/LbDateTimePicker.svelte';
	import LbAlarmClockDayPicker from '$lib/components/AlarmClock/LbAlarmClockDayPicker.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { format } from 'date-fns';
	import { _ } from 'svelte-i18n';
	import { slide } from 'svelte/transition';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const margin = 200;

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let viewport: any = $state();
	let selectedEntry = $state(0);
	let prevEntryListLength = $state(0);

	let dateTimeOpen = $state(false);

	let entryObj = $derived(controlStore.getState(control.states?.entryList) as AlarmClockEntries);
	let entryIds = $derived(entryObj ? Object.keys(entryObj).map((n) => Number(n)) : []);
	let entryList = $derived(entryObj ? Object.values(entryObj) : []);
	let alarms = $derived(entryObj ? Object.values(entryObj).filter((entry) => entry.isActive) : []);
	let nextEntryTime = $derived(Number(controlStore.getState(control.states?.nextEntryTime)) || 0);
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(alarms.length ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusName = $derived(alarms.length ? getAlarmTime() : $_('No alarm time active'));
	let statusColor = $derived(alarms.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let windowHeight = $derived(innerHeight.current || 0);
	let size = $derived(windowHeight * 0.9 - (viewport?.clientHeight ?? 0) - margin);
	let style = $derived(
		size > 0 && viewport?.clientHeight === viewport?.scrollHeight
			? 'height: 100%'
			: 'height: ' + ((viewport?.clientHeight ?? 0) + size) + 'px'
	);

	// scroll to bottom and recompute height after a new entry is added
	$effect(() => {
		if (entryList.length) {
			tick().then(() => {
				if (viewport && prevEntryListLength !== entryIds.length) {
					viewport.scroll({ top: viewport.scrollHeight, behavior: 'smooth' });
					prevEntryListLength = entryIds.length;
				}
			});
		}
	});

	/**
	 * Formats the next active alarm time as a localised date/time string,
	 * adjusting for the Loxone time reference (1-1-2009) and DST.
	 *
	 * @returns localised date/time string, e.g. 'Jun 21, 2026, 7:00 AM'.
	 */
	function getAlarmTime(): string {
		let date = new Date(nextEntryTime * 1000 + utils.loxTimeRef);
		if (utils.isDST(date)) date = new Date(nextEntryTime * 1000 + utils.loxTimeRef - 3600000);
		return format(date, 'PPP p');
	}

	/**
	 * Returns the alarm time of the currently selected entry as a Date, or
	 * `null` when no entry is selected. Used to seed the time picker dialog.
	 *
	 * @returns Date for the selected entry's alarm time, or `null`.
	 */
	function getTimerDate(): Date | null {
		return entryList[selectedEntry] ? utils.decTime2date(entryList[selectedEntry].alarmTime) : null;
	}

	/**
	 * Finds the lowest unused entry ID, filling any gaps left by deleted entries.
	 *
	 * @returns the next available integer ID for a new alarm clock entry.
	 */
	function newId(): number {
		const max = entryIds.length ? Math.max(...entryIds) : 1;
		for (let i = 1; i <= max; i++) {
			if (!entryIds.includes(i)) return i;
		}
		return max + 1;
	}

	/**
	 * Serialises an entry to the Miniserver `entryList/put` command and sends it.
	 *
	 * @param entry - the alarm clock entry to persist.
	 * @param i - index of the entry in `entryList`, or -1 to create a new entry.
	 */
	function publishEntry(entry: AlarmClockEntry, i: number = -1): void {
		const id = i === -1 ? newId() : entryIds[i];
		const extName = i === -1 ? ' ' + String(id) : '';
		const setting = entry.nightLight ? (entry.daily ? '1' : '0') : entry.modes?.map((s) => s.toString());
		const cmd = 'entryList/put/' + String(id) + '/' +
			entry.name + extName + '/' + entry.alarmTime + '/' +
			(entry.isActive ? '1' : '0') + '/' + setting;
		setControl(cmd);
	}

	/**
	 * Adds a new alarm entry pre-populated with today's weekday and the current hour.
	 * No-op when the entry list is already at the 16-entry limit.
	 */
	function addEntry(): void {
		if (entryIds.length > 15) return;
		const day = format(new Date(), 'eeee').toLowerCase();
		const opModes = controlStore.operatingModes;
		const opModesKeys = Array.from(opModes.keys());
		const idx = opModesKeys.find((key) => opModes.get(key)?.toLowerCase() === day);
		const entry: AlarmClockEntry = {
			name: $_('Alarm clock'),
			alarmTime: utils.hours2sec(format(new Date(), 'p')),
			isActive: true,
			modes: [Number(idx)],
			nightLight: false,
			daily: false
		};
		publishEntry(entry, -1);
	}

	/**
	 * Sends the `entryList/delete` command for the entry at the given index.
	 *
	 * @param i - index of the entry to delete in `entryList`.
	 */
	function deleteEntry(i: number): void {
		setControl('entryList/delete/' + entryIds[i]);
	}

	/**
	 * Applies an in-place name edit to the entry and re-publishes it.
	 *
	 * @param i - index of the entry in `entryList`.
	 * @param e - event carrying the new name string as `e.value`.
	 */
	function updateName(i: number, e: any): void {
		entryObj[entryIds[i]].name = e.value;
		publishEntry(entryObj[entryIds[i]], i);
	}

	/**
	 * Applies a new alarm time from the time picker and re-publishes the entry.
	 *
	 * @param e - event carrying the new Date as `e.value`.
	 */
	function updateAlarmTime(e: any): void {
		const time = utils.hours2sec(utils.epoch2TimeStr(e.value.valueOf() / 1000));
		entryList[selectedEntry].alarmTime = time;
		publishEntry(entryList[selectedEntry], selectedEntry);
	}

	/**
	 * Toggles the active state of an entry and re-publishes it.
	 *
	 * @param i - index of the entry in `entryList`.
	 * @param e - event carrying the new checked state as `e.checked`.
	 */
	function updateIsActive(i: number, e: any): void {
		entryObj[entryIds[i]].isActive = e.checked;
		publishEntry(entryObj[entryIds[i]], i);
	}

	/**
	 * Applies updated day/mode settings from the day-picker and re-publishes the entry.
	 *
	 * @param i - index of the entry in `entryList`.
	 * @param e - event carrying the new modes or daily flag as `e.value`.
	 */
	function updateSettings(i: number, e: any): void {
		if (entryObj[entryIds[i]].nightLight) {
			entryObj[entryIds[i]].daily = e.value;
		} else {
			entryObj[entryIds[i]].modes = e.value;
		}
		publishEntry(entryObj[entryIds[i]], i);
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

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}

	/** Cancels the password prompt, discarding the pending alarm action. */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred alarm action, then clears the pending state.
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
	 * Sends a command string to the Miniserver, prompting for a password first
	 * when the control is secured.
	 *
	 * @param cmd - the raw command string, e.g. 'entryList/put/1/...'.
	 */
	function setControl(cmd: string): void {
		handleSecuredClick((visuPw) => controlStore.setControl(control, cmd, visuPw));
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="mt-2 overflow-y-auto w-full" {style} bind:this={viewport}>
				{#each entryList as entry, i}
					<div class="mt-2 p-4 bg-surface-50-950 rounded-lg" transition:slide={{ duration: 200 }}>
						<div class="flex w-full m-auto h-[72px] justify-between">
							<div>
								<h1 class="text-lg truncate">
									<LbInPlaceEdit value={entry.name} onValueChange={(e: any) => updateName(i, e)}/>
								</h1>
								<button disabled={!entry.isActive}
										class="text-3xl {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}"
										onclick={() => { selectedEntry = i; dateTimeOpen = true; }}>
									<h1>{utils.dec2hours(entry.alarmTime)}</h1>
								</button>
							</div>
							<div onclick={(e) => e.stopPropagation()}>
								<Switch checked={entry.isActive} onCheckedChange={(e) => updateIsActive(i, e)}>
									<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
										<Switch.Thumb/>
									</Switch.Control>
									<Switch.HiddenInput/>
								</Switch>
							</div>
						</div>
						<div class="flex w-full m-auto justify-between">
							<LbAlarmClockDayPicker disabled={!entry.isActive} {entry} label={$_('Alarm')} onValueChange={(e: any) => updateSettings(i, e)}/>
							{#if i > 0}
								<button type="button" class="dark:text-surface-300 text-surface-700" aria-label="delete"
										onclick={() => deleteEntry(i)}>
									<LbIcon name="trash-2"/>
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<footer class="mt-2 container w-full">
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={addEntry}>
					<span class="text-lg {entryIds.length > 15 ? 'dark:text-surface-800 text-surface-200' : ''}">{$_('Add new alarm time')}</span>
				</button>
			</footer>
		{/snippet}
	</LbDialog>
{/if}

<LbDialog open={passwordOpen} onClose={cancelPassword} {control} title={$_('Secured control')} zIndex="z-40">
	{#snippet description()}
		<LbPasswordForm onSubmit={confirmPassword} onCancel={cancelPassword}/>
	{/snippet}
</LbDialog>

<LbDateTimePicker date={getTimerDate()} bind:open={dateTimeOpen} title={$_('Wake-up time')} onValueChange={(e: any) => updateAlarmTime(e)}/>
