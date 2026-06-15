<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { mqttClient } from '$lib/communication/MqttClient';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { fadeInOut } from '$lib/helpers/styles';
	import type { MqttCredentials } from '$lib/types/models';

	const DEFAULT_MQTT: MqttCredentials = { hostName: '', port: '', userName: '', password: '', topicPrefix: 'loxone' };
	const cred = appStore.mqttCredentials ?? DEFAULT_MQTT;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
	let hostName = $state(cred.hostName);
	let port = $state(cred.port);
	let userName = $state(cred.userName);
	let password = $state(cred.password);
	let topicPrefix = $state(cred.topicPrefix);
	let hidePassword = $state(true);
	let connecting = $state(false);
	let openPopup = $state(false);
  let popupButtonAction = $state(() => {});
	let popupMessage = $state('');
  let popupButtonText = $state('OK');
	let showSpinner = $state(false);

	let mqttStatus = $derived(appStore.mqttStatus);

	function connect(e: SubmitEvent): void {
		e.preventDefault();
		const credentials: MqttCredentials = { hostName, port, userName, password, topicPrefix };
		appStore.storeMqttCredentials(credentials);
		connecting = true;
		timeout = setTimeout(() => {
			if (connecting) {
				connecting = false;
				showMessageDialog($_('Unable to connect to MQTT server'));
			}
		}, 3000);
		showConnectDialog($_('Connecting to MQTT Server...'));
    setTimeout(() => {
		  mqttClient.connect(hostName, port, userName, password, topicPrefix);
    }, 800);
  }

	$effect(() => {
		if (connecting && mqttStatus > 0) {
			connecting = false;
			openPopup = false;
		}
	});

	function showConnectDialog(message: string): void {
		popupMessage = message;
    popupButtonText = $_('Cancel');
    popupButtonAction = () => { console.log('test'); openPopup = false; clearTimeout(timeout); }
		showSpinner = true;
		openPopup = true;
	}

	function showMessageDialog(message: string): void {
		popupMessage = message;
    popupButtonAction = () => {openPopup = false;  }
		showSpinner = false;
		openPopup = true;
	}

	function getStatusLabel(status: number): string {
		switch (status) {
			case 1: return $_('Connected');
			case 2: return $_('Warning');
			case 3: return $_('Error');
			default: return connecting ? $_('Connecting...') : $_('Disconnected');
		}
	}

	function getStatusColor(status: number): string {
		switch (status) {
			case 1: return 'dark:text-green-500 text-green-700';
			case 2: return 'dark:text-yellow-500 text-yellow-700';
			case 3: return 'dark:text-red-500 text-red-700';
			default: return connecting ? 'dark:text-yellow-500 text-yellow-700' : 'dark:text-surface-400 text-surface-600';
		}
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div class="flex w-full justify-between pl-5 pr-5">
		<p class="h5">{$_("MQTT")}</p>
		<p class="text-md {getStatusColor(mqttStatus)}">{getStatusLabel(mqttStatus)}</p>
	</div>
	<form onsubmit={connect} class="p-5 space-y-4">
		<fieldset class="space-y-4" disabled={mqttStatus > 0 || connecting}>
			<label class="label">
				<span class="label-text">{$_("Host name or IP address")} (WebSocket)</span>
				<input class="input" type="text" bind:value={hostName} placeholder="192.168.x.x" />
			</label>
			<label class="label">
				<span class="label-text">{$_("Port")}</span>
				<input class="input" type="text" inputmode="numeric" bind:value={port} placeholder="9001" />
			</label>
			<label class="label">
				<span class="label-text">{$_("Username")}</span>
				<input class="input" type="text" bind:value={userName} placeholder={$_("Username")} autocomplete="username" />
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
			<label class="label">
				<span class="label-text">{$_("Topic prefix")}</span>
				<input class="input" type="text" bind:value={topicPrefix} placeholder="loxone" />
			</label>
		</fieldset>
		<div class="p-1 pt-5 flex gap-3">
			<button type="submit" disabled={mqttStatus > 0 || connecting}
				class="flex-1 btn {hostName.length && userName.length && password.length && mqttStatus === 0 && !connecting ? 'preset-filled-primary-500' : 'preset-outlined-surface-300-700'}">
				{$_("Connect")}
			</button>
			{#if mqttStatus > 0}
				<button type="button" class="flex-1 btn preset-outlined-error-500"
					onclick={() => mqttClient.disconnect()}>
					{$_("Disconnect")}
				</button>
			{/if}
		</div>
	</form>
</div>

<Dialog open={openPopup} onInteractOutside={() => openPopup = false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full w-[350px] {fadeInOut}">
				<Dialog.Description>
					{#if popupMessage.length}
						<div class="w-full flex justify-center items-center p-3">
							<p>{popupMessage}</p>
						</div>
					{/if}
					{#if showSpinner}
						<div class="mt-2 grid w-full place-items-center p-3">
							<svg class="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
								<path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
									stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
								<path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
									stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
								</path>
							</svg>
						</div>
					{/if}
					<div class="mt-2">
						<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={popupButtonAction}>
							<span class="text-lg">{popupButtonText}</span>
						</button>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
