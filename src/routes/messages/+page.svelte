<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { SystemStatus, SystemStatusEntry } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { X } from '@lucide/svelte';
	import { store } from '$lib/stores/store.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';

	let group = $state('1');
	let messages = $derived(store.getMessages()) as SystemStatus;
	let messageCenter = $derived(store.messageCenterList[0]); // select first message center
	let activeMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == false) : []);
	let pastMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == true) : []);
	let notificationList = $derived(Object.values(store.notificationsMap).sort((a, b) => b.message.ts - a.message.ts));
	let activeNotifications = $derived(notificationList.filter( items => items.status < 3)); // new or read
	let archivedNotifications = $derived(notificationList.filter( items => items.status == 3)); // new or read
	let selectedEntry: SystemStatusEntry | undefined = $state();
	let openModal = $state(false);

	store.updateNotificationStorage();

	let severity = ['', 'Info', 'Warning', 'Error'];

	function didRead(uid: string) {
		store.updateNotificationReadStatus(uid);
	}

	function getRoomName(entry: SystemStatusEntry) {
		return entry && entry.roomUuid && store.rooms[entry.roomUuid] ? store.rooms[entry.roomUuid].name : '';
	}
	
	function showEntry(entry: SystemStatusEntry) {
		selectedEntry = entry;
		openModal = true;
	}

	function confirmEntry() {
		if (selectedEntry) {
			let actionOK = selectedEntry.actions.find( a => a.title = 'OK');
			let cmd = 'action/' + actionOK.actionId + '/' + (actionOK.isSecured ? '1' : '0');
			// TODO check command for action 
			//console.log('confirm', cmd);
			//publishTopic(messageCenter.uuidAction, cmd);
		}
	}
</script>

<div class="container mx-auto max-w-[1280px] space-y-3 p-3">
	<Tabs value={group} onValueChange={(e) => (group = e.value)} fluid>
		{#snippet list()}
			<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="1">{$_("Notifications")}</Tabs.Control>
			<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="2">{$_("System status")}</Tabs.Control>
			<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="3">{$_("History")}</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				{#each activeNotifications as notification}
				<div class="{notification.status == 2 ? 'pl-[13px]' : 'pl-2 border-l-5 dark:border-l-primary-500'} border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3"
							onclick={()=>{didRead(notification.message.uid)}}>
					<p class="text-md dark:text-surface-300 text-surface-700">{format(new Date(notification.message.ts*1000), "PPP p")}</p>
					<p class="text-lg">{notification.message.title}</p>
					<p class="text-md">{notification.message.message}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="2">
				{#each activeMessages.toReversed() as entry}
				<div class="{entry.severity == 3 && entry.confirmedAt == null ? 'pl-2 border-l-5 dark:border-l-red-500' : 
										(entry.severity == 2 && entry.confirmedAt == null ? 'pl-2 border-l-5 dark:border-l-orange-500' : 'pl-[13px]') } border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3"
										 onclick={()=>{showEntry(entry)}}>
					<p class="text-md { entry.severity == 3 ? 'text-red-500' : (entry.severity == 2 ? 'text-orange-500' : 'dark:text-surface-300 text-surface-700')}">
						{$_(severity[entry.severity]).toUpperCase()}: <span class="dark:text-surface-300 text-surface-700"> {format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {getRoomName(entry)}</span></p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="3">
				{#each pastMessages.toReversed() as entry}
				<div class="pl-[13px] border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3" onclick={()=>{showEntry(entry)}}>
					<p class="text-md dark:text-surface-300 text-surface-700">{$_(severity[entry.severity]).toUpperCase()}: {format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {getRoomName(entry)}</p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</div>

<Modal
	open={openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{openModal=false}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							md:max-w-9/10 md:max-h-9/10 overflow-auto w-[450px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
		<header class="relative">
			<div class="flex justify-center">
				<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
					{#if selectedEntry?.severity == 3}
						<LbIcon class="text-red-500" name='/icons/svg/error.svg' width="36" height="36"/>
					{:else if selectedEntry?.severity == 2}
						<LbIcon class="text-orange-500" name='/icons/svg/warning.svg' width="36" height="36"/>
					{:else}
						<LbIcon class="text-cyan-500" name='/icons/svg/info.svg' width="36" height="36"/>
					{/if}
				</div>
			</div>
			<div class="absolute right-0 top-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { openModal = false }}>
					<X/>
				</button>
			</div>
		</header>
		<div class="flex flex-col items-center justify-center mt-2">
			<div>
				<p class="h4 text-center">{@html selectedEntry?.title}</p>
			</div>
			<div class="m-2 w-[350px]">
				<p class="text-lg text-center text-wrap">{@html selectedEntry?.affectedName}</p>
				<p class="text-md text-center dark:text-surface-300 text-surface-700 text-wrap">{$_("At").toLowerCase()} {format(new Date(Number(selectedEntry?.timestamps[0])*1000), "PPP p")}</p>
				{#if selectedEntry?.confirmedAt || selectedEntry?.setHistoricAt}
					<p class="mt-5 text-md text-center dark:text-surface-300 text-surface-700 truncate">{$_(selectedEntry?.isHistoric ? "Solved at" : "Confirmed at")} {format(new Date(Number(selectedEntry?.isHistoric ? selectedEntry?.setHistoricAt : selectedEntry?.confirmedAt)*1000), "PPP p")}</p>
				{:else}
					<button type="button" class="mt-5 w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={confirmEntry}>
						<p class="text-lg">{$_("Confirm")}</p>
					</button>
				{/if}
			</div>
		</div>
	{/snippet}
</Modal>
	