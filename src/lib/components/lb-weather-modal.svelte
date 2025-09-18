<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import { slide, fade } from 'svelte/transition';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { Sunrise, Sunset, X } from '@lucide/svelte';
	import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { utils } from '$lib/helpers/utils';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';

	let slider = $state(Array.from({length: 10}, (v,i) => v = (i==0))); // open first slider at start
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

	function resetSlider() {
		slider = Array.from({length: 10}, (v,i) => v = (i==0));
	}

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	function getDayIcon(day: WeatherDailyForecast) {
		let sunRise = utils.time2epoch(day.time, day.sunRise);
		let sunSet = utils.time2epoch(day.time, day.sunSet);
		let currentDay = utils.time2epoch(current.time, '00:00');
		let dayOrNight = (((time.valueOf() > sunRise) && (time.valueOf() < sunSet)) || (day.time != currentDay)) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + day.icon + dayOrNight;
	}

	function getHourIcon(hour: WeatherHourlyForecast) {
		let sunRise = utils.time2epoch(hour.time, current.sunRise);
		let sunSet = utils.time2epoch(hour.time, current.sunSet);
		let dayOrNight = (hour.time > sunRise) && (hour.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + hour.icon + dayOrNight;
	}

	function getHourly(day: WeatherDailyForecast) {
		let hours = hourly.filter( hours => (hours.time >= day.time) && hours.time <= (day.time + 86400000))
		if (hours.length < 11) {
			let cnt = 11-hours.length;
			hours = hourly.filter( hours => (hours.time >= day.time) && hours.time <= (day.time + 86400000 + cnt * 3600000))
		}
		return hours; 
	}
</script>

<Modal
	open={store.weatherModal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="container mx-auto max-w-[768px] overflow-auto h-full"
	positionerPadding="p-2"
	backdropBackground="dark:bg-surface-950 bg-surface-50">
	{#snippet content()}
	<header class="sticky top-0 h-[40px] dark:bg-surface-950/50 bg-surface-50/50 z-1">
		<div class="absolute right-1 top-1">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=> {store.weatherModal.state = false; resetSlider();}}><X/></button>
		</div>
	</header>
	{#if loaded}
	<div class="-mt-2 justify-center text-center" onscroll={() => {store.setWeatherModalTimeout()}} onmousemove={() => {store.setWeatherModalTimeout()}}>
		<p class="h5">{current.location}</p>
		<p class="text-lg">{format(time, "PPP p")}</p>
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
					<span style="rotate: {current.windDirection}deg;"><LbIcon name={"/icons/svg/wind-direction2.svg"} width="24" height="24"/></span>
					<p class="text-lg"><span class="font-medium">{current.windAverage}</span> km/h</p>
				</div>
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/sun-solid.svg"} width="32" height="32"/>
					<p class="text-lg"><span class="font-medium">{current.solarRadiation}</span> W/m²</p>
					<p class="text-lg"><span class="font-medium">{current.uv}</span> UV</p>
				</div>
				<div class="flex gap-2">
					<LbIcon name={"/icons/svg/rain-meter.svg"} fill="white" width="32" height="25"/>
					<p class="text-lg"><span class="font-medium">{current.precipitationToday}</span> mm today</p>
				</div>
			</div>
		</div>
		{#each daily as day, i}
		<div class="mt-2 max-w-[768px] bg-surface-100-900" onclick={() => openSlider(i)}>
			<div class="grid grid-cols-8 p-2 h-[85px]">
				<div class="col-span-3 pl-2 pr-0 my-auto">
					<p class="text-left text-lg font-medium truncate">{format(new Date(day.time), "eeee d")}</p>
					<p class="text-left text-md truncate">{$_(day.conditions)}</p>
				</div>
				<div class="col-span-2 align-middle m-auto">
					<LbIcon name={getDayIcon(day)} width="70"/>
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LbIcon name={"/icons/svg/raindrop.svg"} width="16" height="16"/></span>
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
		<div class="max-w-[768px] bg-surface-100-900" transition:slide={{ duration: 400 }} >
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
							<p class="text-lg">{format(new Date(hour.time), "H")}</p>
						</div>
						<div class="flex m-auto">
							<span class="align-middle m-auto"><LbIcon name={getHourIcon(hour)} width="45" height="45"/></span>
						</div>
						<div>
							<p class="text-lg">{hour.airTemperature}°</p>
						</div>
						<div class="flex m-auto mt-1">
							<span class="align-middle m-auto"><LbIcon name={"/icons/svg/raindrop.svg"} width="16" height="16"/></span>
							<p class="text-lg">{hour.precipitationProbability}%</p>
						</div>
						<div class="flex m-auto mb-2">
							<span class="align-middle m-auto" style="rotate: {hour.windDirection}deg;"><LbIcon name={"/icons/svg/wind-direction2.svg"} width="18" height="18"/></span>
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
    	<p class="dark:text-surface-50 text-surface-950 text-xl">{$_("Waiting for weather data ...")}</p>
  	</div>
	</div>
	{/if}
	{/snippet}
</Modal>

<!--
<iframe width="650" height="450" src="https://embed.windy.com/embed2.html?lat=42.850&lon=-78.959&detailLat=42.890&detailLon=-78.880&width=650&height=450&zoom=7&level=surface&overlay=radar&product=radar&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1" frameborder="0"></iframe>
-->

<style>
/* to resolve css blowout issue with slider  */ 
:global {
	main {
	  min-width: 0!important;
	}
}
</style>