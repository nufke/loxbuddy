<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { utils } from '$lib/helpers/utils';
	import { store } from '$lib/stores/store.svelte';
	import { X, ArrowLeft } from '@lucide/svelte';
	import LbCalendarEntryModal from '$lib/components/lb-calendar-entry-modal.svelte';
	
	let { view = $bindable(), mode, weekdays, entries } = $props();

	const notation = (num: number) => String(num).padStart(2, '0') + ':00'
	const hours = [...Array(24).keys(), 0];

	let length = $derived(entries ? entries.entry.length * 156 + 60 : 0);
	let selectedEntry = $state();

	let irc = 0; // IRC offset

	function getColor(type: string) {
		return 'green';
	}

	function getTime(time: string) {
		return utils.hours2dec(time);
	}

	function getMode(mode: string) {
		return Object.keys(weekdays).findIndex( key => key == mode);
	}

	let calendarEntryView = $state({
		control: view.control,
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
					<p class="text-lg">Schakeltijden</p>
				</div>
				<div class="mr-3 flex flex-row gap-3 justify-end">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=> {view.openModal = false}}><X/></button>
				</div>
			</div>
		</header>
		<div class="mt-10">
			<svg width={length} height="1050">
				<rect class="dark:fill-surface-900 fill-surface-100" x={60+getMode(mode)*156} y="55" width="150" height="960" fill="currentColor"></rect>
				{#each entries?.entry as entry,i}
					<text fill="white" font-size="16px" text-anchor="middle" x={135+i*156} y="40">{weekdays[Number(entry.mode)]}</text>
				{/each}
				{#each hours as hour,j}
					<text fill="white" font-size="16px" x="10" y={60+j*40}>{notation(hour)}</text>
					<path stroke-width="1" stroke-dasharray="150 6" stroke="white" d="m 60 {55+j*40} H {length}"></path>
					{#if j<24}
						<path stroke-width="1" stroke-dasharray="6" stroke="white" d="m 60 {75+j*40} H {length}"></path>
					{/if}
				{/each}
				{#each entries?.entry as entry}
			 	 <g>
		  		  <rect x={60+getMode(entry.mode)*156} y={55+getTime(entry.from)*40} width="150" height={(getTime(entry.to)-getTime(entry.from))*40} 
									rx="6" fill={getColor(entry.type)} onclick={() => {selectedEntry = entry; calendarEntryView.openModal = true}}></rect>
  				 <!-- <text x={70+entry.day} y={75+entry.start*40} font-size="14" fill="white">{entry.temp} </text>-->
						<text x={70+irc+getMode(entry.mode)*156} y={75+irc+getTime(entry.from)*40} font-size="14" fill="white">{entry.from} - {entry.to}</text>
	  			</g>
				{/each}
			</svg>
		</div>
	{/snippet}
</Modal>

<LbCalendarEntryModal bind:view={calendarEntryView} {entries} {selectedEntry} {weekdays}/>