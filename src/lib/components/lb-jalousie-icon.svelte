<script lang="ts">
	let { position, shadePosition, width, height } = $props();

	let strokeWidth = $derived(Math.round(shadePosition*4/100)+1);
	let pos = $derived(Math.round(position*6/100)); // 0-100 in % 
	let level = $derived(Array.from(Array(pos).keys())); // from 0-100 in % 
</script>

<div class="flex justify-center items-center">
	<svg height="32" width="32" viewBox="0 0 32 32" transform="scale({height/32},{width/32}) translate({Math.abs(32-width)/2} 0)">
		<path class={(position*100 > 1) ? 'dark:stroke-primary-500 stroke-primary-700' : 'dark:stroke-surface-50 stroke-surface-950'} 
			d="M 1 1 L 1 29 L 24 29 L 24 1 L 0 1 " fill="none" stroke-width="2"/>
		{#each level as i}
		<path class={(position*100 > 1) ? 'dark:stroke-primary-500 stroke-primary-700' : 'dark:stroke-surface-50 stroke-surface-950'}
			d="M 4 {5+i*4} L 21 {5+i*4}" fill="none" stroke-width={strokeWidth}/>
		{/each}
	</svg>
</div>
