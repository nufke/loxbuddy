<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';

	let showStatus = $state(localStorage.getItem('showStatus') || '0');
	let autoLogin = $state(localStorage.getItem('autoLogin') || '0');
	let isDemo = $state(localStorage.getItem('demo') || '0');

	/**
	 * Show status of Miniserver and MQTT
	 * @param event switch event state
	 */
	function onShowStatusChange(event: { checked: boolean }): void {
		showStatus = event.checked ? '1' : '0';
		localStorage.setItem('showStatus', showStatus);
		appStore.showStatus = event.checked;
	};

	/**
	 * Enable automatic login
	 * @param event switch event state
	 */
	function onAutoLoginChange(event: { checked: boolean }): void {
		autoLogin = event.checked ? '1' : '0';
		localStorage.setItem('autoLogin', autoLogin);
		appStore.autoLogin = event.checked;
	};

	/**
	 * Enable demo mode
	 * @param event switch event state
	 */
	function onDemoChange(event: { checked: boolean }): void {
		isDemo = event.checked ? '1' : '0';
		localStorage.setItem('demo', isDemo);
		appStore.isDemo = event.checked;
	};
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Login and status")}</p>
	</div>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Enable automatic login")}</p>
			<Switch checked={autoLogin == "1"} onCheckedChange={onAutoLoginChange}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Start App in demo mode")}</p>
			<Switch checked={isDemo == "1"} onCheckedChange={onDemoChange}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Show connection status")}</p>
			<Switch checked={showStatus == "1"} onCheckedChange={onShowStatusChange}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
</div>
