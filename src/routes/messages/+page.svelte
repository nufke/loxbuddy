<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import type { SystemStatus } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';

	let group = $state('1');
	let messages = $derived(store.getMessages()) as SystemStatus;
	let activeMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == false) : []);
	let pastMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == true) : []);
	let notificationList = $derived(Object.values(store.notificationsMap).sort((a, b) => b.ts - a.ts));
	let visited: any = $state({});

	store.updateNotificationStorage();
	
	function didVisit(s: string) {
		visited[s] = true;
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
				{#each notificationList as notification}
				<div class="{visited[notification.uid] ? 'pl-[13px]' : 'pl-2 border-l-5 dark:border-l-primary-500'} border-b dark:border-surface-900 border-surface-200 cursor-pointer pt-3 pb-3 pr-3" onclick={()=>{didVisit(notification.uid)}}>
					<p class="text-md text-surface-500">{format(new Date(notification.ts*1000), "PPP p")}</p>
					<p class="text-lg">{notification.title}</p>
					<p class="text-md">{notification.message}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="2">
				{#each activeMessages as entry}
				<div class="border-b dark:border-surface-900 border-surface-200 p-3">
					<p class="text-md text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {store?.rooms[entry?.roomUuid].name}</p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="3">
				{#each pastMessages.toReversed() as entry}
				<div class="border-b dark:border-surface-900 border-surface-200 p-3">
					<p class="text-md text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p")} {entry.roomUuid ? store.rooms[entry.roomUuid].name : ''}</p>
					<p class="text-lg">{@html entry.title}</p>
					<p class="text-md">{@html entry.affectedName}</p>
				</div>
				{/each}
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</div>
