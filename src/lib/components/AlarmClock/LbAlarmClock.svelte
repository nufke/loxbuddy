<script lang="ts">
	import { tick } from 'svelte';
	import type { Control, ControlOptions, ControlView, DialogView, AlarmClockEntries, AlarmClockEntry } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { XIcon, Trash2Icon } from '@lucide/svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import LbInPlaceEdit from '$lib/helpers/in-place-ediit.svelte';
	import LbDateTimePickerDialog from '$lib/components/Common/LbDateTimePickerDialog.svelte';
	import LbAlarmClockDayPickerDialog from '$lib/components/AlarmClock/LbAlarmClockDayPickerDialog.svelte';
	import { utils } from '$lib/helpers/Utils';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { slide, fade } from 'svelte/transition';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(true);
	let selectedEntry = $state(0);

	let dateTimeView = $state({
		isDateView: false,
		isMinuteView: false,
		label: $_('Wake-up time'),
		openDialog: false
	});

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let entryObj = $derived(controlStore.getState(control.states.entryList) as AlarmClockEntries);
	let entryIds = $derived(entryObj ? Object.keys(entryObj).map(n => Number(n)) : []);
	let entryList = $derived(entryObj ? Object.values(entryObj) : []);
	let prevEntryListLength: number = $state(0);
	let alarms = $derived(entryObj ? Object.values(entryObj).filter( entry => entry.isActive) : []);
	let nextEntryTime = $derived(Number(controlStore.getState(control.states.nextEntryTime)) || 0);
	let windowHeight = $derived(innerHeight.current || 0);

	let margin = 200;
	let	size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: alarms.length ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: alarms.length ? getAlarmTime() : $_('No alarm time active'),
		statusColor: alarms.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		dialog: dialog
	});


	function parseScroll(height: number, view: any = undefined) {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

	function updateSize() {
		size = (windowHeight * 0.9 - viewport?.clientHeight - margin);
		style = viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px';
	}

	function newId() {
		let max = entryIds.length ? Math.max(...entryIds) : 1;
		for( let i = 1; i <= max; i++) {
			if (!entryIds.includes(i)) return i;
		}
		return max + 1; // new ID
	}

	function publishEntry(entry: AlarmClockEntry, i: number = -1) {
		let id = (i == -1) ? newId() : entryIds[i]; /* -1 is new entry */
		let extName = (i == -1) ? ' ' + String(id) : ''; /* extend name for new entries */
		let setting = entry.nightLight ? (entry.daily ? '1' : '0') : entry.modes?.map(s => s.toString());
		let cmd = 'entryList/put/' + String(id) + '/' +
			entry.name + extName + '/' + entry.alarmTime + '/' + 
			(entry.isActive ? '1' : '0') + '/' + setting;
		//console.log('cmd', cmd, id, entryListIds);
		controlStore.setControl(control.uuidAction, cmd);
	}

	function updateName(i: number, e: any) {
		const entryId = entryIds[i];
		entryObj[entryId].name = e.value;
		publishEntry(entryObj[entryId], i);
	}

	function updateAlarmTime(e: any) {
		let time = utils.hours2sec(utils.epoch2TimeStr(e.value.valueOf()/1000));
		entryList[selectedEntry].alarmTime = time;
		publishEntry(entryList[selectedEntry], selectedEntry);
	}

	function updateIsActive(i: number, e: any) {
		const entryId = entryIds[i];
		entryObj[entryId].isActive = e.checked;
		publishEntry(entryObj[entryId], i);
	}

	function updateSettings(i: number, e: any) {
		const entryId = entryIds[i];
		if (entryObj[entryId].nightLight) {
			entryObj[entryId].daily = e.value;
		} else {
			entryObj[entryId].modes = e.value;
		}
		publishEntry(entryObj[entryId], i);
	}

	function addEntry() {
		if (entryIds.length > 15) return; // limit to 16 entries
		let day = format(new Date(), 'eeee').toLowerCase();
		let opModes = controlStore.structure.operatingModes;
		let idx = Object.keys(opModes).find( (key) => opModes[key].toLowerCase() == day);
		let entry: AlarmClockEntry = {
			name: $_('Alarm clock'),
			alarmTime: utils.hours2sec(format(new Date(), 'p')),
			isActive: true,
			modes: [Number(idx)], 
			nightLight: false,
			daily: false
		};
		publishEntry(entry, -1); /* new entry */
	}

	function deleteEntry(i: number) {
		let cmd = 'entryList/delete/' + entryIds[i];
		controlStore.setControl(control.uuidAction, cmd);
	}

	function getAlarmTime() {
		let date = new Date(nextEntryTime * 1000 + utils.loxTimeRef);
		date = utils.isDST(date) ? new Date(nextEntryTime * 1000 + utils.loxTimeRef - 3600000) : date;
		return format(date, 'PPP p');
	}

	function getTimerDate() {
		return entryList && entryList[selectedEntry] ? 
			utils.decTime2date(entryList[selectedEntry].alarmTime) : null;
	}

	function close() {
		controlView.dialog.action(false);
	}

	$effect( () => {
		if (entryList.length) { /* to trigger the scroll, we need to be sensitive to the entryList */
			tick().then( () => {
				if ( viewport && prevEntryListLength != entryIds.length ) {
					viewport.scroll({ top: viewport.scrollHeight, behavior: 'smooth' });
					prevEntryListLength = entryIds.length;
				 	updateSize();
				}
			});
		}
	});

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
					<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										md:max-w-9/10 md:max-h-9/10 w-[450px]">
						<!--<Info control={controlView.control}/>-->
						<header class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<XIcon class="size-4"/>
								</button>
							</div>
						</header>
						<Dialog.Description>
							<div class="mt-2 overflow-y-auto w-full" {style} bind:this={viewport}>
								{#each entryList as entry, i}
									<div class="mt-2 p-4 dark:bg-surface-950 bg-surface-50 rounded-lg" transition:slide={{ duration: 200 }}>
										<div class="flex w-full m-auto h-[72px] justify-between">
											<div>
												<h1 class="text-lg truncate">
													<LbInPlaceEdit value={entry.name} onValueChange={(e:any)=>{updateName(i, e)}}/>
												</h1>
												<button class="text-3xl {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}"
															onclick={() => {selectedEntry = i; dateTimeView.openDialog=true;}}>
													<h1>{utils.dec2hours(entry.alarmTime)}</h1>
											</button>
											</div>
											<div onclick={(e) => {e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
												<Switch checked={entry.isActive} onCheckedChange={(e) => {updateIsActive(i, e)}}>
													<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
														<Switch.Thumb />
													</Switch.Control>
													<Switch.HiddenInput />
												</Switch>
											</div>
										</div>
										<div class="flex w-full m-auto justify-between">
											<LbAlarmClockDayPickerDialog {entry} label={$_("Alarm")} onValueChange={(e:any)=>{updateSettings(i, e)}}/>
											{#if i > 0}
											<button type="button" class="dark:text-surface-300 text-surface-700" aria-label="delete" onclick={() => { deleteEntry(i);}}>
												<Trash2Icon/>
											</button>
											{/if}
										</div>
									</div>
								{/each}
							</div>
							<footer class="mt-2 container w-full">
								<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50
									shadow-sm rounded-lg border border-white/15 hover:border-white/50"
										onclick={addEntry}>
									<span class="text-lg {entryIds.length > 15 ? 'dark:text-surface-800 text-surface-200' : ''}">{$_("Add new alarm time")}</span>
								</button>
							</footer>
						</Dialog.Description>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
	{/if}
	<LbDateTimePickerDialog date={getTimerDate()} bind:view={dateTimeView} onValueChange={(e:any)=>{ updateAlarmTime(e)}}/>
</div>
