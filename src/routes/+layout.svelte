<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation, Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { HouseIcon, InfoIcon, FileTextIcon, Grid2x2Icon, MenuIcon, LayoutListIcon, ArrowLeftRightIcon, 
						XIcon, SettingsIcon, CircleIcon, SquareIcon, Logs, LogIn, LogOut, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { mqttClient } from '$lib/communication/MqttClient';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { weatherStore } from '$lib/stores/LbWeatherStore.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { utils } from '$lib/helpers/Utils';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbWeatherDialog from '$lib/components/Weather/LbWeatherDialog.svelte';
	import LbLoginDialog from '$lib/components/Login/LbLoginDialog.svelte';
	import LbLockScreenDialog from '$lib/components/LockScreen/LbLockScreenDialog.svelte';
	import { startLoxWsClient} from '$lib/communication/LoxWsClient';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';
	import { Logger } from '$lib/helpers/Logger';
	import { enableDragDropTouch } from '$lib/helpers/drag-drop-touch';
	import { Demo } from '$lib/demo/Demo';

	const env = page.data.env;
	const logLevel = env && env.APP_LOGLEVEL ? Number(env.APP_LOGLEVEL) : 0;
	const weatherUrl =  env && env.WEATHER_URL ? env.WEATHER_URL : '';

	const anchorRail = 'btn aspect-square pl-6 w-full max-w-[74px] flex flex-col items-center gap-0.5 ';
	const anchorSidebar = 'btn justify-start px-2 w-full ';
	const anchorBar = 'btn hover:preset-tonal flex-col items-center gap-1';
	const demo = new Demo();

	const options = {
		allowDragScroll: true,
		contextMenuDelayMS: 900,
		dragImageOpacity: 1, // was 0.5
		dragScrollPercentage: 10,
		dragScrollSpeed: 10,
		dragThresholdPixels: 5,
		forceListen: false,
		isPressHoldMode: true, // enabled to enforce waiting time
		pressHoldDelayMS: 300, // was 400 (default)
		pressHoldMargin: 25,
		pressHoldThresholdPixels: 0
	};

	let { children } = $props();

	let routes: Route[] = $state([
		{ label: 'Login', href: '/login', icon: LogIn, menu: true },
		{ label: 'Weather', href: '/weather', icon: FileTextIcon, menu: true },
		{ label: 'Settings', href: '/settings', icon: SettingsIcon,  menu: true },
		{ label: 'About', href: '/about', icon: InfoIcon, menu: true },
		{ label: 'Log', href: '/log', icon: Logs, menu: true },
		{ label: 'Home', href: '/', icon: HouseIcon, menu: false },
		{ label: 'Rooms', href: '/room', icon: Grid2x2Icon, menu: false },
		{ label: 'Categories', href: '/category', icon: LayoutListIcon,  menu: false },
		{ label: 'Messages', href: '/messages', icon: FileTextIcon, menu: false },
	]);

	let mobileMenuDialog = $state(false);
	let layoutRail = $state(true);
	let currentWeather = $derived(weatherStore.current);
	let dailyForecast = $derived(weatherStore.daily);
	let hourlyForecast = $derived(weatherStore.hourly);
	let date = $derived(appStore.date);
	let mqttStatus = $derived(appStore.mqttStatus);
	let loxStatus = $derived(appStore.loxStatus); // TODO use controlStore.msStatus?
	let nav = $derived(appStore.nav);
	let isDemo = $derived(appStore.isDemo);
	let path = $derived(page.url.pathname);
	let showWeather = $derived(appStore.showWeather && currentWeather.time > 0 && dailyForecast.length && hourlyForecast[0]);
	let activeNotifications = $derived(Object.values(controlStore.notificationsMap).filter( items => items.status == 1));
	let navigation = $derived(routes.filter((m) => !m.menu));

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '../../meteocons/svg/' + cur.icon + dayOrNight;
	}

	function checkUrl(href: string) {
		if (href === '/') {
			return page.url.pathname === href;
		}
		return page.url.pathname.includes(href);
	}

	function openWeather() {
		if (currentWeather.time > 0) {
			appStore.weatherDialog.state = true;
			appStore.setWeatherDialogTimeout();
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
		switch (s) {
			case '' : mobileMenuDialog = true; break;
			case '/weather' : openWeather(); break;
			case '/login' : appStore.loginDialog.state = true; break;
			case '/logout' : if (demo) { appStore.setDemo(0); } controlStore.disconnectClient(); break;
			default: goto(s);
		}
	}

	function toggleLayout() {
		layoutRail = !layoutRail;
	}

	$effect( () => {
		let found = routes.find ( item => item.href == path );
		if (found && !found.menu) {
			appStore.nav = ''; // main menu
		}
	});

	$effect( () => {
		if (loxStatus || isDemo) { // connected or demo
			routes[0] = { label: 'Logout', href: '/logout', icon: LogOut, menu: true };
			if (isDemo) {
				demo.start();
			}
			navigate((localStorage.getItem('startPage') || '/'));
		} else { // not connected
			routes[0] = { label: 'Login', href: '/login', icon: LogIn, menu: true };
			appStore.loginDialog.state = true; 
		}
	});

	// try to connect once (or start demo)
	if (isDemo) {
		demo.start();
	} else {
		startLoxWsClient();
	}

	// connect to MQTT server
	//mqttClient.connect(env.MQTT_HOSTNAME, env.MQTT_PORT, env.MQTT_USERNAME, env.MQTT_PASSWORD, env.MQTT_TOPIC);

	Logger(logLevel, true);
	enableDragDropTouch(document, document, options);
	weatherStore.startWeatherForecast(weatherUrl);
</script>

<svelte:head>
	<script>
		mode = localStorage.getItem('mode') || 'dark';
		document.documentElement.setAttribute('data-mode', mode);
		theme = localStorage.getItem('theme') || 'LoxBuddy';
		document.documentElement.setAttribute('data-theme', theme.toLowerCase());
		locale = localStorage.getItem('locale') || 'en';
		document.documentElement.setAttribute('lang', locale);
</script>
</svelte:head>

<!-- click activity resets timeout for lockscreen -->
<svelte:body onclick={() => {appStore.resetLockScreenDialogTimeout()}}/>

{#if (innerWidth.current != undefined) && innerWidth.current > 768 } <!-- tabled / landscape mode  -->
<div class="w-full h-screen md:grid grid-cols-[auto_1fr]">
	<Navigation layout={ layoutRail ? 'rail' : 'sidebar'}
							class={ layoutRail ? '' : 'grid grid-rows-[1fr_auto] gap-4 w-[180px]'}>
		<Navigation.Content>
			<Navigation.Header>
				<a class="flex justify-center items-center mb-1 {layoutRail ? '' : '-mt-2'}" href="/about">
					<img src="/icons/svg/loxbuddy.svg" width="50" alt="about"/>
				</a>
				{#if showWeather}
					<div class="mt-2 flex justify-center items-center">
						<button class="flex flex-row items-center" onclick={openWeather}>
							<LbIcon name={getCurrentIcon(currentWeather)} width="48" height="48"/>	
							<span class="text-[20px] truncate">{currentWeather.airTemperature}°</span>
						</button>
					</div>
				{/if}
				<div class="flex justify-center items-center" onclick={(e)=>{e.stopPropagation(); appStore.lockScreenDialog.state=true;}}>
					<p class="text-right text-xl font-medium">{format(date, "p")}</p>
				</div>
			</Navigation.Header>
			<Navigation.Menu>
			{#if layoutRail}
				{#each navigation as link (link)}
					{@const Icon = link.icon}
					<div onclick={() => { navigate(link.href)}} class={anchorRail}>
						<div class="relative inline-block">
							{#if link.label == "Messages" && activeNotifications.length}
								<span class="badge-icon size-[2px] font-semibold preset-filled-primary-500 absolute -right-2 -top-2 z-10">{activeNotifications.length}</span>
							{/if}
							<Icon class={checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}/>
						</div>
						<span class="text-[12px] + {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{$_(link.label)}</span>
					</div>
				{/each}
			{:else}
				<Navigation.Group>
					<Navigation.Label class="capitalize pl-2">Menu</Navigation.Label>
					<Navigation.Menu>
						{#each routes as link (link)}
							{@const Icon = link.icon}
							<div onclick={() => { toggleLayout(); navigate(link.href)}} class={anchorSidebar} 
								aria-label={link.label}>
								<Icon class="size-4 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}"/>
								<span class="{checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{$_(link.label)}</span>
							</div>
						{/each}
					</Navigation.Menu>
				</Navigation.Group>
			{/if}
			</Navigation.Menu>
		</Navigation.Content>
		<Navigation.Footer>
			<button type="button" class={layoutRail ? anchorRail : anchorSidebar} onclick={toggleLayout}>
					<ArrowLeftRightIcon/>
			</button>
			{#if appStore.showStatus && !layoutRail}
				<div class="mt-3 ml-2 mb-1 flex flex-col justify-left gap-2 {layoutRail ? '' : '-mb-2'}">
					<div class="flex flex-row items-center gap-2">
						<CircleIcon class={getStatusColor(mqttStatus)} size="16"/>
						<span class="text-xs">MQTT</span>
					</div>
					<div class="flex flex-row items-center gap-2">
						<SquareIcon class={getStatusColor(loxStatus)} size="16"/>
						<span class="text-xs">Miniserver</span>
					</div>
				</div>
			{/if}
		</Navigation.Footer>
	</Navigation>
	<div class="w-full h-screen overflow-auto" onclick={() => {layoutRail = true}}>
		{@render children()}
	</div>
</div>
{:else} <!-- mobile / portait mode -->
<div class="w-full h-screen grid grid-rows-[1fr_auto]">
	<Navigation layout="bar" class="fixed top-0 z-1 h-[65px] flex justify-center items-center shadow-md w-screen">
		<Navigation.Menu class="grid grid-cols-3 gap-2">
			<div class="flex flex-row justify-left items-center gap-2">
				<button class="ml-2" onclick={() => {navigate(nav)}}>
					<LbIcon name={nav == '' ? 'MenuIcon' : 'ArrowLeftIcon'}/>
				</button>
				{#if showWeather}
					<button class="-ml-1 flex flex-row justify-center items-center gap-1" onclick={openWeather}>
						<LbIcon name={getCurrentIcon(currentWeather)} width="48" height="48"/>	
						<span class="-ml-1 text-[22px] truncate">{currentWeather.airTemperature}°</span>
					</button>
				{/if}
			</div>
			<div class="flex justify-center items-center">
				<a href="/about">
					<span class="text-[20px] dark:text-primary-500 text-primary-700 font-medium">LOXBUDDY</span>
				</a>
			</div>
			<div class="mr-2 pb-1 flex flex-row gap-3 justify-end items-center">
				<div onclick={(e)=>{e.stopPropagation(); appStore.lockScreenDialog.state=true;}}>
					<p class="text-right text-2xl font-medium">{format(date, "p")}</p>
				</div>
			</div>
		</Navigation.Menu>
	</Navigation>
	<div class="pt-[55px]">
		{@render children()}
	</div>
	{#if navigation.find ( item => item.href == path )}
		<Navigation layout="bar" class="sticky bottom-0 h-[68px] shadow-inner">
			<Navigation.Menu class="grid grid-cols-4 gap-2">
				{#each navigation as link (link)}
					{@const Icon = link.icon}
					<div onclick={() => {navigate(link.href)}}  class={anchorBar}>
						<div class="relative inline-block">
							{#if link.label == "Messages" && activeNotifications.length}
								<span class="badge-icon size-[2px] font-semibold preset-filled-primary-500 absolute -right-2 -top-2 z-10">{activeNotifications.length}</span>
							{/if}
							<Icon class="size-5 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}" />
						</div>
						<span class="text-[12px] {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{$_(link.label)}</span>
					</div>
				{/each}
			</Navigation.Menu>
		</Navigation>
	{/if}
</div>
{/if}

<LbWeatherDialog />
<LbLoginDialog />
<LbLockScreenDialog />

<Dialog
	open={mobileMenuDialog}
	onInteractOutside={() => mobileMenuDialog = false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete duration-400
				transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100"/>
		<Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
			<Dialog.Content class="h-screen card bg-surface-100-900 w-sm p-4 space-y-4 shadow-xl transition transition-discrete duration-400 ease-in-out
					-translate-x-full starting:data-[state=open]:-translate-x-full 
					data-[state=open]:translate-x-0 max-w-[200px]">
				<header class="grid grid-cols-2 gap-2">
					<div class="ml-1 flex justify-left items-center">
						<img src="/icons/svg/loxbuddy.svg" width="50" alt="about"/>
					</div>
					<div class="flex justify-end">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => mobileMenuDialog = false}>
							<XIcon class="size-4"/>
						</button>
					</div>
				</header>
				<div class="flex flex-col">
					{#each routes.filter((m) => m.menu) as link (link)}
						{@const Icon = link.icon}
						<div onclick={() => { mobileMenuDialog = false; navigate(link.href)}} class={anchorSidebar} 
							aria-label={link.label}>
							<Icon class="size-4 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}"/>
							<span class="{checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{$_(link.label)}</span>
						</div>
					{/each}
				</div>
				{#if appStore.showStatus}
					<footer class="fixed left-0 bottom-0">
						<div class="ml-4 mb-4 flex flex-col justify-left gap-2">
							<div class="flex flex-row items-center gap-2">
								<CircleIcon class={getStatusColor(mqttStatus)} size="16"/>
								<span class="text-xs">MQTT</span>
							</div>
							<div class="flex flex-row items-center gap-2">
								<SquareIcon class={getStatusColor(loxStatus)} size="16"/>
								<span class="text-xs">Miniserver</span>
							</div>
						</div>
					</footer>
				{/if}
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
