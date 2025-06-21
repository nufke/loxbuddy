<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { store } from '$lib/stores/store.svelte';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import { slide } from 'svelte/transition'
	import LucideIcon from '$lib/components/icon-by-name.svelte';
	import { Sunrise, Sunset } from '@lucide/svelte';
	import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';
	import { Utils } from '$lib/helpers/utils';

	let slider = $state(Array.from({length: 10}, i => i = false));
	let current = $derived(weatherStore.current);
	let daily = $derived(weatherStore.daily);
	let hourly = $derived(weatherStore.hourly);

	function openSlider(i: number) {
		if (hourly[i]) {
			slider[i] = !slider[i];
		}
	}

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = Utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = Utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunSet) || (cur.time < sunRise) ? '-night.svg' : '-day.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	function getDayIcon(day: WeatherDailyForecast) {
		let sunRise = Utils.time2epoch(day.time, current.sunRise);
		let sunSet = Utils.time2epoch(day.time, current.sunSet);
		let dayOrNight = ((day.time > sunSet) || (day.time < sunRise)) && (day.time < current.time) ? '-night.svg' : '-day.svg';
		return '/meteocons/svg/' + day.icon + dayOrNight;
	}

	function getHourIcon(hour: WeatherHourlyForecast) {
		let sunRise = Utils.time2epoch(hour.time, current.sunRise);
		let sunSet = Utils.time2epoch(hour.time, current.sunSet);
		let dayOrNight = ((hour.time > sunSet) || (hour.time < sunRise)) ? '-night.svg' : '-day.svg';
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

<div class="container space-y-3 p-3 mx-auto max-w-[640px]">
 	<h2 class="h4">{$_('Weather')}</h2>
	<div class="justify-center text-center">
		<p class="h4">{current.location}</p>
		<p class="text-lg">{format(new Date(), "PPP p", {locale: nl})}</p>
		<div class="grid grid-cols-2 mb-5">
			<div>
				<p class="text-[120px] font-medium ml-8">{current.airTemperature}<span class="font-normal">°</span></p>
			</div>
			<div class="m-auto">
				<svg use:inlineSvg={getCurrentIcon(current)} width="160"></svg>
			</div>
			<div>
				<p class="text-xl">{$_("Feels like")} <span>{current.feelsLike}°</p>
			</div>
			<div>
				<p class="text-xl">{$_(current.conditions)}</p>
			</div>
			<div class="flex flex-col gap-4 mt-8 m-auto">
				<div class="flex gap-2">
					<svg use:inlineSvg={"/icons/svg/humidity.svg"} width="32" height="32"></svg>
					<p class="text-lg"><span class="font-medium">{current.relativeHumidity}%</span> {$_('Humidity')}</p>
				</div>
				<div class="flex gap-2">
					<svg class="text-white" use:inlineSvg={"/icons/svg/circle-trend-up.svg"} width="32" height="27"></svg>
					<p class="text-lg"><span class="font-medium">{current.stationPressure}</span> mbar</p>
				</div>
				<div class="flex gap-2">
					<svg class="text-white" use:inlineSvg={"/icons/svg/lighting.svg"} width="32" height="25"></svg>
					<p class="text-lg">{current.lightingStrikeCount1h} / {current.lightingStrikeDistance} km</p>
				</div>
			</div>
			<div class="flex flex-col gap-4 mt-8 m-auto">
				<div class="flex gap-2">
					<span style="rotate: {current.windDirection}deg;"><svg use:inlineSvg={"/icons/svg/wind-direction.svg"} width="32" height="32"></svg></span>
					<p class="text-lg"><span class="font-medium">{current.windAverage}</span> km/h</p>
				</div>
				<div class="flex gap-2">
					<svg class="text-white" use:inlineSvg={"/icons/svg/sun-solid.svg"} width="32" height="32"></svg>
					<p class="text-lg"><span class="font-medium">{current.uv}</span> UV</p>
				</div>
				<div class="flex gap-2">
					<svg class="text-white fill-white" use:inlineSvg={"/icons/svg/rain-meter.svg"} fill="white" width="32" height="25"></svg>
					<p class="text-lg"><span class="font-medium">{current.precipitationToday}</span> mm</p>
				</div>
			</div>
		</div>
		{#each daily as day, i}
		<div class="mt-2 h-20 max-w-[640px] preset-filled-surface-100-900" onclick={() => openSlider(i)}>
			<div class="grid grid-cols-7 gap-2 pl-2 pr-3">
				<div class="col-span-3 p-3 my-auto">
					<p class="text-left text-lg font-medium truncate">{format(new Date(day.time), "eeee d",{locale: nl})}</p>
					<p class="text-left text-lg truncate">{$_(day.conditions)}</p>
				</div>
				<div class="col-span-1 align-middle m-auto">
					<svg use:inlineSvg={getDayIcon(day)} fill="white" width="70" height="70"></svg>
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><svg class="text-white" use:inlineSvg={"/icons/svg/raindrop.svg"} width="16" height="16"></svg></span>
					<p class="text-lg">{day.precipitationProbability}%</p>	
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LucideIcon size="16" name="ArrowDown"/></span>
					<p class="text-lg">{day.airTemperatureLow}°</p>
				</div>
				<div class="flex flex-row m-auto justify-center align-center">
					<span class="align-middle m-auto"><LucideIcon size="16" name="ArrowUp"/></span>
					<p class="text-lg">{day.airTemperatureHigh}°</p>
				</div>
			</div>
		</div> 
		{#if slider[i]}
		<div class="h-58 text-white max-w-[640px] preset-filled-surface-100-900" transition:slide={{ duration: 400 }}>
     	<div class="grid grid-cols-2 hr">
				<div class="flex m-auto">
					<span class="mr-2"><Sunrise size="22"/></span>
					<p class="text-lg">{day.sunRise}</p>
				</div>
				<div class="flex m-auto">
					<span class="mr-2"><Sunset size="22"/></span>
					<p class="text-lg">{day.sunSet}</p>
				</div>
			</div>
			<div class="grid  auto-cols-[61px] grid-flow-col overflow-x-auto gap-2 hr"> <!--  -->
				{#each getHourly(day) as hour, j}
				<div class="flex flex-col vr">
					<div class="flex m-auto mt-2">
						<p class="text-lg">{format(new Date(hour.time), "H",{locale: nl})}</p>
					</div>
					<div class="flex m-auto">
						<svg use:inlineSvg={getHourIcon(hour)} width="45" height="45"></svg>
					</div>
					<div class="mt-2">
						<p class="text-lg">{hour.airTemperature}°</p>
					</div>
					<div class="flex m-auto mt-2">
						<span class="align-middle m-auto"><svg class="text-white" use:inlineSvg={"/icons/svg/raindrop.svg"} width="16" height="16"></svg></span>
						<p class="text-lg">{hour.precipitationProbability}%</p>
					</div>
					<div class="flex m-auto mt-2">
						<span class="align-middle m-auto" style="rotate: {hour.windDirection}deg;"><svg class="text-white" use:inlineSvg={"/icons/svg/wind-direction2.svg"} width="18" height="18"></svg></span>
						<p class="text-lg">{hour.windAverage}</p>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{/if}
		{/each}
	</div>
</div>
