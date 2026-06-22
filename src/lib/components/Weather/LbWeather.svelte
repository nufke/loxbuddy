<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { weatherStore } from '$lib/stores/LbWeatherStore.svelte';
	import { slide, fade } from 'svelte/transition';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { utils } from '$lib/helpers/Utils';
	import LbMoonIcon from '$lib/components/Weather/LbMoonIcon.svelte';

	let slider = $state(Array.from({ length: 8 }, (_, i) => i === 0));

	let current = $derived(weatherStore.current);
	let daily = $derived(weatherStore.daily);
	let hourly = $derived(weatherStore.hourly);
	let loaded = $derived(current.time > 0 && daily.length);
	let date = $derived(appStore.date);

	/**
	 * Close the weather view and resets close all sliders
	 */
	function close(): void {
		appStore.weatherDialogOpen = false;
		slider = Array.from({ length: 8 }, (_, i) => i === 0);
	}

	/**
	 * Toggles the hourly forecast panel for a given day index.
	 * No-op when no hourly data is available for that day.
	 *
	 * @param i - index of the day in the `daily` forecast array.
	 */
	function openSlider(i: number): void {
		if (hourly[i]) slider[i] = !slider[i];
	}

	/**
	 * Returns the weather icon path for the current conditions,
	 * selecting the day or night variant based on sunrise/sunset times.
	 *
	 * @param cur - current weather conditions object.
	 * @returns relative path to the SVG meteocon icon.
	 */
	function getCurrentIcon(cur: WeatherCurrentConditions): string {
		const sunRise = utils.time2epoch(cur.time, cur.sunRise);
		const sunSet = utils.time2epoch(cur.time, cur.sunSet);
		const dayOrNight = cur.time > sunRise && cur.time < sunSet ? '-day.svg' : '-night.svg';
		return '../../meteocons/svg/' + cur.icon + dayOrNight;
	}

	/**
	 * Returns the weather icon path for a daily forecast row,
	 * using the day variant for future days and the current time of day for today.
	 *
	 * @param day - daily forecast entry.
	 * @returns relative path to the SVG meteocon icon.
	 */
	function getDayIcon(day: WeatherDailyForecast): string {
		const sunRise = utils.time2epoch(day.time, day.sunRise);
		const sunSet = utils.time2epoch(day.time, day.sunSet);
		const currentDay = utils.time2epoch(current.time, '00:00');
		const dayOrNight =
			(date.valueOf() > sunRise && date.valueOf() < sunSet) || day.time !== currentDay
				? '-day.svg'
				: '-night.svg';
		return '../../meteocons/svg/' + day.icon + dayOrNight;
	}

	/**
	 * Returns the weather icon path for an hourly forecast cell,
	 * selecting day or night variant using the parent day's sunrise/sunset.
	 *
	 * @param hour - hourly forecast entry.
	 * @param day - parent daily forecast entry (provides sunrise/sunset).
	 * @returns relative path to the SVG meteocon icon.
	 */
	function getHourIcon(hour: WeatherHourlyForecast, day: WeatherDailyForecast): string {
		const sunRise = utils.time2epoch(hour.time, day.sunRise);
		const sunSet = utils.time2epoch(hour.time, day.sunSet);
		const dayOrNight = hour.time > sunRise && hour.time < sunSet ? '-day.svg' : '-night.svg';
		return '../../meteocons/svg/' + hour.icon + dayOrNight;
	}

	/**
	 * Returns the hourly forecasts that fall within a given day's window,
	 * extending the window when fewer than 11 hours are available.
	 *
	 * @param day - daily forecast entry defining the day boundary.
	 * @returns array of hourly forecast entries for that day.
	 */
	function getHourly(day: WeatherDailyForecast): WeatherHourlyForecast[] {
		let hours = hourly.filter(
			(h) => h.time > date.valueOf() && h.time >= day.time && h.time < day.time + 86400000
		);
		if (hours.length < 11) {
			const cnt = 11 - hours.length;
			hours = hourly.filter(
				(h) => h.time > date.valueOf() && h.time >= day.time && h.time < day.time + 86400000 + cnt * 3600000
			);
		}
		return hours;
	}
</script>

<LbDialog open={appStore.weatherDialogOpen} onClose={close} title={current.location}
	zIndex="z-100" isFullscreen={true}>
	{#snippet description()}
		{#if loaded}
				<div class="-mt-2 text-center m-auto max-w-[768px]">
					<p class="text-lg">{format(date, 'PPP p')}</p>
					<div class="ml-1 grid grid-cols-2 mb-5">
						<div>
							<p class="text-[120px] font-medium ml-8">{current.airTemperature}<span class="font-normal">°</span></p>
						</div>
						<div class="m-auto">
							<LbIcon name={getCurrentIcon(current)} width="160"/>
						</div>
						<div>
							<p class="text-xl">{$_('Feels like')} <span>{current.feelsLike}°</span></p>
						</div>
						<div>
							<p class="text-xl">{$_(current.conditions)}</p>
						</div>
						<div class="flex flex-col gap-4 mt-8 m-auto">
							<div class="flex gap-2">
								<LbIcon name="humidity" width="32" height="32"/>
								<p class="text-lg"><span class="font-medium">{current.relativeHumidity}%</span> {$_('Humidity')}</p>
							</div>
							<div class="flex gap-2">
								<LbIcon name="tabler:circle-arrow-up-right" width="32" height="27"/>
								<p class="text-lg"><span class="font-medium">{current.stationPressure}</span> mbar</p>
							</div>
							<div class="flex gap-2"></div>
						</div>
						<div class="flex flex-col gap-4 mt-8 m-auto">
							<div class="flex gap-2">
								<span style="rotate: {current.windDirection}deg;"><LbIcon name="si:direction-line" width="24" height="24"/></span>
								<p class="text-lg"><span class="font-medium">{current.windAverage}</span> km/h</p>
							</div>
							<div class="flex gap-2">
								<LbIcon name="sun" width="32" height="32"/>
								<p class="text-lg"><span class="font-medium">{current.solarRadiation}</span></p>
							</div>
							<div class="flex gap-2">
								<LbIcon name="rain-meter" width="32" height="25"/>
								<p class="text-lg"><span class="font-medium">{current.precipitationToday}</span> mm</p>
							</div>
						</div>
					</div>
					{#each daily as day, i}
						<div class="mt-2 m-auto max-w-[768px] bg-surface-100-900" onclick={() => openSlider(i)}>
							<div class="grid grid-cols-8 p-2 h-[85px]">
								<div class="col-span-3 pl-2 pr-0 my-auto">
									<p class="text-left text-lg font-medium truncate">{i ? format(new Date(day.time), 'eeee d') : $_('Today')}</p>
									<p class="text-left text-md truncate">{$_(day.conditions)}</p>
								</div>
								<div class="col-span-2 align-middle m-auto">
									<LbIcon name={getDayIcon(day)} width="70"/>
								</div>
								<div class="flex flex-row m-auto justify-center align-center">
									<span class="align-middle m-auto"><LbIcon name="raindrop" width="16" height="16"/></span>
									<p class="text-lg">{day.precipitationProbability}%</p>
								</div>
								<div class="flex flex-row m-auto justify-center align-center">
									<span class="align-middle m-auto"><LbIcon height="16" width="16" name="arrow-down"/></span>
									<p class="text-lg">{day.airTemperatureLow}°</p>
								</div>
								<div class="flex flex-row m-auto justify-center align-center">
									<span class="align-middle m-auto"><LbIcon height="16" width="16" name="arrow-up"/></span>
									<p class="text-lg">{day.airTemperatureHigh}°</p>
								</div>
							</div>
						</div>
						{#if slider[i]}
							<div class="m-auto max-w-[768px] bg-surface-100-900" transition:slide={{ duration: 400 }}>
								<div transition:fade={{ duration: 200 }}>
									{#if day.sunRise && day.sunSet}
										<div class="grid grid-cols-3 hr p-1">
											<div class="flex m-auto">
												<span class="mr-2 m-auto"><LbIcon name="sunrise" height="22" width="22"/></span>
												<p class="text-lg">{day.sunRise}</p>
											</div>
											<div class="flex m-auto">
												<span class="mr-2 m-auto"><LbIcon name="sunset" height="22" width="22"/></span>
												<p class="text-lg">{day.sunSet}</p>
											</div>
											<div class="flex m-auto">
												<span class="mr-2 m-auto"><LbMoonIcon phase={day.moonIllumination}/></span>
												<p class="text-lg">{day.moonIllumination < 0.01 ? 'new' : day.moonIllumination > 0.99 ? 'full' : (day.moonIllumination * 100).toFixed(0) + '%'}</p>
											</div>
										</div>
									{/if}
									<div class="grid auto-cols-[62px] grid-flow-col overflow-x-auto gap-2 hr h-48">
										{#each getHourly(day) as hour}
											<div class="grid-mw pl-2 flex flex-col vr">
												<div class="flex align-middle m-auto">
													<p class="text-lg">{hour.hour}</p>
												</div>
												<div class="flex m-auto">
													<span class="align-middle m-auto"><LbIcon name={getHourIcon(hour, day)} width="45" height="45"/></span>
												</div>
												<div>
													<p class="text-lg">{hour.airTemperature}°</p>
												</div>
												<div class="flex m-auto mt-1">
													<span class="align-middle m-auto"><LbIcon name="raindrop" width="16" height="16"/></span>
													<p class="text-lg">{hour.precipitationProbability}%</p>
												</div>
												<div class="flex m-auto mb-2">
													<span class="align-middle m-auto" style="rotate: {hour.windDirection}deg;"><LbIcon name="si:direction-line" width="18" height="18"/></span>
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
				<div class="flex justify-center items-center py-20">
					<p class="dark:text-surface-50 text-surface-950 text-xl">{$_('Waiting for weather data ...')}</p>
				</div>
			{/if}
	{/snippet}
</LbDialog>
