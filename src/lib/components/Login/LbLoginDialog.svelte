<script lang="ts">
	import { Dialog, Portal  } from '@skeletonlabs/skeleton-svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { _ } from 'svelte-i18n';
	import { env } from '$env/dynamic/public';
	import { miniserverClient } from '$lib/communication/MiniserverClient';
	import type { DeviceInfoMap, DeviceInfo } from '$lib/types/models';
	import { goto } from "$app/navigation";
	import { fadeInOut } from '$lib/helpers/styles';
	import { demo } from '$lib/demo/DemoClient';

	let openPopup = $state(false);
	let hostName = $state('');
	let userName = $state('');
	let password = $state('');
	let hidePassword = $state(true);

	type PopupView = {
		title: string;
		list: DeviceInfo[];
		button: string;
		description: string;
		showSpinner: boolean;
	}

	let popupView: PopupView = $state({
		title: 'Search Miniserver',
		list: [],
		button: 'search',
		description: '',
		showSpinner: false
	})

	async function startDemo(): Promise<void> {
		clearFormFields();
		//appStore.clearCredentials();
		appStore.setDemo(1);
		appStore.setLocale('en'); // switch to en locale for demo
		appStore.loginDialog.state = false;
		demo.start();
	}

	async function reconnect(): Promise<void> {
		if (appStore.credentials) {
			clearFormFields();
			appStore.loginDialog.state = false;
			appStore.setDemo(0); // disable demo mode
			goto('/');
			await miniserverClient.connect();
		}
	}

	async function validate(): Promise<void> {
		const hostUrl = hostName.match(/^http/) ? hostName.replace(/\/$/, '') : 'http://' + hostName.replace(/\/$/, '');
		if (hostName.length && userName.length && password.length) {
			// Check if all fields are filled
			showConnectDialog('Connecting to Miniserver...');
			appStore.setDemo(0); // clear demo mode
			// Check if MiniServer is reachable via hostname
			try {
				await fetch(hostUrl + '/jdev/cfg/apiKey');
			} catch (error) {
				showMessageDialog('Miniserver not found!');
				return;
			}
			// Establish WebSocket connection using stored token if available, otherwise with password
			try {
				await miniserverClient.connect(hostUrl, userName, password);
			} catch (error) {
				showMessageDialog('Unable to connect to Miniserver');
				return;
			}
			// Close popup and login dialog, navigate to home page
			goto('/');
			openPopup = false;
			appStore.loginDialog.state = false;
			clearFormFields();
		}
	}

	async function search(): Promise<void> {
		popupView.list = [];
		popupView.showSpinner = true;
		const response = await fetch('/login'); // Svelte server call
		const resp = await response.json() as DeviceInfoMap;
		popupView.list = Object.values(resp);
		popupView.description = popupView.list.length ? '' : 'No Miniserver found';
		popupView.showSpinner = false;
	}

	function select(item: any): void {
		hostName = item.ipaddr;
		openPopup = false;
	}

	async function doSearch(): Promise<void> {
		popupView = {
			title: 'Search Miniserver',
			list: [],
			button: 'search',
			description: '',
			showSpinner: false
		};
		openPopup = true;
		await search();
	}
	
	function showMessageDialog(description: string): void {
		popupView = {
			title: '',
			list: [],
			button: 'ok',
			description: description,
			showSpinner: false
		};
		openPopup = true;
	}

	function showConnectDialog(description: string): void {
		popupView = {
			title: '',
			list: [],
			button: 'Cancel',
			description: description,
			showSpinner: true
		};
		openPopup = true;
	}
	
	function clearFormFields(): void {
		hostName = '';
		userName = '';
		password = '';
		hidePassword = true;
	}
</script>

<Dialog
	open={appStore.loginDialog.state}>
	<Portal>
		<Dialog.Backdrop class="fixed top-0 left-0 right-0 bottom-0 z-100 bg-surface-50-950"/>
		<Dialog.Positioner class="fixed top-0 left-0 w-full h-full z-100">
			<Dialog.Content class="card p-2 space-y-4 shadow-xl h-full">
				<Dialog.Description class="flex justify-center items-center h-screen p-3">
					<div class="flex justify-center items-center flex-col gap-3 w-full">
						<div class="pt-3 flex justify-center items-center flex-col gap-3">
							<div onclick={reconnect}>
								<img src="/icons/svg/loxbuddy.svg" width="90" alt="about" />
							</div>
							<p class="flex justify-center items-center h6 dark:text-primary-500 text-primary-700">LOXBUDDY</p>
							<p class="h5">Miniserver {$_("Login").toLowerCase()}</p>
						</div>
						<form class="p-3 space-y-4 w-full max-w-[400px]" onsubmit={validate}>
							<fieldset class="space-y-4">
								<label class="label">
									<div class="flex flex-row gap-3">
										<span class="label-text">{$_("Miniserver")}</span>
									</div>
									<div class="input-group grid-cols-[1fr_auto]">
										<input class="ig-input" type="text" bind:value={hostName} placeholder={$_("IP address:port")} />
										{#if env.PUBLIC_UDP_SEARCH}
										<div class="ig-btn preset-tonal" onclick={doSearch}>
											<LbIcon name="search" height="16" width="16"/>
										</div>
										{/if}
									</div>
								</label>
								<label class="label">
									<div class="flex flex-row gap-3">
										<span class="label-text">{$_("Username")}</span>
									</div>
									<input class="input" type="text" bind:value={userName} placeholder={$_("Username")} autocomplete="username"/>
								</label>
								<label class="label">
									<div class="flex flex-row gap-3">
										<span class="label-text">{$_("Password")}</span>
									</div>
									<div class="input-group grid-cols-[1fr_auto]">
										<input class="input" type={hidePassword ? "password" : "text"} bind:value={password} placeholder={$_("Password")} autocomplete="current-password"/>
										<div class="ig-btn preset-tonal" onclick={() => {hidePassword = !hidePassword}}>
											{#if hidePassword}
												<LbIcon name="eye" height="16" width="16"/>
											{:else}
												<LbIcon name="eye-off" height="16" width="16"/>
											{/if}
										</div>
									</div>
								</label>
							</fieldset>
							<fieldset class="pt-3 flex justify-center">
								<button type="submit" class="w-full btn { hostName.length && userName.length > 0 && password.length > 0 ? 'preset-filled-primary-500' : 'preset-outlined-surface-300-700'}">{$_("Connect")}</button>
							</fieldset>
						</form>
						<button class="m-3 h6 dark:text-primary-500 text-primary-700" onclick={startDemo}>{$_("Start Demo")}</button>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>

<Dialog
	open={openPopup}
	onInteractOutside={()=>{openPopup=false}}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-150 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-150 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full w-[350px] {fadeInOut}">
				{#if popupView.title.length}
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<Dialog.Title class="h5 flex justify-center items-center">{$_(popupView.title)}</Dialog.Title>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={()=>{openPopup=false}}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
				{/if}
				<Dialog.Description>
					{#if popupView.list.length}
						<div class="w-full mt-4 mb-2 grid gap-2">
							{#each popupView.list as item}
							<button type="button" class="w-full h-[60px] btn btn-lg bg-surface-50-950
								shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => { e.stopPropagation(); e.preventDefault(); select(item)}}>
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
						{#if popupView.button == "search"}
							<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={doSearch}>
								<span class="flex justify-center items-center truncate text-lg">
									<LbIcon name="search" height="18" width="18"/>&nbsp;{$_("Search")}
								</span>
							</button>
						{:else}
							<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={() => {openPopup=false}}>
								<span class="flex justify-center items-center truncate text-lg">{popupView.button}</span>
							</button>
						{/if}
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
