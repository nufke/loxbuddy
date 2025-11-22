<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation, Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
	import { HouseIcon, InfoIcon, FileTextIcon, Grid2x2Icon, MenuIcon, LayoutListIcon, ArrowLeftRightIcon, 
						XIcon, SettingsIcon, CircleIcon, SquareIcon, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { mqttClient } from '$lib/communication/MqttClient';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { loxWsClient } from '$lib/communication/LoxWsClient';
	import { weatherStore } from '$lib/stores/WeatherStore.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { utils } from '$lib/helpers/Utils';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbWeatherDialog from '$lib/components/Weather/LbWeatherDialog.svelte';
	import LbLockScreenDialog from '$lib/components/LockScreen/LbLockScreenDialog.svelte';
	import { format } from 'date-fns';
	import { goto } from '$app/navigation';
	import { test } from '$lib/test/Test';
	import { enableDragDropTouch } from '$lib/helpers/drag-drop-touch';

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
	enableDragDropTouch(document, document, options);

	const env = page.data.env;
	const isTest = Number(env.TEST) ? true : false;

	if (isTest) {
		/* load test demo structure */
		test.start();
	} else {
		// connect to MQTT server
		mqttClient.connect(env.MQTT_HOSTNAME, env.MQTT_PORT, env.MQTT_USERNAME, env.MQTT_PASSWORD, env.MQTT_TOPIC, isTest);
		// connect to Miniserver via WebSocket
		loxWsClient.connect(env.MS_HOST, env.MS_USERNAME, env.MS_PASSWORD, appStore.appId, 0, isTest);
	}

	let { children } = $props();

	let mobileMenuDialog = $state(false);
	let currentWeather = $derived(weatherStore.current);
	let dailyForecast = $derived(weatherStore.daily);
	let hourlyForecast = $derived(weatherStore.hourly);
	let time = $derived(appStore.time);
	let mqttStatus = $derived(appStore.mqttStatus);
	let msStatus = $derived(controlStore.msStatus);
	let nav = $derived(appStore.nav);
	let path = $derived(page.url.pathname);
	let weatherAvailable = $derived(currentWeather.time > 0 && dailyForecast.length && hourlyForecast[0]);
	let activeNotifications = $derived(Object.values(controlStore.notificationsMap).filter( items => items.status == 1));

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}

	const routes: Route[] = $derived([
		{ label: 'Home', href: '/', icon: HouseIcon, badge: false, root: true, nav: true },
		{ label: 'Rooms', href: '/room', icon: Grid2x2Icon, badge: false, root: true, nav: true },
		{ label: 'Categories', href: '/category', icon: LayoutListIcon, badge: false, root: true, nav: true },
		{ label: 'Messages', href: '/messages', icon: FileTextIcon, badge: true, root: true, nav: true },
		{ label: 'Settings', href: '/settings', icon: SettingsIcon, badge: false, root: false, nav: false },
		{ label: 'About', href: '/about', icon: InfoIcon, badge: false, root: false, nav: false }
	]);

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
		if (s.length) {
			goto(s);
		} else {
			mobileMenuDialog = true;
		}
	}

	$effect( () => {
		let found = routes.find ( item => item.href == path );
		if (found && found.root) {
			appStore.setNav({ label: 'Menu', href: '', icon: MenuIcon, root: true });
		}
	});

	appStore.resetLockScreenDialogTimeout();

	let localeSettings = localStorage.getItem('locale') || 'en';
	appStore.locale = localeSettings;

	let startPage = localStorage.getItem('startPage') || '/';
	goto(startPage);

	let anchorRail = 'btn aspect-square pl-6 w-full max-w-[74px] flex flex-col items-center gap-0.5 ';
	let anchorSidebar = 'btn justify-start px-2 w-full ';
	let anchorBar = 'btn hover:preset-tonal flex-col items-center gap-1';
	let layoutRail = $state(true);

	function toggleLayout() {
		layoutRail = !layoutRail;
	}
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
<div class="fixed w-full h-screen md:grid grid-cols-[auto_1fr]">
	<Navigation layout={ layoutRail ? 'rail' : 'sidebar'}
							class={ layoutRail ? '' : 'grid grid-rows-[1fr_auto] gap-4 w-[180px]'}>
		<Navigation.Content>
			<Navigation.Header>
				<a class="flex justify-center items-center mb-1 {layoutRail ? '' : '-mt-2'}" href="/about">
					<img src="/icons/svg/loxbuddy.svg" width="50" alt="about"/>
				</a>
				<div class="flex justify-center items-center" onclick={(e)=>{e.stopPropagation(); appStore.lockScreenDialog.state=true;}}>
					<p class="text-right text-2xl font-medium">{format(time, "p")}</p>
				</div>
			</Navigation.Header>
			<Navigation.Menu>
			{#if layoutRail}
				{#each routes.filter((m) => m.nav) as link (link)}
					{@const Icon = link.icon}
					<div onclick={() => { goto(link.href)}} class={anchorRail}>
						<div class="relative inline-block">
							{#if link.badge && activeNotifications.length}
								<span class="badge-icon size-[2px] font-semibold preset-filled-primary-500 absolute -right-2 -top-2 z-10">{activeNotifications.length}</span>
							{/if}
							<Icon class={checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}/>
						</div>
						<span class="text-[12px] + {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{link.label}</span>
					</div>
				{/each}
			{:else}
				<Navigation.Group>
					<Navigation.Label class="capitalize pl-2">Menu</Navigation.Label>
					<Navigation.Menu>
						{#each routes as link (link)}
							{@const Icon = link.icon}
							<div onclick={() => { toggleLayout(); goto(link.href)}} class={anchorSidebar} 
								aria-label={link.label}>
								<Icon class="size-4 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}"/>
								<span class="{checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{link.label}</span>
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
			{#if appStore.showStatus}
				<div class="flex flex-row gap-3 justify-center items-center {layoutRail ? '' : '-mb-2'}">
					<CircleIcon class={getStatusColor(mqttStatus)} size="16"/>
					<SquareIcon class={getStatusColor((mqttStatus==1) ? msStatus : 0)} size="16"/>
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
	<Navigation layout="bar" class="fixed top-0 h-[60px] flex justify-center items-center z-10 shadow-md">
		<Navigation.Menu class="grid grid-cols-3 gap-2 text-center">
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
			<div class="flex justify-center items-center">
				<a href="/about">
					<span class="text-xl dark:text-primary-500 text-primary-700 font-medium">LoxBuddy</span>
				</a>
			</div>
			<div class="mr-1 flex flex-row gap-3 justify-end items-center">
				<div onclick={(e)=>{e.stopPropagation(); appStore.lockScreenDialog.state=true;}}>
					<p class="text-right text-2xl font-medium">{format(time, "p")}</p>
				</div>
				{#if appStore.showStatus}
				<div class="flex flex-col justify-center items-center gap-2">
					<CircleIcon class={getStatusColor(mqttStatus)} size="16"/>
					<SquareIcon class={getStatusColor((mqttStatus==1) ? msStatus : 0)} size="16"/>
				</div>
				{/if}
			</div>
		</Navigation.Menu>
	</Navigation>
	<div class="pt-[55px] pb-[60px]">
		{@render children()}
	</div>
	<Navigation layout="bar" class="fixed bottom-0 h-[65px] shadow-inner">
		<Navigation.Menu class="grid grid-cols-4 gap-2">
			{#each routes.filter((m) => m.nav) as link (link)}
				{@const Icon = link.icon}
				<div onclick={() => {goto(link.href)}}  class={anchorBar}>
					<div class="relative inline-block">
						{#if link.badge && activeNotifications.length}
							<span class="badge-icon size-[2px] font-semibold preset-filled-primary-500 absolute -right-2 -top-2 z-10">{activeNotifications.length}</span>
						{/if}
						<Icon class="size-5 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}" />
					</div>
					<span class="text-[12px] {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{link.label}</span>
				</div>
			{/each}
		</Navigation.Menu>
	</Navigation>
</div>
{/if}

<LbWeatherDialog />
<LbLockScreenDialog />

<Dialog
	open={mobileMenuDialog}
	onInteractOutside={() => mobileMenuDialog = false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50 transition transition-discrete
				transition transition-discrete opacity-0 starting:data-[state=open]:opacity-0 data-[state=open]:opacity-100"/>
		<Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
			<Dialog.Content class="h-screen card bg-surface-100-900 w-sm p-4 space-y-4 shadow-xl transition transition-discrete opacity-0 
					-translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 
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
					{#each routes as link (link)}
						{@const Icon = link.icon}
						<div onclick={() => { mobileMenuDialog = false; goto(link.href)}} class={anchorSidebar} 
							aria-label={link.label}>
							<Icon class="size-4 {checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}"/>
							<span class="{checkUrl(link.href) ? 'dark:text-primary-500 text-primary-700' : 'white'}">{link.label}</span>
						</div>
					{/each}
				</div>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
