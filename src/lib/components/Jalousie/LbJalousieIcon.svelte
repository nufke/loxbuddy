<script lang="ts">
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, width, height } = $props();

	let screenPosition = $derived(Number(controlStore.getState(control?.states.position)) * 100 || 0);
	let shadePosition = $derived(Number(controlStore.getState(control?.states.shadePosition)) * 100 || 0);
	let position = $derived(control?.details.animation != 0 ? 100 : Math.round(shadePosition));
	let strokeWidth = $derived(Math.round(position*4/100)+1);
	let pos = $derived(Math.round(screenPosition*6/100) || 0); // 0-100 in % 
	let level = $derived(Array.from(Array(pos).keys())); // from 0-100 in %
</script>

<div class="flex justify-center items-center">
	<svg height="32" width="32" viewBox="0 0 32 32" transform="scale({height/32},{width/32}) translate({Math.abs(32-width)} 0)">
		<path class={(screenPosition*100 > 1) ? 'dark:stroke-primary-500 stroke-primary-700' : 'dark:stroke-surface-50 stroke-surface-950'} 
			d="M 1 1 L 1 29 L 24 29 L 24 1 L 0 1 " fill="none" stroke-width="2"/>
		{#each level as i}
		<path class={(screenPosition*100 > 1) ? 'dark:stroke-primary-500 stroke-primary-700' : 'dark:stroke-surface-50 stroke-surface-950'}
			d="M 4 {5+i*4} L 21 {5+i*4}" fill="none" stroke-width={strokeWidth}/>
		{/each}
	</svg>
</div>
