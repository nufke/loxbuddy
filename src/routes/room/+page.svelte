<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Room } from '$lib/types/models';
	import LbCard from '$lib/components/lb-card.svelte';
	import { store } from '$lib/stores/store.svelte';

	let items: Room[] = $derived(
		store.roomList.filter((item) => store.controlList.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, store.locale)));
	let key = 'room';
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
 	<h2 class="pl-2 h4">{$_('Rooms')}</h2>
	<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
		{#each items as item}
			<LbCard {key} {item}/>
		{/each}
	</div>
</div>
