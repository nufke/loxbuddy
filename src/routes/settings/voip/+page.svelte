<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { sipClient } from '$lib/communication/SipClient';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import type { SipCredentials } from '$lib/types/models';

	const DEFAULT_SIP: SipCredentials = { wsServer: '', userName: '', domainName: '', password: '' };
	const cred = appStore.sipCredentials ?? DEFAULT_SIP;

	let wsServer = $state(cred.wsServer);
	let userName = $state(cred.userName);
	let domainName = $state(cred.domainName);
	let password = $state('');
	let hidePassword = $state(true);
	let connecting = $state(false);
	let openPopup = $state(false);
	let popupButtonAction = $state(() => {});
	let popupMessage = $state('');
	let popupButtonText = $state('OK');
	let showSpinner = $state(false);

	let sipStatus = $derived(appStore.sipStatus);

	function register(e: SubmitEvent): void {
		e.preventDefault();
		if (!wsServer.length || !userName.length || !domainName.length || !password.length) return;
		const credentials: SipCredentials = { wsServer, userName, domainName, password };
		appStore.storeSipCredentials(credentials);
		connecting = true;
		showConnectDialog($_('Registering with SIP server...'));
		// async call
		void sipClient.register(wsServer, userName, domainName, password).catch(() => {
			connecting = false;
			showMessageDialog($_('Unable to register to SIP server'));
		});
	}

	$effect(() => {
		if (connecting && sipStatus > 0) {
			connecting = false;
			openPopup = false;
			password = ''; // clear password
		}
	});

	function showConnectDialog(message: string): void {
		popupMessage = message;
		popupButtonText = $_('Cancel');
		popupButtonAction = () => { openPopup = false; connecting = false; };
		showSpinner = true;
		openPopup = true;
	}

	function showMessageDialog(message: string): void {
		popupMessage = message;
		popupButtonAction = () => { openPopup = false; };
		showSpinner = false;
		openPopup = true;
	}

	function getStatusLabel(status: number): string {
		switch (status) {
			case 1: return $_('Registered');
			case 3: return $_('Error');
			default: return connecting ? $_('Registering...') : $_('Unregistered');
		}
	}

	function getStatusColor(status: number): string {
		switch (status) {
			case 1: return 'dark:text-green-500 text-green-700';
			case 3: return 'dark:text-red-500 text-red-700';
			default: return connecting ? 'dark:text-yellow-500 text-yellow-700' : 'dark:text-surface-400 text-surface-600';
		}
	}

	function unregister() {
		// update credentials (password empty)
		const credentials: SipCredentials = { wsServer, userName, domainName, password };
		appStore.storeSipCredentials(credentials);
		sipClient.unregister();
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div class="flex w-full justify-between pl-5 pr-5">
		<p class="h5">{$_("VoIP")}</p>
		<p class="text-md {getStatusColor(sipStatus)}">{getStatusLabel(sipStatus)}</p>
	</div>
	<form onsubmit={register} class="p-5 space-y-4">
		<fieldset class="space-y-4" disabled={sipStatus > 0 || connecting}>
			<label class="label">
				<span class="label-text">{$_("SIP server URL")}  (WebSocket)</span>
				<input class="input" type="text" bind:value={wsServer} placeholder="wss://sip.example.com:8081" />
			</label>
			<label class="label">
				<span class="label-text">{$_("Username")}</span>
				<input class="input" type="text" bind:value={userName} placeholder={$_("Username")} autocomplete="username" />
			</label>
			<label class="label">
				<span class="label-text">{$_("Domain name")}</span>
				<input class="input" type="text" bind:value={domainName} placeholder="sip.example.com" />
			</label>
			<label class="label">
				<span class="label-text">{$_("Password")}</span>
				<div class="input-group grid-cols-[1fr_auto]">
					<input class="input" type={hidePassword ? 'password' : 'text'} bind:value={password}
						placeholder={$_("Password")} autocomplete="current-password" />
					<div class="ig-btn preset-tonal" onclick={() => { hidePassword = !hidePassword }}>
						<LbIcon name={hidePassword ? 'eye' : 'eye-off'} height="16" width="16" />
					</div>
				</div>
			</label>
		</fieldset>
		<div class="p-1 pt-5 flex gap-3">
			<button type="submit" disabled={sipStatus > 0 || connecting}
				class="flex-1 btn {wsServer.length && userName.length && domainName.length && password.length && sipStatus === 0 && !connecting ? 'preset-filled-primary-500' : 'preset-outlined-surface-300-700'}">
				{$_("Register")}
			</button>
			{#if sipStatus > 0}
				<button type="button" class="flex-1 btn preset-outlined-error-500"
					onclick={unregister}>
					{$_("Unregister")}
				</button>
			{/if}
		</div>
	</form>
</div>

<LbDialog open={openPopup} onClose={() => openPopup = false} width="w-[350px]">
	{#snippet description()}
		{#if popupMessage.length}
			<div class="w-full flex justify-center items-center p-3">
				<p>{popupMessage}</p>
			</div>
		{/if}
		{#if showSpinner}
			<div class="mt-2 grid w-full place-items-center p-3">
				<svg class="animate-spin w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		{/if}
		<div class="mt-2">
			<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
				onclick={popupButtonAction}>
				<span class="text-lg">{popupButtonText}</span>
			</button>
		</div>
	{/snippet}
</LbDialog>
