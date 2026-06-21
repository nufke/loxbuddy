<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { weatherStore } from '$lib/stores/LbWeatherStore.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { utils } from '$lib/helpers/Utils';

	let currentWeather = $derived(weatherStore.current);
	let date = $derived(appStore.date);
	let showWeather = $derived(appStore.showWeather);

	/**
	 * Returns the weather icon path for the current conditions,
	 * selecting the day or night variant based on sunrise/sunset times.
	 *
	 * @param current - current weather conditions object.
	 * @returns relative path to the SVG meteocon icon.
	 */
	function getCurrentIcon(current: WeatherCurrentConditions): string {
		const sunRise = utils.time2epoch(current.time, current.sunRise);
		const sunSet = utils.time2epoch(current.time, current.sunSet);
		const dayOrNight = current.time > sunRise && current.time < sunSet ? '-day.svg' : '-night.svg';
		return '../../meteocons/svg/' + current.icon + dayOrNight;
	}
</script>

<LbDialog open={appStore.lockScreenDialogOpen} onClose={() => appStore.resetLockScreenDialogTimeout()}
	title="" zIndex="z-2000" isFullscreen={true}>
	{#snippet description()}
		<div class="flex justify-center items-center h-screen">
			<div class="flex flex-col">
				{#if showWeather && currentWeather && currentWeather.airTemperature != undefined}
					<div class="flex justify-left items-center">
						<LbIcon name={getCurrentIcon(currentWeather)} width="80" height="80"/>
						<span class="text-4xl truncate">{currentWeather.airTemperature}°</span>
					</div>
				{/if}
				<div>
					<p class="mt-2 pl-3 text-7xl font-bold">{format(date, 'p')}</p>
					<p class="mt-2 pl-3 text-4xl">{format(date, 'eeee d LLLL')}</p>
				</div>
			</div>
		</div>
	{/snippet}
</LbDialog>
