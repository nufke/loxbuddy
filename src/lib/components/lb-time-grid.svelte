<script lang="ts">
	import { Utils } from '$lib/helpers/utils';
	import { store } from '$lib/stores/store.svelte';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';

	let { mode, weekdays, entries } = $props();

	let axis = [...Array(25).keys()];
	let dt = 13; // grid
	let o = 8;  // offset

	let time = $derived(store.time)
	let m = $derived(Utils.hours2dec(format(time, 'p', { locale: nl }))); // TODO change locale
	
	let slots = entries.entry.filter((item:any) => Number(item.mode) === mode);

	// calculate width
	function cw(t: any) { 
		return Utils.hours2dec(t.to) - Utils.hours2dec(t.from);
	}

	function cx(t: any) { 
		return Utils.hours2dec(t.from);
	}
</script>

<div class="w-full h-full mt-6 flex align-center justify-center">
	<svg width="330" height="60">
		{#each axis as i}
			<path d="M{i*dt+o} 60 L {i*dt+o} {(i % 6) ? 27 : 22}" fill="none" stroke="#737373" stroke-width="1"/>
		{/each}
		<text x="7" y="15" text-anchor="middle" fill="white" font-size="14px">0</text>
		<text x="86" y="15" text-anchor="middle" fill="white" font-size="14px">6</text>
		<text x="164" y="15" text-anchor="middle" fill="white" font-size="14px">12</text>
		<text x="242" y="15" text-anchor="middle" fill="white" font-size="14px">18</text>
		<text x="320" y="15" text-anchor="middle" fill="white" font-size="14px">24</text>
		{#each slots as j}
			<rect width={cw(j)*dt} height="25" x={o+cx(j)*dt} y="35" fill="#666666" />
		{/each}
		<path d="M{m*dt+o} 60 L {m*dt+o} 22" fill="none" stroke="#FFFFFF" stroke-width="3"/>
	</svg>
</div>
