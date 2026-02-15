<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { iconStore } from '$lib/stores/LbIconStore.svelte';
	import Icon from '@iconify/svelte';

	let { name, ...others } = $props();
	let icon = $derived(iconStore.getIcon(name));
</script>

<span class="icon">
	{#if icon.includes('.svg') && !icon.includes('IconsFilled')}
		<svg use:inlineSvg={icon} {...others}></svg>
	{:else if icon.includes(':')}
		<Icon {icon} {...others} />
	{:else}
		<Icon icon="light_hugeicons:border-none-02" {...others} />
	{/if}
</span>

<style>
	.icon {
		font-size: 28px; /* default size */
	}
</style>
