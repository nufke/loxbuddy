<script lang="ts">
	import { page } from '$app/state';
	import { SvelteDate } from 'svelte/reactivity';
	import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, EntriesAndDefaultValue, WeekDays } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbPasswordForm from '$lib/components/Common/LbPasswordForm.svelte';
	import LbTimeGrid from '$lib/components/Common/LbTimeGrid.svelte';
	import LbDateTimePicker from '$lib/components/Common/LbDateTimePicker.svelte';
	import LbCalendar from '$lib/components/Common/LbCalendar.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { format, isAfter, isBefore, setHours, setMinutes, setSeconds } from 'date-fns';
	import { utils } from '$lib/helpers/Utils';

	type StartEndTime = { startTime: string; endTime: string };

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const toaster = createToaster({ duration: 1500 });

	let pendingAction: ((visuPw?: string) => void) | null = null;
	let controlOpen = $state(false);
	let passwordOpen = $state(false);
	let outputActive = $state(false);
	let overrideDate = $state({ start: new SvelteDate(), end: new SvelteDate(), active: false });
	let calendarOpen = $state(false);
	let dateTimeOpen = $state(false);

	let dayOfTheWeek = $derived(format(appStore.date, 'eeee'));
	let isAnalog = $derived(Boolean(control.details?.analog));
	let value = $derived(Number(controlStore.getState(control.states?.value)));
	let valueFormatted = $derived(fmt.sprintf(control.details?.format, value));
	let mode = $derived(Number(controlStore.getState(control.states?.mode)));
	let entries = $derived(utils.extractEntries(controlStore.getState(control.states?.entriesAndDefaultValue))) as EntriesAndDefaultValue;
	let modeList = $derived(String(controlStore.getState(control.states?.modeList)));
	let dayModes = $derived(utils.extractDayModes(modeList)) as WeekDays;
	let status = $derived(isAnalog ? valueFormatted : (value ? control.details?.text.on : control.details?.text.off)) as string;
	let override = $derived(Number(controlStore.getState(control.states?.override)));
	let timeslot = $derived(calcStartEndTime(entries));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let iconColor = $derived(value > 0 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50');
	let statusColor = $derived(value > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let statusName = $derived(status + getDuration());
	let badgeIconName = $derived(override > 0 ? 'Timer' : '');
	let badgeIconColor = $derived(override > 0 ? 'bg-purple-500' : '');

	/**
	 * Builds a "till HH:MM" or "till D MMMM p" suffix from the active override
	 * or the current timeslot end time.
	 */
	function getDuration(): string {
		const timerEnds = appStore.date.valueOf() + override * 1000;
		if (override > 0 || (timeslot && timeslot.endTime)) {
			const dateStr = timerEnds ? format(timerEnds, 'd MMMM p') : '';
			const timeStr = timeslot ? utils.hours2hours(timeslot.endTime, true) : '';
			return ' ' + $_('Till').toLowerCase() + ' ' + (override > 0 ? dateStr : timeStr);
		}
		return '';
	}

	/**
	 * Converts a 'HH:MM' time string to a Date on today's date.
	 *
	 * @param t - time string in 'HH:MM' format.
	 */
	function getTime(t: string): Date {
		const [h, m] = t.split(':');
		return setSeconds(setMinutes(setHours(appStore.date, Number(h)), Number(m)), 0);
	}

	/**
	 * Finds the start and end time of the current active timeslot for today's mode,
	 * scanning the entry list for the nearest boundaries around the current time.
	 *
	 * @param entryList - parsed entries and default values from the daytimer state.
	 */
	function calcStartEndTime(entryList: EntriesAndDefaultValue): StartEndTime | undefined {
		if (!entryList) return;
		if (entryList.entry.length === 0) return { startTime: '00:00', endTime: '24:00' };

		let startTime = '00:00';
		let endTime = '24:00';
		entryList.entry.forEach((item: any) => {
			if (Number(item.mode) == mode) {
				if (isAfter(appStore.date, getTime(item.to))) startTime = item.to;
				if (isBefore(appStore.date, getTime(item.from))) endTime = item.from;
				if (isAfter(appStore.date, getTime(item.from)) && isBefore(appStore.date, getTime(item.to))) {
					startTime = item.from;
					return { startTime, endTime };
				}
			}
		});
		return { startTime, endTime };
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

	/** Cancels the password prompt, discarding the pending daytimer action. */
	function cancelPassword(): void {
		passwordOpen = false;
		pendingAction = null;
	}

	/**
	 * Confirms the password entered by the user, caches it for the control's
	 * UUID, executes the deferred daytimer action, then clears the pending state.
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
	 * Sends a command string to the miniserver, prompting for a password first
	 * when the control is secured.
	 *
	 * @param cmd - the raw command string, e.g. 'startOverride/1/3600'.
	 */
	function setControl(cmd: string): void {
		handleSecuredClick((visuPw) => controlStore.setControl(control, cmd, visuPw));
	}

	/**
	 * Starts or stops a daytimer override. If an override is already running it
	 * is cancelled. Otherwise a new override is started for the time period
	 * between now and the selected end date. Shows a toast when the configured
	 * period is too short (< 60 s).
	 */
	function startStopTimer(): void {
		if (override > 0) {
			setControl('stopOverride');
			return;
		}
		overrideDate.start = new SvelteDate();
		overrideDate.active = outputActive;
		const coeff = 1000 * 60;
		const overrideTimeSec = Math.round((overrideDate.end.getTime() - Date.now()) / coeff) * coeff / 1000;
		const overrideValue = outputActive ? '1' : '0';
		if (overrideTimeSec > 60) {
			setControl('startOverride/' + overrideValue + '/' + String(overrideTimeSec));
		} else {
			console.error('[LbDaytimer] Daytimer override timeperiod too low:', overrideTimeSec);
			toaster.info({ title: 'Timer period invalid!' });
		}
	}

	/**
	 * Updates the override end date when the user picks a new date/time.
	 *
	 * @param e - event carrying the new Date value.
	 */
	function updateTimer(e: any): void {
		overrideDate.end = e.value;
	}
</script>

<LbControl {controlOptions} {iconName} {iconColor} {statusName} {statusColor}
	{badgeIconName} {badgeIconColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<p class="text-lg mt-2 text-center {statusColor}">{statusName}</p>
				{#if override > 0}
					<div class="flex flex-row items-center justify-center">
						<span class="dark:text-purple-400 text-purple-800"><LbIcon name="timer" height="16" width="16"/></span>
						<p class="ml-1 text-lg text-center dark:text-purple-400 text-purple-800">{$_('Timer is running')}</p>
					</div>
				{/if}
				<div class="w-full m-2 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); calendarOpen = true; }}>
					<LbTimeGrid {mode} {entries} {overrideDate} {override}/>
					<h2 class="m-2 text-md text-center dark:text-surface-50 text-surface-950">{dayOfTheWeek}</h2>
				</div>
			</div>
			<div class="flex flex-col items-center justify-center">
				<div class="flex w-full btn-group bg-surface-50-950 rounded-lg grid-cols-2 p-2 flex-row border border-white/15 hover:border-white/50">
					<button type="button" class="w-full h-9 rounded-sm {outputActive ? 'dark:bg-surface-600 bg-surface-200' : ''}"
							onclick={() => (outputActive = true)}>
						<p class="text-lg">{$_('Active')}</p>
					</button>
					<button type="button" class="w-full h-9 rounded-sm {!outputActive ? 'dark:bg-surface-600 bg-surface-200' : ''}"
							onclick={() => (outputActive = false)}>
						<p class="text-lg">{$_('Inactive')}</p>
					</button>
				</div>
				<button class="w-full m-0 mt-2 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
						bg-surface-50-950 px-2 py-2"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); dateTimeOpen = true; }}>
					<div class="w-full flex items-center truncate">
						<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
							<p class="truncate text-lg">{$_('Duration')}</p>
							<p class="text-lg">{format(overrideDate.end, 'd MMMM p')}</p>
						</div>
					</div>
				</button>
				<button type="button" class="w-full mt-2 btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
						onclick={(e) => { e.stopPropagation(); e.preventDefault(); startStopTimer(); }}>
					<span class="text-lg">{$_(override > 0 ? 'Stop' : 'Start')} {$_('Timer').toLocaleLowerCase()}</span>
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

<LbDateTimePicker date={overrideDate.end} bind:open={dateTimeOpen} title={$_('Duration')} isDateView={true} onValueChange={(e: any) => updateTimer(e)}/>

<LbCalendar bind:open={calendarOpen} {control} {mode} {dayModes} {entries}/>

<Toast.Group {toaster}>
	{#snippet children(toast)}
		<Toast {toast}>
			<Toast.Message>
				<Toast.Title>{toast.title}</Toast.Title>
				<Toast.Description>{toast.description}</Toast.Description>
			</Toast.Message>
			<Toast.CloseTrigger/>
		</Toast>
	{/snippet}
</Toast.Group>
