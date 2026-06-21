<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { mqttClient } from '$lib/communication/MqttClient';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import type { MqttCredentials } from '$lib/types/models';

	const DEFAULT_MQTT: MqttCredentials = { hostName: '', port: '', userName: '', password: '', topicPrefix: 'loxone' };
	const cred = appStore.mqttCredentials ?? DEFAULT_MQTT;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  
	let hostName = $state(cred.hostName);
	let port = $state(cred.port);
	let userName = $state(cred.userName);
	let password = $state('');
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
		if (!hostName.length || !port.length || !userName.length || !password.length || !topicPrefix.length) return;
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
    setTimeout( () => {
		  void mqttClient.connect(hostName, port, userName, password, topicPrefix); /* async call */
    }, 800);
  }

	$effect(() => {
		if (connecting && mqttStatus > 0) {
			connecting = false;
			openPopup = false;
			password = ''; // clear password
		}
	});

	function showConnectDialog(message: string): void {
		popupMessage = message;
    popupButtonText = $_('Cancel');
    popupButtonAction = () => { openPopup = false; clearTimeout(timeout); }
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

	function disconnect() {
		// update credentials (password empty)
		const credentials: MqttCredentials = { hostName, port, userName, password, topicPrefix };
		appStore.storeMqttCredentials(credentials);
		mqttClient.disconnect();
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
					onclick={disconnect}>
					{$_("Disconnect")}
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
