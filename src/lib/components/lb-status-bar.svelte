<script lang="ts">
	import { _ } from 'svelte-i18n';
  import { Progress } from '@skeletonlabs/skeleton-svelte';
	import { store } from '$lib/stores/store.svelte';

	let { max, actual } = $props();

	let value = $derived(Math.floor(100*actual/max) || 0);
	function printValue(n: number, scale: string, unit: string) {
		return [(n.toLocaleString(store.locale, { minimumFractionDigits: 1 })), scale + unit];
	}

	function format(n: number) {
		let su = {scale: 1E3, unit: 'W'};

		if (Math.abs(n) < 1E3/su.scale) { 
			n *= 1E3;
			n = Math.round(n);
			return printValue(n, '', su.unit);
		}

		if (Math.abs(n) >= 1E3/su.scale && Math.abs(n) < 1E6/su.scale) { 
			n = Math.round(n * 10) / 10;
			return printValue(n, 'k', su.unit);
		}

		if (Math.abs(n) >= 1E6/su.scale && Math.abs(n) < 1E9/su.scale) {
			n /= 1E3;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'M', su.unit);
		}

		if (Math.abs(n) >= 1E9/su.scale) {
			n /= 1E6;
			n = Math.round(n * 100) / 100;
			return printValue(n, 'G', su.unit);
		}
		return printValue(0, '', '');
	}
</script>

<div class="w-full h-full mt-2 mb-2 flex align-center justify-center">
	<div class="flex w-full flex-col ml-2 mr-2">
		<div class="flex justify-end items-center mb-1 border-r-3 dark:border-surface-700 border-surface-300 pr-2 text-md h-[26px] w-full">{$_('Max power')} {format(max).join(' ')}</div>
		<Progress trackClasses="custom-track" meterClasses="custom-meter" value={100} max={100} height="h-10" />
		{#if value < 50}
			<div class="flex flex-row items-center">
				<div class="mt-1 border-r-3 dark:border-surface-700 border-surface-300 text-left pr-2 text-md h-[26px]" style="width:{value}%"></div>
				<p class="pl-2 text-md">{$_('Actual power')} {format(actual).join(' ')}</p>
			</div>
		{:else}
			<div class="flex justify-end items-center mt-1 border-r-3 dark:border-surface-700 border-surface-300 pr-2 text-md h-[26px]" style="width:{value}%">{$_('Actual power')} {format(actual).join(' ')}</div>
		{/if}
	</div>
</div>

<style>
:global {
	.custom-track {
		position:relative;
	}
	.custom-meter {
  	-webkit-mask:linear-gradient(#fff 0 0);
    	      mask:linear-gradient(#fff 0 0);
	}
	.custom-meter::before {
		content:"";
		position:absolute;
		top:0;
		left:0;
		right:0;
		bottom:0;
		background-image: linear-gradient(
			90deg,
			var(--color-primary-500) 0%,
			var(--color-primary-500) 70%,
			var(--color-warning-500) 80%,
			var(--color-error-500) 97%);
		}
	}
</style>