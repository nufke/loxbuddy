<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { utils } from '$lib/helpers/utils';
	import { store } from '$lib/stores/store.svelte';
	import type { EntriesAndDefaultValue } from '$lib/types/models';
	let { open = $bindable() } = $props();

	let control = store.controls["__uuid__controls_IRC"];

	const notation = (num: number) => String(num).padStart(2, '0') + ':00'

	let days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	let hours = [...Array(24).keys(), 0];

	let entryList = [
		{
			day: 1,
			start: utils.hours2dec('0:00'),
			end: utils.hours2dec('1:00'),
			type: 'eco',
			temp: 21,
		}
	]

	function getColor(type: string) {
		return 'green';
	}

	function getTime(e: any) {
		return utils.dec2hours(e.start) + ' - ' +  utils.dec2hours(e.end);
	}

</script>

<Modal
	open={open}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{open = false}}
	triggerBase=""
	contentBase="container mx-auto max-w-full w-full overflow-auto h-full"
	positionerPadding="p-2"
	backdropBackground="dark:bg-surface-950 bg-surface-50">
	{#snippet content()}

	<svg  width="2000" height="1050">
		{#each days as day,i}
			<text fill="white" font-size="16px" text-anchor="middle" x={135+i*156} y="40">{day}</text>
		{/each}
		{#each hours as hour,j}
			<text fill="white" font-size="16px" x="10" y={60+j*40}>{notation(hour)}</text>
			<path stroke-width="1" stroke-dasharray="150 6" stroke="white" d="m 60 {55+j*40} H 2000"></path>
			{#if j<24}
				<path stroke-width="1" stroke-dasharray="6" stroke="white" d="m 60 {75+j*40} H 2000"></path>
			{/if}
		{/each}
		{#each entryList as entry}
		  <g>
		    <rect x={59+entry.day} y={55+entry.start*40} width="150" height={(entry.end-entry.start)*40} rx="6" fill={getColor(entry.type)}></rect>
  		  <text x={70+entry.day} y={75+entry.start*40} font-size="14" fill="white">{entry.temp} </text>
				<text x={70+entry.day} y={95+entry.start*40} font-size="14" fill="white">{getTime(entry)}</text>
  		</g>
		{/each}
	</svg>

	{/snippet}
</Modal>

