<script lang="ts">
	import { utils } from '$lib/helpers/Utils';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { format } from 'date-fns';

	let { mode, entries, overrideDate, override } = $props();

	let axis = [...Array(25).keys()];
	let dt = 13; // grid
	let o = 8;  // offset

	let time = $derived(appStore.time); // current time (dynamic)
	let m = $derived(utils.hours2dec(format(time, 'p'))); // marker
	let os = $derived(utils.hours2dec(format(overrideDate.start, 'p'))); // override start
	let oe = $derived(utils.hours2dec(format(overrideDate.end, 'p')) || 24); // override end (correction for 24h)
	let oa = $derived(overrideDate.active); // override active

	let slots = $derived(entries ? entries.entry.filter((item:any) => Number(item.mode) === mode) : []);

	let tc = 'dark:fill-surface-50 fill-surface-950'; // text color

	function co(t:any) {
		let fillColor = '';
		switch(t.value) {
			case '0': // Digital switch active (green)
			case '1': // Comfort heating (green)
			case '2': fillColor = 'dark:fill-primary-500 fill-primary-700'; break; // Comfort cooling (green)
			case '3': fillColor = 'dark:fill-secondary-500 fill-secondary-700'; break; // Empty house / deep sleep (blue)
			case '4': fillColor = 'dark:fill-warning-500 fill-warning-700'; break; // Heat protection (orange)
			case '5': fillColor = 'dark:fill-error-500 fill-error-700'; break; // Increased heat  (red)
			case '6': fillColor = 'dark:fill-purple-500 fill-purple-700'; break; // Party (purple)
		}
		if (t.needActivate == '1') fillColor = 'dark:fill-tertiary-500 fill-tertiary-700';
		return fillColor;
	}

	// calculate width
	function cw(t: any) {
		let from = utils.hours2dec(t.from);
		let fromUpdate = (from > m && override > 0 && from < oe ) ? oe : from;
		return utils.hours2dec(t.to) - fromUpdate;
	}

	function cx(t: any) { 
		let from = utils.hours2dec(t.from);
		return (from > m && override > 0 && from < oe ) ? oe : from;
	}
</script>

<div class="w-full h-full mt-4 flex align-center justify-center">
	<svg width="330" height="60">
		{#each axis as i}
			<path d="M{i*dt+o} 60 L {i*dt+o} {(i % 6) ? 27 : 22}" fill="none" stroke="#737373" stroke-width="1"/>
		{/each}
		<text class={tc} x="7" y="15" text-anchor="middle" font-size="14px">0</text>
		<text class={tc} x="86" y="15" text-anchor="middle" font-size="14px">6</text>
		<text class={tc} x="164" y="15" text-anchor="middle" font-size="14px">12</text>
		<text class={tc} x="242" y="15" text-anchor="middle" font-size="14px">18</text>
		<text class={tc} x="320" y="15" text-anchor="middle" font-size="14px">24</text>
		{#each slots as j}
			<rect class={co(j)} width={cw(j)*dt} height="25" x={o+cx(j)*dt} y="35"/>
		{/each}
		{#if override > 0}
			<rect class="fill-purple-800" width={(oe-os)*dt} height={oa ? "25" : "5"} x={o+os*dt} y={oa ? "35" : "55"}/>
		{/if}
		<path class="dark:stroke-surface-50 stroke-surface-950" d="M{m*dt+o} 60 L {m*dt+o} 22" stroke-width="3"/>
	</svg>
</div>
