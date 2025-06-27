<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import type { SystemStatus } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';

	let group = $state('1');
	let messages = $derived(store.getMessages()) as SystemStatus;
	let activeMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == false) : []);
	let pastMessages = $derived(messages && messages.entries ? messages.entries.filter( entry => entry.isHistoric == true) : []);
</script>

<div class="container mx-auto max-w-[1280px] space-y-3 p-3">
	<Tabs value={group} onValueChange={(e) => (group = e.value)} fluid>
		{#snippet list()}
			<Tabs.Control labelBase="text-lg" stateLabelActive="text-primary-500" value="1">{$_("Actual")}</Tabs.Control>
			<Tabs.Control labelBase="text-lg" stateLabelActive="text-primary-500" value="2">{$_("History")}</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				{#each activeMessages as entry}
				<div class="border-b border-b-stone-900 p-3">
					<p class="text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p", {locale: nl})} {store?.rooms[entry?.roomUuid].name}</p>
					<p class="text-lg">{@html entry.desc}</p>
				</div>
				{/each}
			</Tabs.Panel>
			<Tabs.Panel value="2">
				{#each pastMessages.toReversed() as entry}
				<div class="border-b border-b-stone-900 p-3">
					<p class="text-surface-500">{format(new Date(Number(entry.timestamps[0])*1000), "PPP p", {locale: nl})} {entry.roomUuid ? store.rooms[entry.roomUuid].name : ''}</p>
					<p class="text-lg">{@html entry.desc}</p>
				</div>
				{/each}
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</div>
