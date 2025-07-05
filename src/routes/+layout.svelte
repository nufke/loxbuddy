<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { fade } from 'svelte/transition'
  import { Home, FileText, Grid2x2, Menu, LayoutList, Circle, Square, type Icon as IconType } from '@lucide/svelte';
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
	import LbLockScreenModal from '$lib/components/lb-lock-screen-modal.svelte';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';

	/* start MQTT client */
	mqttConnect(page.data.mqtt);

	let { children } = $props();

	let currentWeather = $derived(weatherStore.current);
	let dailyForecast = $derived(weatherStore.daily);
	let time = $derived(store.time);
	let mqttStatus =  $derived(store.mqttStatus);
	let msStatus =  $derived(store.msStatus);
	let nav = $derived(store.nav);
	let path = $derived(page.url.pathname);
	let home = { label: 'Menu', href: '/menu', icon: Menu }; // fixed for tablet
	let weatherAvailable = $derived(currentWeather.time > 0 && dailyForecast.length);
	let activeNotifications = $derived(Object.values(store.notificationsMap).filter( items => items.status == 1));

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = Utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = Utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	const routesMobile: Route[] = $derived([
		{ label: 'Home', href: '/', icon: Home, badge: false },
		{ label: 'Rooms', href: '/room', icon: Grid2x2, badge: false },
		{ label: 'Categories', href: '/category', icon: LayoutList, badge: false },
		{ label: 'Messages', href: '/messages', icon: FileText, badge: true },
	]);

	let routesTablet: Route[] = $derived([
		...routesMobile, home
	]);

	function checkUrl(href: string) {
		if (href === '/') {
			return page.url.pathname === href;
		}
		return page.url.pathname.includes(href);
	}

	function openWeather() {
		if (currentWeather.time > 0) {
			store.weatherModal.state = true;
			store.setWeatherModalTimeout();
		}
	}

	function getStatusColor(state: number) {
		let str = 'text-surface-500 fill-surface-500';
		switch (state) {
			case 0: str = 'text-surface-500 fill-surface-500'; break; // disconnected / unknown status
			case 1: str = 'text-green-500 fill-green-500'; break;			// connected / OK / info
			case 2: str = 'text-yellow-500 fill-yellow-500'; break; 	// warning / issue
			case 3: str = 'text-red-500 fill-red-500'; break; 				// error
			default: /* none */
		}
		return str;
	}

	function navigate(s: string) {
		goto(s);
		store.setNav({ label: 'Menu', href: '/menu', icon: Menu });
	}

	$effect( () => {
		let found = routesMobile.find ( item => item.href == path );
		if (found) {
			store.setNav({ label: 'Menu', href: '/menu', icon: Menu });
		}
	});

	store.resetLockScreenModalTimeout();
</script>

<svelte:head>
  <script>
    mode = localStorage.getItem('mode') || 'light';
    document.documentElement.setAttribute('data-mode', mode);
    theme = localStorage.getItem('theme') || 'Cerebus';
    document.documentElement.setAttribute('data-theme', theme.toLowerCase());
  </script>
</svelte:head>

<!-- click activity resets timeout for lockscreen -->
<svelte:body onclick={() => {store.resetLockScreenModalTimeout()}}/>

<!-- we need to use the innerWidth to avoid we render the children twice -->
{#if (innerWidth.current != undefined) && innerWidth.current > 768 } <!-- tabled mode -->
<div class="hidden md:grid grid-cols-[auto_1fr]">
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail headerClasses="h-[20%] inline-block align-top" tilesClasses="h-[60%]" footerClasses="h-[20%] justify-end">
		{#snippet header()}
		<div onclick={(e)=>{ e.stopPropagation(); store.lockScreenModal.state=true;}}>
			<p class="mt-2 mb-4 text-center font-medium m-auto text-2xl">{format(time, "p")}</p>
		</div>
		{#if weatherAvailable}
			<Navigation.Tile classes="-mt-4 justify-center hover:bg-transparent" onclick={openWeather}>
				<div>
					<LbIcon class="-mb-2" name={getCurrentIcon(currentWeather)} width="50" height="50"/>
					<span class="text-2xl">{currentWeather.airTemperature}°</span>
				</div>
			</Navigation.Tile>
			{/if}
		{/snippet}
		{#snippet tiles()}
		{#each routesTablet as {label, href, icon, badge}}
		  {@const Icon = icon}
			<Navigation.Tile labelClasses={checkUrl(href) ? 'text-primary-500' : 'white'} classes="flex-col justify-center hover:bg-transparent scope:bg-transparent" label={$_(label)} {href}>
				<div class="relative inline-block">
					{#if badge && activeNotifications.length}
						<span class="absolute w-[17px] h-[17px] rounded-full bg-red-500 dark:text-white text-white -right-2 -top-2 text-xs flex justify-center items-center"
									transition:fade={{ duration: 300 }}><span class="-mb-[2px]">{activeNotifications.length}</span></span>
					{/if}
					<Icon class={checkUrl(href) ? 'text-primary-500' : 'white'} />
				</div>
			</Navigation.Tile>
		{/each}
		{/snippet}
		{#snippet footer()}
			<div class="flex flex-row gap-3 mb-2">
				<Circle class={getStatusColor(mqttStatus)} size="16"/>
				<Square class={getStatusColor((mqttStatus==1) ? msStatus : 0)} size="16"/>
			</div>
		{/snippet}
	</Navigation.Rail>
</aside>
  <main>
		{@render children()}
  </main>
</div>
{:else}
<div class="md:hidden grid grid-rows-[auto_1fr_auto]"> <!-- mobile mode -->
	<header class="sticky preset-filled-surface-100-900 top-0 z-1">
		<div class="grid grid-cols-3 text-center items-center m-auto h-[60px]">
			<div class="flex flex-row text-center items-center gap-3">
				<button class="ml-4 mr-0 text-left" onclick={() => {navigate(nav.href)}}>
					<LbIcon name={nav.label}/>
				</button>
				{#if weatherAvailable}
					<button class="ml-0 m-auto flex flex-row items-center" onclick={openWeather}>
						<LbIcon name={getCurrentIcon(currentWeather)} width="48" height="48"/>	
						<span class="text-lg truncate">{currentWeather.airTemperature}°</span>
					</button>
				{/if}
			</div>
			<div>
				<span class="text-xl text-primary-500 font-medium">LoxBuddy</span>
			</div>
			<div class="mr-3 flex flex-row gap-3 justify-end">
				<div onclick={(e)=>{e.stopPropagation(); store.lockScreenModal.state=true;}}>
					<p class="text-right text-2xl font-medium">{format(new Date(), "p")}</p>
				</div>
				<div class="flex flex-col gap-2">
					<Circle class={getStatusColor(mqttStatus)} size="16"/>
					<Square class={getStatusColor((mqttStatus==1) ? msStatus : 0)} size="16"/>
				</div>
			</div>
		</div>
	</header>
	<main class="main">
		{@render children()}
	</main>
	<footer class="sticky bottom-0">
		<Navigation.Bar>
			{#each routesMobile as {label, href, icon, badge}}
				{@const Icon = icon} 
				<Navigation.Tile labelClasses={checkUrl(href) ? 'text-primary-500' : 'text-surface-950 dark:text-surface-50'} classes="flex flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
					<div class="relative inline-block">
						{#if badge && activeNotifications.length}
						<span class="absolute w-[17px] h-[17px] rounded-full bg-red-500 dark:text-white text-white -right-2 -top-2 text-xs flex justify-center items-center"
									transition:fade={{ duration: 300 }}><span class="-mb-[2px]">{activeNotifications.length}</span></span>
						{/if}
						<Icon class={checkUrl(href) ? 'text-primary-500' : 'white'} />
					</div>
				</Navigation.Tile>
			{/each}
		</Navigation.Bar>
	</footer>
</div>
{/if}

<LbWeatherModal />
<LbLockScreenModal />

<style>
.main {
	min-height: calc(100vh - 140px); /* trick to keep sticky footer at bottom */
}
</style>
