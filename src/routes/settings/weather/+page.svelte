<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { weatherStore } from '$lib/stores/LbWeatherStore.svelte';

	let showWeather = $state(localStorage.getItem('showWeather') || '0');
	let weatherUrl = $state(localStorage.getItem('weatherUrl') || '');

	/**
	 * Show weather forecast in menu
	 * @param event switch event state
	 */
	function onShowWeather(event: { checked: boolean }): void {
		showWeather = event.checked ? '1' : '0';
		localStorage.setItem('showWeather', showWeather);
		appStore.showWeather = event.checked;
		if (showWeather=='1') {
			weatherStore.startWeatherForecast();
		}
	};

	/**
	 * Specify weather Url, e.g. path to Weather4Lox emu page
	 * @param url URL to weather forecast
	*/
	function setWeatherUrl(url: string): void {
		weatherUrl = url;
		localStorage.setItem('weatherUrl', url);
		weatherStore.weatherUrl = weatherUrl;
		weatherStore.startWeatherForecast();
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Weather")}</p>
	</div>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Show weather")}</p>
			<Switch checked={showWeather == "1"} onCheckedChange={onShowWeather}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<div class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<p class="w-[200px] {showWeather == '0' ? 'opacity-50' : ''}">{$_("Weather URL")}</p>
		<input class="ig-input text-right" type="text" bind:value={() => weatherUrl,
				(v) => setWeatherUrl(v)} placeholder="http://weather.url" disabled={showWeather=='0'} />
	</div>
</div>
