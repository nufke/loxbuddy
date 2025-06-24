<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import { slide, fade } from 'svelte/transition'
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { Sunrise, Sunset, X } from '@lucide/svelte';
	import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';
	import { Utils } from '$lib/helpers/utils';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';

	let { open = $bindable() } = $props();

	let slider = $state(Array.from({length: 10}, i => i = false));
	let current = $derived(weatherStore.current);
	let daily = $derived(weatherStore.daily);
	let hourly = $derived(weatherStore.hourly);
	let loaded = $derived(current.time > 0 && daily.length);
	let time = $derived(store.time);

	function openSlider(i: number) {
		if (hourly[i]) {
			slider[i] = !slider[i];
		}
	}

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = Utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = Utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	function getDayIcon(day: WeatherDailyForecast) {
		let sunRise = Utils.time2epoch(day.time, day.sunRise);
		let sunSet = Utils.time2epoch(day.time, day.sunSet);
		let currentDay = Utils.time2epoch(current.time, '00:00');
		let dayOrNight = (((time.valueOf() > sunRise) && (time.valueOf() < sunSet)) || (day.time != currentDay)) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + day.icon + dayOrNight;
	}

	function getHourIcon(hour: WeatherHourlyForecast) {
		let sunRise = Utils.time2epoch(hour.time, current.sunRise);
		let sunSet = Utils.time2epoch(hour.time, current.sunSet);
		let dayOrNight = (hour.time > sunRise) && (hour.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + hour.icon + dayOrNight;
	}

	function getHourly(day: WeatherDailyForecast) {
		let hours = hourly.filter( hours => (hours.time >= day.time) && hours.time <= (day.time + 86400000))
		if (hours.length < 10) {
			let cnt = 9-hours.length;
			hours = hourly.filter( hours => (hours.time >= day.time) && hours.time <= (day.time + 86400000 + cnt * 3600000))
		}
		return hours; 
	}
</script>

<Modal
	open={open}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn preset-tonal"
	contentBase="container mx-auto max-w-[768px] overflow-auto h-full"
	positionerPadding="p-2"
	backdropBackground="bg-surface-950">
	{#snippet content()}
	<header class="sticky top-0 h-[40px] bg-surface-950/50 z-1">
		<div class="absolute right-1 top-1">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=> open = false}><X/></button>
		</div>
	</header>
	{#if loaded}
	<div class="-mt-2 justify-center text-center">
		<p class="h4">{current.location}</p>
		<p class="text-lg">{format(time, "PPP p", {locale: nl})}</p>
		<div class="grid grid-cols-2 mb-5">
			<div>
				<p class="text-[120px] font-medium ml-8">{current.airTemperature}<span class="font-normal">°</span></p>
			</div>
			<div class="m-auto">
				<LbIcon name={getCurrentIcon(current)} width="160"/>
			</div>
			<div>
				<p class="text-xl">{$_("Feels like")} <span>{current.feelsLike}°</p>
			</div>
			<div>
				<p class="text-xl">{$_(current.conditions)}</p>
			</div>
			<div class="flex flex-col gap-4 mt-8 m-auto">
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/humidity.svg"} width="32" height="32"/>
					<p class="text-lg"><span class="font-medium">{current.relativeHumidity}%</span> {$_('Humidity')}</p>
				</div>
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/circle-trend-up.svg"} width="32" height="27"/>
					<p class="text-lg"><span class="font-medium">{current.stationPressure}</span> mbar</p>
				</div>
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/lighting.svg"} width="32" height="25"/>
					<p class="text-lg">{current.lightingStrikeCount1h} / {current.lightingStrikeDistance} km</p>
				</div>
			</div>
			<div class="flex flex-col gap-4 mt-8 m-auto">
				<div class="flex gap-2">
					<span style="rotate: {current.windDirection}deg;"><LbIcon name={"/icons/svg/wind-direction.svg"} width="32" height="32"/></span>
					<p class="text-lg"><span class="font-medium">{current.windAverage}</span> km/h</p>
				</div>
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/sun-solid.svg"} width="32" height="32"/>
					<p class="text-lg"><span class="font-medium">{current.solarRadiation}</span> W/m²</p>
					<p class="text-lg"><span class="font-medium">{current.uv}</span> UV</p>
				</div>
				<div class="flex gap-2">
					<LbIcon class="text-white fill-white" name={"/icons/svg/rain-meter.svg"} fill="white" width="32" height="25"/>
					<p class="text-lg"><span class="font-medium">{current.precipitationToday}</span> mm</p>
				</div>
			</div>
		</div>
		{#each daily as day, i}
		<div class="mt-2 h-20 max-w-[768px] preset-filled-surface-100-900" onclick={() => openSlider(i)}>
			<div class="grid grid-cols-8 pl-2 pr-3">
				<div class="col-span-3 p-3 pr-0 my-auto">
					<p class="text-left text-lg font-medium truncate">{format(new Date(day.time), "eeee d",{locale: nl})}</p>
					<p class="text-left text-lg truncate">{$_(day.conditions)}</p>
				</div>
				<div class="col-span-2 align-middle m-auto">
					<LbIcon name={getDayIcon(day)} fill="white" width="70" height="70"/>
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LbIcon class="text-white" name={"/icons/svg/raindrop.svg"} width="16" height="16"/></span>
					<p class="text-lg">{day.precipitationProbability}%</p>	
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LbIcon size="16" name="ArrowDown"/></span>
					<p class="text-lg">{day.airTemperatureLow}°</p>
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LbIcon size="16" name="ArrowUp"/></span>
					<p class="text-lg">{day.airTemperatureHigh}°</p>
				</div>
			</div>
		</div> 
		{#if slider[i]}
		<div class="text-white max-w-[768px] preset-filled-surface-100-900" transition:slide={{ duration: 400 }} >
     	<div transition:fade={{ duration: 200 }}>
				<div class="grid grid-cols-2 hr p-1">
					<div class="flex m-auto">
						<span class="mr-2"><Sunrise size="22"/></span>
						<p class="text-lg">{day.sunRise}</p>
					</div>
					<div class="flex m-auto">
						<span class="mr-2"><Sunset size="22"/></span>
						<p class="text-lg">{day.sunSet}</p>
					</div>
				</div>
				<div class="grid auto-cols-[62px] grid-flow-col overflow-x-auto gap-2 hr h-48">
					{#each getHourly(day) as hour, j}
					<div class="grid-mw pl-2 flex flex-col vr">
						<div class="flex align-middle m-auto">
							<p class="text-lg">{format(new Date(hour.time), "H",{locale: nl})}</p>
						</div>
						<div class="flex m-auto">
							<span class="align-middle m-auto"><LbIcon name={getHourIcon(hour)} width="45" height="45"/></span>
						</div>
						<div>
							<p class="text-lg">{hour.airTemperature}°</p>
						</div>
						<div class="flex m-auto mt-1">
							<span class="align-middle m-auto"><LbIcon class="text-white" name={"/icons/svg/raindrop.svg"} width="16" height="16"/></span>
							<p class="text-lg">{hour.precipitationProbability}%</p>
						</div>
						<div class="flex m-auto mb-2">
							<span class="align-middle m-auto" style="rotate: {hour.windDirection}deg;"><LbIcon class="text-white" name={"/icons/svg/wind-direction2.svg"} width="18" height="18"/></span>
							<p class="text-lg">{hour.windAverage}</p>
						</div>
					</div>
					{/each}
				</div>
			</div>
		</div>
		{/if}
		{/each}
	</div>
	{:else}
	<div class="flex h-screen">
	  <div class="m-auto">
    	<p class="text-white text-xl">{$_("Waiting for weather data ...")}</p>
  	</div>
	</div>
	{/if}
	{/snippet}
</Modal>

<style>
/* to resolve css blowout issue with slider  */ 
:global {
	main {
	  min-width: 0!important;
	}
}
</style>