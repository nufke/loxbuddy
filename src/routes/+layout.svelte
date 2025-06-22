<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
  import { Home, List, FileText, Grid2x2, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { mqttConnect } from '$lib/communication/mqttclient';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { Utils } from '$lib/helpers/utils';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbWeatherModal from '$lib/components/lb-weather-modal.svelte';

	/* start MQTT client */
	mqttConnect(page.data.mqtt);

	let { children } = $props();

	let currentWeather = $derived(weatherStore.current);
	let showWeatherModal = $state(false);

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = Utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = Utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	const routes: Route[] = $derived([
		{ label: 'Home', href: '/', icon: Home },
		{ label: 'Rooms', href: '/room', icon: Grid2x2 },
		{ label: 'Categories', href: '/category', icon: List },
		{ label: 'Messages', href: '/messages', icon: FileText },
	]);

	function checkUrl(href: string) {
		if (href === '/') {
			return page.url.pathname === href;
		}
		return page.url.pathname.includes(href);
	}

	function openWeather() {
		if (currentWeather.time>0) {
			showWeatherModal = true;
		}
	}
</script>

<!-- we need to use the innerWidth to avoid we render the children twice -->
{#if (innerWidth.current != undefined) && innerWidth.current > 768 } <!-- tabled mode -->
<div class="hidden md:grid grid-cols-[auto_1fr]">
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail>
		{#snippet tiles()}
		{#each routes as {label, href, icon}}
		  {@const Icon = icon}
			<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'white'} classes="flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
				<Icon class={checkUrl(href) ? 'text-green-500' : 'white'} />
			</Navigation.Tile>
		{/each}
		{#if currentWeather.airTemperature}
			<Navigation.Tile classes="justify-center hover:bg-transparent" onclick={openWeather}>
				<div class="flex flex-col">
					<LbIcon class="" name={getCurrentIcon(currentWeather)} width="50" height="50"/>
					<span class="relative -m-3 text-md">{currentWeather.airTemperature} °C</span>
				</div>
			</Navigation.Tile>
		{/if}
		{/snippet}
	</Navigation.Rail>
</aside>
  <main>
		{@render children()}
  </main>
</div>
{:else}
<div class="md:hidden grid grid-rows-[auto_1fr_auto]"> <!-- mobile mode -->
	<header class="preset-filled-surface-100-900 sticky top-0 z-1">
		<div class="grid grid-cols-3 text-center items-center m-auto h-[50px]">
			<div>
			{#if currentWeather.airTemperature}
				<button class="flex flex-row gap-1 items-center m-auto" onclick={openWeather}>
					<LbIcon name={getCurrentIcon(currentWeather)} width="50" height="50"/>	
					<span class="text-lg">{currentWeather.airTemperature} °C</span>
			</button>
			{/if}
			</div>
			<div>
				<span class="text-xl">LoxBuddy</span>
			</div>
			<div>
			</div>
		</div>
	</header>
	<main class="main">
		{@render children()}
	</main>
	<footer class="sticky bottom-0">
		<Navigation.Bar>
			{#each routes as {label, href, icon}}
				{@const Icon = icon}
				<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'white'} classes="flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
					<Icon class={checkUrl(href) ? 'text-green-500' : 'white'} />
				</Navigation.Tile>
			{/each}
		</Navigation.Bar>
	</footer>
</div>
{/if}

<LbWeatherModal bind:open={showWeatherModal} />

<style>
.main {
	min-height: calc(100vh - 80px); /* trick to keep sticky footer at bottom */
}
</style>
