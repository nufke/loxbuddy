<script lang="ts">
	import * as icons from '@lucide/svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Image } from '@lucide/svelte';
	import iconmap from '$lib/components/Common/lox2iconify.json';
	import Icon from "@iconify/svelte";

	const iconpath = '/icons/svg/';
	let { name, ...others } = $props();
	let icon = $derived(iconmap[name] && iconmap[name].length ? iconmap[name] : name);
</script>

{#if icon && icon.length && icon.includes('svg')}
	<svg use:inlineSvg={iconpath+icon} {...others}></svg>
{:else if icon && icon.length && icon.includes(':')}
	<Icon icon={icon} {...others}/>
{:else if icons[name]}
	{@const LucideIcon = icons[name]}
	<LucideIcon {...others}  />
{:else}
	<Image/> <!-- no icon name given -->
{/if}
