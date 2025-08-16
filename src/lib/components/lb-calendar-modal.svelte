<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { utils } from '$lib/helpers/utils';
	import { Plus, ArrowLeft } from '@lucide/svelte';
	import type { Entry } from '$lib/types/models';
	import LbCalendarEntryModal from '$lib/components/lb-calendar-entry-modal.svelte';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';

	let { view = $bindable(), mode, dayModes, entries, overrideDate } = $props();

	const notation = (num: number) => String(num).padStart(2, '0') + ':00'
	const hours = [...Array(24).keys(), 0];

	let opModes = $derived(store.structure.operatingModes);
	let modeEntries: number[] = $derived(entries ? entries.entry.map( (m: Entry) => m.mode) : []);
	let modes = $derived(modeEntries.filter((mode, idx) => modeEntries.indexOf(mode) == idx)); // remove duplicates
	let length = $derived(modes.length * 156 + 60);
	let selectedEntry = $state();

	function getName(mode: string) {
		return opModes[Number(mode)];
	}

	function getColor(needActivate: string) {
		return needActivate == '0' ? 'dark:fill-primary-500 fill-primary-700' : 'dark:fill-tertiary-500 fill-tertiary-700'
	}

	function getTextColor(type: string) {
		return 'dark:fill-surface-950 fill-surface-50';
	}

	function getTime(time: string) {
		return utils.hours2dec(time);
	}

	function getModeIndex(mode: string) {
		return modes.findIndex(item => item == Number(mode));
	}

	// although we calculate with 24:00 for the graphics, we use 00:00 notation to display time 
	// TODO: fix formatting of date-fnd notation 0:00
	function showTime(time: Entry) {
		return 	utils.hours2hours(time.from) + ' - ' + 
						utils.hours2hours(time.to, true);  // correct 24:00 -> 00:00
	}

	function addEntry() {
		selectedEntry = {
			mode: String(mode),
			from: utils.epoch2TimeStrNextHour(Date.now()/1000),
			to: utils.epoch2TimeStrNextHour((Date.now()/1000)+3600),
			needActivate: '0',
			value: '0',
		}
		calendarEntryView.label = $_('Add switching times');
		calendarEntryView.enableDelete = false;
		calendarEntryView.openModal = true;
	}

	function updateEntry(entry: Entry) {
		selectedEntry = entry;
		calendarEntryView.label = $_('Update switching times');
		calendarEntryView.enableDelete = true;
		calendarEntryView.openModal = true;
	}

	let calendarEntryView = $state({
		control: view.control,
		label: '',
		enableDelete: true,
		openModal: false
	});
</script>

<Modal
	open={view.openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{view.openModal = false}}
	triggerBase=""
	contentBase="container mx-auto max-w-full w-full overflow-auto h-full"
	positionerPadding="p-2"
	backdropClasses=""
	backdropBackground="dark:bg-surface-950 bg-surface-50">
	{#snippet content()}
		<!-- TODO better method to close full-screen modal? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 dark:bg-surface-950 bg-surface-50"></div>
		<header class="fixed w-full top-0 left-0 preset-filled-surface-100-900 z-1 shadow-md">
			<div class="grid grid-cols-2 text-center items-center m-auto h-[60px]">
				<div class="flex flex-row text-center items-center gap-3">
					<button class="btn-icon w-auto ml-4 mr-0 text-left" onclick={() => {view.openModal = false}}>
						<ArrowLeft/>
					</button>
					<p class="text-lg">{$_("Calendar")}</p>
				</div>
				<div class="mr-3 flex flex-row gap-3 justify-end">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={addEntry}>
						<Plus />
					</button>
				</div>
			</div>
		</header>
		<div class="mt-[36px]">
			<div class="flex flex-row">
				<div>
					<svg width="65" height="1050">
						{#each hours as hour,j}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" x="10" y={60+j*40}>{notation(hour)}</text>
						{/each}
					</svg>
				</div>
				<div class="overflow-x-auto">
					<svg width={length-80} height="1050">
						<rect class="dark:fill-surface-900 fill-surface-100" x={0+getModeIndex(mode)*156} y="55" width="150" height="960" fill="currentColor"></rect>
						{#each entries?.entry as entry,i}
							<text class="dark:fill-surface-50 fill-surface-950" font-size="15px" text-anchor="middle" x={75+i*156} y="40">{getName(entry.mode)}</text>
						{/each}
						{#each hours as hour,j}
							<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="150 6" d="m 0 {55+j*40} H {length}"></path>
							{#if j<24}
								<path class="stroke-surface-500" stroke-width="1" stroke-dasharray="6"  d="m 0 {75+j*40} H {length}"></path>
							{/if}
						{/each}
						{#each entries?.entry as entry}
					 	 <g onclick={() => {updateEntry(entry)}}>
				  		  <rect class={getColor(entry.needActivate)} x={0+getModeIndex(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} 
											rx="6"></rect>
				 				 <!-- <text x={70+entry.day} y={75+entry.start*40} font-size="14" fill="white">{entry.temp} </text>-->
								<text class={getTextColor(entry.type)} x={10+getModeIndex(entry.mode)*156} y={75+getTime(entry.from)*40} font-size="14">{showTime(entry)}</text>
			  			</g>
						{/each}
					</svg>
				</div>
			</div>
		</div>
	{/snippet}
</Modal>

<LbCalendarEntryModal bind:view={calendarEntryView} {entries} {selectedEntry} {dayModes}/>