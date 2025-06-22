<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
  import { Home, List, FileText, Grid2x2, Menu, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { mqttConnect } from '$lib/communication/mqttclient';
	import { store } from '$lib/stores/store.svelte';
	import { weatherStore } from '$lib/stores/weather-store.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { Utils } from '$lib/helpers/utils';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbWeatherModal from '$lib/components/lb-weather-modal.svelte';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';

	/* start MQTT client */
	mqttConnect(page.data.mqtt);

	let { children } = $props();

	let currentWeather = $derived(weatherStore.current);
	let showWeatherModal = $state(false);
	let time = $derived(store.time);

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

	function mainMenu() {
	}

</script>

<!-- we need to use the innerWidth to avoid we render the children twice -->
{#if (innerWidth.current != undefined) && innerWidth.current > 768 } <!-- tabled mode -->
<div class="hidden md:grid grid-cols-[auto_1fr]">
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail headerClasses="h-[20%] inline-block align-top" tilesClasses="h-[60%]" footerClasses="h-[20%]">
		{#snippet header()}
      <Navigation.Tile labelExpanded="Menu" classes="flex-col justify-center hover:bg-transparent" onclick={mainMenu} title="Toggle Menu Width">
				<Menu/>
			</Navigation.Tile>
			{#if currentWeather.airTemperature}
				<Navigation.Tile classes="-mt-4 justify-center hover:bg-transparent" onclick={openWeather}>
						<LbIcon class="" name={getCurrentIcon(currentWeather)} width="50" height="50"/>
						<span class="relative -mt-3 text-lg">{currentWeather.airTemperature}°</span>
						<p class="text-lg">{format(time, "p", {locale: nl})}</p>
				</Navigation.Tile>
			{/if}
		{/snippet}
		{#snippet tiles()}
		{#each routes as {label, href, icon}}
		  {@const Icon = icon}
			<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'white'} classes="flex-col justify-center hover:bg-transparent scope:bg-transparent" label={$_(label)} {href}>
				<Icon class={checkUrl(href) ? 'text-green-500' : 'white'} />
			</Navigation.Tile>
		{/each}
		{/snippet}
		{#snippet footer()}
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
		<div class="grid grid-cols-3 text-center items-center m-auto h-[60px]">
			<div class="flex flex-row text-center items-center gap-3">
				<span class="ml-4 text-left"><Menu/></span>
				{#if currentWeather.airTemperature}
					<button class="flex flex-row items-center" onclick={openWeather}>
						<LbIcon name={getCurrentIcon(currentWeather)} width="48" height="48"/>	
						<span class="text-md truncate">{currentWeather.airTemperature} °C</span>
				</button>
				{/if}
			</div>
			<div>
				<span class="text-xl text-green-500 font-medium">LoxBuddy</span>
			</div>
			<div>
				<p class="text-right text-2xl mr-5">{format(new Date(), "p", {locale: nl})}</p>
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
				<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'text-white'} classes="flex flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
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
