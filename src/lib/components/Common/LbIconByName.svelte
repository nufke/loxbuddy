<script lang="ts">
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Image } from '@lucide/svelte';

	let { name, ...others } = $props();
</script>

{#if name.includes('svg')}
	<svg use:inlineSvg={name} {...others}></svg>
{:else if icons[name]}
	<svelte:component this={icons[name]} {...others} />
{:else}
	<Image/> <!-- no icon name given -->
{/if}
