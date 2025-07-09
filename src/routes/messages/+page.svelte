<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import type { SystemStatus, SystemStatusEntry } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';

	let group = $state('1');
	let messages = $derived(store.getMessages()) as SystemStatus;
	let activeMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == false) : []);
	let pastMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == true) : []);
	let notificationList = $derived(Object.values(store.notificationsMap).sort((a, b) => b.message.ts - a.message.ts));
	let activeNotifications = $derived(notificationList.filter( items => items.status < 3)); // new or read
	let archivedNotifications = $derived(notificationList.filter( items => items.status == 3)); // new or read

	store.updateNotificationStorage();

	function didRead(uid: string) {
		store.updateNotificationReadStatus(uid);
	}

	function getRoomName(entry: SystemStatusEntry) {
		return entry && entry.roomUuid && store.rooms[entry.roomUuid] ? store.rooms[entry.roomUuid].name : '';
	}
</script>

<div class="container mx-auto max-w-[1280px] space-y-3 p-3">
	<Tabs value={group} onValueChange={(e) => (group = e.value)} fluid>
		{#snippet list()}
			<Tabs.Control labelBase="text-lg" stateLabelActive="text-primary-500" value="1">{$_("Notifications")}</Tabs.Control>
			<Tabs.Control labelBase="text-lg" stateLabelActive="text-primary-500" value="2">{$_("System status")}</Tabs.Control>
			<Tabs.Control labelBase="text-lg" stateLabelActive="text-primary-500" value="3">{$_("History")}</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				{#each activeNotifications as notification}
				<div class="{notification.status == 2 ? 'pl-[13px]' : 'pl-2 border-l-5 dark:border-l-primary-500'} border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3" onclick={()=>{didRead(notification.message.uid)}}>
					<p class="text-md text-surface-500">{format(new Date(notification.message.ts*1000), "PPP p")}</p>
					<p class="text-lg">{notification.message.title}</p>
					<p class="text-md">{notification.message.message}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="2">
				{#each activeMessages.toReversed() as entry}
				<div class="border-b dark:border-surface-900 border-surface-200 p-3">
					<p class="text-md text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {getRoomName(entry)}</p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="3">
				{#each pastMessages.toReversed() as entry}
				<div class="border-b dark:border-surface-900 border-surface-200 p-3">
					<p class="text-md text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {getRoomName(entry)}</p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</div>
