<script lang="ts">
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Image } from '@lucide/svelte';
	export let name;
</script>

{#if name == '/loxicons/'} <!-- no icon name given -->
	<Image/> 
{:else if icons[name]}
	<svelte:component this={icons[name]} {...$$props} />
{:else}
	<svg use:inlineSvg={name} {...$$props}></svg>
{/if}
