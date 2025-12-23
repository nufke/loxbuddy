<script lang="ts">
	import type { PageProps } from './$types';
	import { Dialog, Portal  } from '@skeletonlabs/skeleton-svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { ArrowLeftIcon, EyeIcon, EyeOffIcon, SearchIcon, XIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { LoxWsClient } from '$lib/communication/LoxWsClient';
	import { goto } from "$app/navigation";

	let { data }: PageProps = $props();

	appStore.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeftIcon });

	let openDialog = $state(false);
	let hostname = $state('');
	let username = $state('');
	let password = $state('');
	let hidePassword = $state(true);
	let list: any = $state([]);
	let showSpinner: boolean = $state(false);

	let dialogView = $state({
		title: 'Search Miniserver',
		isSearch: true,
		description: ''
	})

	async function validate() {
		if (hostname.length && username.length && password.length) {
			// 1. Establish WebSocket connection 
			const loxClient = new LoxWsClient(hostname, username, password, appStore.appId, 0);
			// 2. Check if MiniServer is reachable via hostname
			try {
				await fetch('http://' + hostname + '/jdev/cfg/apiKey');
			} catch (error) {
				showDialog('Miniserver not found!');
				await loxClient.disconnect();
				return;
			}
			// 3, Check username/password combination via http call (no login)
			try {
				await loxClient.checkCredentials(username, password);
			} catch (error) {
				showDialog('Login credentials invalid!');
				await loxClient.disconnect();
				return;
			}
			// 4. Store hostname and username for later use (note: password not stored!)
			appStore.storeCredentials({ hostname: hostname, username: username });
			// 5. connect with hostname, username and token if available
			await loxClient.connect(appStore.token);
			// 6. redirect to home/root page
			goto('/');
		}
	}

	async function search() {
		list = [];
		showSpinner = true;
		const response = await fetch('/login');
		const resp = await response.json();
		list = Object.values(resp);
		showSpinner = false;
	}

	function select(item: any) {
		hostname = item.ipaddr;
		openDialog = false;
	}

	async function doSearch() {
		dialogView = {
			title: 'Search Miniserver',
			isSearch: true,
			description: ''
		};
		openDialog = true;
		await search();
	}
	
	 function showDialog(description: string) {
		dialogView = {
			title: '',
			isSearch: false,
			description: description
		};
		openDialog = true;
	}
</script>

<div class="p-3 flex justify-center items-center flex-col gap-3 w-full">
<div class="pt-3 flex justify-center items-center flex-col gap-3">
	<img src="/icons/svg/loxbuddy.svg" width="80" alt="about" />
	<p class="h5">Miniserver {$_("Login").toLowerCase()}</p>
</div>
<form class="p-3 space-y-4 w-full max-w-[400px]" onsubmit={validate}>
	<fieldset class="space-y-4">
		<label class="label">
			<div class="flex flex-row gap-3">
				<span class="label-text">{$_("Miniserver")}</span>
			</div>
			<div class="input-group grid-cols-[1fr_auto]">
				<input class="ig-input" type="text" bind:value={hostname} placeholder={$_("IP address")} />
				<div class="ig-btn preset-tonal" onclick={doSearch}>
					<SearchIcon size={16} />
				</div>
			</div>
		</label>
		<label class="label">
			<div class="flex flex-row gap-3">
				<span class="label-text">{$_("Username")}</span>
			</div>
			<input class="input" type="text" bind:value={username} placeholder={$_("Username")} />
		</label>
		<label class="label">
			<div class="flex flex-row gap-3">
				<span class="label-text">{$_("Password")}</span>
			</div>
			<div class="input-group grid-cols-[1fr_auto]">
				<input class="input" type={hidePassword ? "password" : "text"} bind:value={password} placeholder={$_("Password")} />
				<div class="ig-btn preset-tonal" onclick={() => {hidePassword = !hidePassword}}>
					{#if hidePassword}
						<EyeIcon size={16} />
					{:else}
						<EyeOffIcon size={16} />
					{/if}
				</div>
			</div>
		</label>
	</fieldset>
	<fieldset class="pt-3 flex justify-center">
		<button type="submit" class="w-full btn { hostname.length && username.length > 0 && password.length > 0 ? 'preset-filled-primary-500' : 'preset-outlined-surface-300-700'}">{$_("Connect")}</button>
	</fieldset>
</form>
</div>

<Dialog
	open={openDialog}
	onInteractOutside={()=>{openDialog=false}}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-40 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[350px]">
				{#if dialogView.title.length}
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<Dialog.Title class="h5 flex justify-center items-center">{$_(dialogView.title)}</Dialog.Title>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={()=>{openDialog=false}}>
								<XIcon class="size-4"/>
							</button>
						</div>
					</header>
				{/if}
				<Dialog.Description>
					{#if dialogView.isSearch}
						{#if list.length}
							<div class="w-full mt-4 mb-2 grid gap-2">
								{#each list as item}
								<button type="button" class="w-full h-[60px] btn btn-lg dark:bg-surface-950 bg-surface-50
									shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); select(item)}}>
									<div class="flex flex-col justify-center items-center">
										<span class="text-lg">{$_(item.name)}</span>
										<span class="text-xs dark:text-surface-300 text-surface-700">{$_(item.ipaddr)}</span>
									</div>
								</button>
								{/each}
							</div>
						{:else}
							{#if showSpinner}
							<div class="mt-4 grid w-full place-items-center overflow-x-scroll rounded-lg p-3 lg:overflow-visible">
								<svg class="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
									<path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
										stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
									<path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
										stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
									</path>
								</svg>
							</div>
							{:else}
								<p class="w-full flex justify-center items-center p-3">{$_("No Miniserver found")}</p>
							{/if}
						{/if}
					{:else}
						<div class="flex justify-center items-center p-3">
							<p>{dialogView.description}</p>
						</div>
					{/if}
					<div class="mt-4">
						{#if dialogView.isSearch}
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={doSearch}>
								<span class="flex justify-center items-center truncate text-lg"><SearchIcon size={18} />&nbsp;{$_("Search")}</span>
							</button>
						{:else}
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={() => {openDialog=false}}>
								<span class="flex justify-center items-center truncate text-lg">OK</span>
							</button>
						{/if}
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
