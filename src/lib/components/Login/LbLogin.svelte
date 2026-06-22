<script lang="ts">
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { _ } from 'svelte-i18n';
	import { env } from '$env/dynamic/public';
	import { miniserverClient } from '$lib/communication/MiniserverClient';
	import type { DeviceInfoMap, DeviceInfo } from '$lib/types/models';
	import { goto } from '$app/navigation';
	import { demo } from '$lib/demo/DemoClient';

	type PopupView = {
		title: string;
		list: DeviceInfo[];
		button: string;
		description: string;
		showSpinner: boolean;
	}

	let openPopup = $state(false);
	let hostName = $state('');
	let userName = $state('');
	let password = $state('');
	let hidePassword = $state(true);

	let popupView: PopupView = $state({
		title: 'Search Miniserver',
		list: [],
		button: 'search',
		description: '',
		showSpinner: false
	});

	/**
	 * Switches to demo mode, clears any entered credentials, and starts the demo client.
	 */
	async function startDemo(): Promise<void> {
		clearFormFields();
		appStore.setDemo(1);
		appStore.setLocale('en');
		appStore.loginDialogOpen = false;
		demo.start();
	}

	/**
	 * Reconnects using stored credentials and navigates to the home page.
	 * No-op when no credentials are stored (e.g. first launch).
	 */
	async function reconnect(): Promise<void> {
		if (appStore.credentials) {
			clearFormFields();
			appStore.loginDialogOpen = false;
			appStore.setDemo(0);
			goto('/');
			await miniserverClient.connect();
		}
	}

	/**
	 * Validates the form, checks Miniserver reachability, then establishes a connection.
	 * Shows an error popup when the Miniserver is unreachable or authentication fails.
	 * No-op when any of the three form fields is empty.
	 */
	async function validate(): Promise<void> {
		const hostUrl = hostName.match(/^http/) ? hostName.replace(/\/$/, '') : 'http://' + hostName.replace(/\/$/, '');
		if (hostName.length && userName.length && password.length) {
			showConnectDialog('Connecting to Miniserver...');
			appStore.setDemo(0);
			try {
				await fetch(hostUrl + '/jdev/cfg/apiKey');
			} catch {
				showMessageDialog('Miniserver not found!');
				return;
			}
			try {
				await miniserverClient.connect(hostUrl, userName, password);
			} catch {
				showMessageDialog('Unable to connect to Miniserver');
				return;
			}
			goto('/');
			openPopup = false;
			appStore.loginDialogOpen = false;
			clearFormFields();
		}
	}

	/**
	 * Calls the server-side UDP discovery endpoint and populates the popup list
	 * with found Miniservers. Sets a "not found" message when the list is empty.
	 */
	async function search(): Promise<void> {
		popupView.list = [];
		popupView.showSpinner = true;
		const response = await fetch('/login');
		const resp = await response.json() as DeviceInfoMap;
		popupView.list = Object.values(resp);
		popupView.description = popupView.list.length ? '' : 'No Miniserver found';
		popupView.showSpinner = false;
	}

	/**
	 * Fills the host field with the IP address of the selected search result
	 * and closes the popup.
	 *
	 * @param item - the device info entry selected from the search list.
	 */
	function select(item: any): void {
		hostName = item.ipaddr;
		openPopup = false;
	}

	/**
	 * Opens the search popup and triggers a UDP Miniserver discovery scan.
	 */
	async function doSearch(): Promise<void> {
		popupView = { title: 'Search Miniserver', list: [], button: 'search', description: '', showSpinner: false };
		openPopup = true;
		await search();
	}

	/**
	 * Shows a message-only popup with an OK dismiss button.
	 *
	 * @param description - the message text to display.
	 */
	function showMessageDialog(description: string): void {
		popupView = { title: '', list: [], button: 'ok', description, showSpinner: false };
		openPopup = true;
	}

	/**
	 * Shows a spinner popup used while a connection attempt is in progress.
	 *
	 * @param description - the status text to display alongside the spinner.
	 */
	function showConnectDialog(description: string): void {
		popupView = { title: '', list: [], button: 'Cancel', description, showSpinner: true };
		openPopup = true;
	}

	/**
	 * Clears all login form fields and resets the password visibility toggle.
	 */
	function clearFormFields(): void {
		hostName = '';
		userName = '';
		password = '';
		hidePassword = true;
	}
</script>

<LbDialog open={appStore.loginDialogOpen} onClose={reconnect}
	title="" zIndex="z-100" isFullscreen={true} showClose={false}>
	{#snippet description()}
		<div class="flex justify-center items-center flex-col gap-3 w-full min-h-[calc(100vh-60px)]">
			<div class="pt-3 flex justify-center items-center flex-col gap-3">
				<div onclick={reconnect}>
					<img src="/icons/svg/loxbuddy.svg" width="90" alt="about"/>
				</div>
				<p class="flex justify-center items-center h6 dark:text-primary-500 text-primary-700">LOXBUDDY</p>
				<p class="h5">Miniserver {$_('Login').toLowerCase()}</p>
			</div>
			<form class="p-3 space-y-4 w-full max-w-[400px]" onsubmit={validate}>
				<fieldset class="space-y-4">
					<label class="label">
						<div class="flex flex-row gap-3">
							<span class="label-text">{$_('Miniserver')}</span>
						</div>
						<div class="input-group grid-cols-[1fr_auto]">
							<input class="ig-input" type="text" bind:value={hostName} placeholder={$_('IP address:port')}/>
							{#if env.PUBLIC_UDP_SEARCH}
								<div class="ig-btn preset-tonal" onclick={doSearch}>
									<LbIcon name="search" height="16" width="16"/>
								</div>
							{/if}
						</div>
					</label>
					<label class="label">
						<div class="flex flex-row gap-3">
							<span class="label-text">{$_('Username')}</span>
						</div>
						<input class="input" type="text" bind:value={userName} placeholder={$_('Username')} autocomplete="username"/>
					</label>
					<label class="label">
						<div class="flex flex-row gap-3">
							<span class="label-text">{$_('Password')}</span>
						</div>
						<div class="input-group grid-cols-[1fr_auto]">
							<input class="input" type={hidePassword ? 'password' : 'text'} bind:value={password} placeholder={$_('Password')} autocomplete="current-password"/>
							<div class="ig-btn preset-tonal" onclick={() => (hidePassword = !hidePassword)}>
								<LbIcon name={hidePassword ? 'eye' : 'eye-off'} height="16" width="16"/>
							</div>
						</div>
					</label>
				</fieldset>
				<fieldset class="pt-3 flex justify-center">
					<button type="submit" class="w-full btn {hostName.length && userName.length && password.length ? 'preset-filled-primary-500' : 'preset-outlined-surface-300-700'}">{$_('Connect')}</button>
				</fieldset>
			</form>
			<button class="m-3 h6 dark:text-primary-500 text-primary-700" onclick={startDemo}>{$_('Start Demo')}</button>
		</div>
	{/snippet}
</LbDialog>

<LbDialog open={openPopup} onClose={() => (openPopup = false)}
	title={popupView.title ? $_(popupView.title) : ''} zIndex="z-150" width="w-[350px]">
	{#snippet description()}
		{#if popupView.list.length}
			<div class="w-full mt-4 mb-2 grid gap-2">
				{#each popupView.list as item}
					<button type="button" class="w-full h-[60px] btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); select(item); }}>
						<div class="flex flex-col justify-center items-center">
							<span class="text-lg">{$_(item.name)}</span>
							<span class="text-xs dark:text-surface-300 text-surface-700">{$_(item.ipaddr)}</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}
		{#if popupView.showSpinner}
			<div class="mt-4 grid w-full place-items-center overflow-x-scroll rounded-lg p-3 lg:overflow-visible">
				<svg class="animate-spin w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		{/if}
		{#if popupView.description.length}
			<div class="w-full flex justify-center items-center p-3">
				<p>{$_(popupView.description)}</p>
			</div>
		{/if}
		<div class="mt-4">
			{#if popupView.button === 'search'}
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={doSearch}>
					<span class="flex justify-center items-center truncate text-lg">
						<LbIcon name="search" height="18" width="18"/>&nbsp;{$_('Search')}
					</span>
				</button>
			{:else}
				<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={() => (openPopup = false)}>
					<span class="flex justify-center items-center truncate text-lg">{popupView.button}</span>
				</button>
			{/if}
		</div>
	{/snippet}
</LbDialog>
