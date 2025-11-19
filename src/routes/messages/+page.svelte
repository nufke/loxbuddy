<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { SystemStatus, SystemStatusEntry, NotificationMessage } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import { XIcon } from '@lucide/svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';
	import { fetchUrl } from '$lib/communication/fetchUrl.svelte';

	let group = $state('1');
	let messageCenter = $derived(store.messageCenterList[0]); // select first message center
	let resource = $derived(fetchUrl<string>(`jdev/sps/io/${messageCenter?.uuidAction}/getEntries/2`));
	let	messages = $derived(resource.value ? JSON.parse(resource.value) : {}) as SystemStatus;
	let activeMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == false) : []);
	let pastMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == true) : []);
	let notifications = $derived(store.notifications);
	let notificationList = $derived(Object.values(store.notificationsMap).sort((a, b) => b.message.ts - a.message.ts));
	let activeNotifications = $derived(notificationList.filter( items => items.status < 3)); // new or read
	let archivedNotifications = $derived(notificationList.filter( items => items.status == 3)); // new or read
	let selectedEntry: SystemStatusEntry | undefined = $state();
	let openDialog = $state(false);

	let severity = ['', 'Info', 'Warning', 'Error'];

	function didRead(notification: NotificationMessage) {
		store.updateNotificationMap(notification, 2);
	}

	function getRoomName(entry: SystemStatusEntry) {
		return entry && entry.roomUuid && store.rooms[entry.roomUuid] ? store.rooms[entry.roomUuid].name : '';
	}
	
	function showEntry(entry: SystemStatusEntry) {
		selectedEntry = entry;
		openDialog = true;
	}

	function confirmEntry() {
		if (selectedEntry) {
			let actionOK = selectedEntry.actions.find( a => a.title = 'OK');
			let cmd = 'action/' + actionOK.actionId + '/' + (actionOK.isSecured ? '1' : '0');
			// TODO check command for action 
			//console.log('confirm', cmd);
			//msControl(messageCenter.uuidAction, cmd);
		}
	}
</script>

<div class="container mx-auto max-w-[1280px] space-y-3 p-3">
	<Tabs defaultValue={'notifications'} onValueChange={(e) => (group = e.value)}>
		<Tabs.List class="border-b-[2px] border-transparent">
			<Tabs.Trigger value="notifications" class="flex-1 text-lg">{$_("Notifications")}</Tabs.Trigger>
			<Tabs.Trigger value="systemstatus" class="flex-1 text-lg">{$_("System status")}</Tabs.Trigger>
			<Tabs.Trigger value="history" class="flex-1 text-lg">{$_("History")}</Tabs.Trigger>
			<Tabs.Indicator/>
		</Tabs.List>
		<Tabs.Content value="notifications">
			{#each activeNotifications as notification}
			<div class="{notification.status == 2 ? 'pl-[13px]' : 'pl-2 border-l-5 dark:border-l-primary-500'} border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3"
						onclick={()=>{didRead(notification.message)}}>
				<p class="text-md dark:text-surface-300 text-surface-700">{format(new Date(notification.message.ts*1000), "PPP p")}</p>
				<p class="text-lg">{notification.message.title}</p>
				<p class="text-md">{notification.message.message}</p>
			</div>
			{/each}
		</Tabs.Content>
		<Tabs.Content value="systemstatus">
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
			{#if activeMessages.length==0}
			<p class="text-lg flex items-center justify-center mt-10">No active System status messages</p>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="history">
			{#each pastMessages.toReversed() as entry}
			<div class="pl-[13px] border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3" onclick={()=>{showEntry(entry)}}>
				<p class="text-md dark:text-surface-300 text-surface-700">{$_(severity[entry.severity]).toUpperCase()}: {format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {getRoomName(entry)}</p>
				<p class="text-lg">{@html entry.title}</p>
				<p class="text-md">{@html entry.affectedName}</p>
			</div>
			{/each}
		</Tabs.Content>
	</Tabs>
</div>

<Dialog
	open={openDialog}
	onInteractOutside={() => openDialog=false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]">
				<!--<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">{$_("Startpage")}</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => openDialog=false}>
							<XIcon class="size-4"/>
						</button>
					</div>
				</header> -->
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
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { openDialog = false }}>
					<XIcon/>
				</button>
			</div>
		</header>
				<Dialog.Description>
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
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
