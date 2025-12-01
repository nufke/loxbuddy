<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { weatherStore } from '$lib/stores/WeatherStore.svelte';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import { XIcon } from '@lucide/svelte';
	import type { WeatherCurrentConditions } from '$lib/types/weather';
	import { format } from 'date-fns';
	import { utils } from '$lib/helpers/Utils';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

	let currentWeather = $derived(weatherStore.current);
	let date = $derived(appStore.date);

	function getCurrentIcon(cur: WeatherCurrentConditions) {
		let sunRise = utils.time2epoch(cur.time, cur.sunRise);
		let sunSet = utils.time2epoch(cur.time, cur.sunSet);
		let dayOrNight = (cur.time > sunRise) && (cur.time < sunSet) ? '-day.svg' : '-night.svg';
		return '/meteocons/svg/' + cur.icon + dayOrNight;
	}
</script>

{#if appStore.lockScreenDialog.state}
	<Dialog
		open={appStore.lockScreenDialog.state}
		onInteractOutside={() => {appStore.resetLockScreenDialogTimeout()}}>
		<Portal>
			<Dialog.Backdrop class="fixed top-0 left-0 right-0 bottom-0 z-2000 dark:bg-surface-950 bg-surface-50" />
			<Dialog.Positioner class="fixed top-0 left-0 w-full h-full z-2001">
				<Dialog.Content class="card p-4 space-y-4 shadow-xl">
					<header class="flex justify-between items-center">
						<Dialog.Title class="text-lg font-bold"></Dialog.Title>
						<button type="button" class="btn-icon text-left hover:preset-tonal" onclick={() => appStore.resetLockScreenDialogTimeout()}>
							<XIcon class="size-4"/>
						</button>
					</header>
					<Dialog.Description class="flex justify-center items-center h-screen">
						<div class="flex flex-col">
						{#if currentWeather && currentWeather.airTemperature}
							<div class="flex justify-left items-center">
								<LbIcon name={getCurrentIcon(currentWeather)} width="80" height="80"/>	
								<span class="text-4xl truncate">{currentWeather.airTemperature}°</span>
							</div>
						{/if}
						<div class="">
							<p class="mt-2 pl-3 text-7xl font-bold">{format(date, "p")}</p>
							<p class="mt-2 pl-3 text-4xl">{format(date, "eeee PPP")}</p>
						</div>
					</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}