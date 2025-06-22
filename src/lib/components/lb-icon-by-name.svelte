<script lang="ts">
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';

	export let name;
</script>

{#if icons[name]}
<svelte:component this={icons[name]} {...$$props} />
{:else}
<svg use:inlineSvg={name} {...$$props}></svg>
{/if}
