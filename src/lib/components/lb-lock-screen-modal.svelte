<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { X } from '@lucide/svelte';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { Utils } from '$lib/helpers/utils';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';

	let currentWeather = $derived(weatherStore.current);
	let time = $derived(store.time);

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = Utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = Utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}
</script>

<Modal
	open={store.lockScreenModal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="container mx-auto max-w-[768px] overflow-auto h-full"
	positionerPadding="p-5"
	backdropBackground="dark:bg-surface-950 bg-surface-50"
	backdropBase = 'fixed top-0 left-0 right-0 bottom-0 z-2000'
	positionerBase = 'fixed top-0 left-0 right-0 bottom-0 z-2001'>
	<!-- we need to increase z-index greather than 999 such that is overlays other modals -->
	{#snippet content()}
	<div class="flex h-screen">
		<div class="absolute right-2 top-2">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=> store.resetLockScreenModalTimeout()}><X/></button>
		</div>
		<div class="m-auto">
			{#if currentWeather && currentWeather.airTemperature}
			<div class="flex flex-row items-center m-auto">
				<LbIcon name={getCurrentIcon(currentWeather)} width="80" height="80"/>	
				<span class="text-4xl truncate">{currentWeather.airTemperature}°</span>
			</div>
			{/if}
	  	<div class="m-auto">
				<p class="mt-2 pl-3 text-7xl font-bold">{format(time, "p")}</p>
				<p class="mt-2 pl-3 text-4xl font-bold">{format(time, "eeee PPP")}</p>
	  	</div>
		</div>
	</div>
	{/snippet}
</Modal>
