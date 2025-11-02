<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Room } from '$lib/types/models';
	import LbCard from '$lib/components/Common/LbCard.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let key = 'room';
	let fav = 'favorites';
	let showFavorites = true; // TODO make configurable

	let userSettings = $derived(store.userSettings);
	let items: Room[] = $derived(
		store.roomList.filter((item) => store.controlList.map((control) => control.room)
		.indexOf(item.uuid) > -1)
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key) - getPosition(userSettings.userDefaultStructure, b, key))
	);

	let favorites: Room[] = $derived(
		items.filter((item) => isFavorite(userSettings.userDefaultStructure, item, fav))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, fav) - getPosition(userSettings.userDefaultStructure, b, fav))
	);

	function isFavorite(obj: any, room: Room, key: string) {
		return obj[room.uuid] ? obj[room.uuid][key] ? obj[room.uuid][key].isFav : false : false;
	}

	function getPosition(obj: any, room: Room, key: string) {
		return obj[room.uuid] ? obj[room.uuid][key] ? obj[room.uuid][key].position : 999 : 999;
	}
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
 	<p class="pl-2 h4">{$_('Rooms')}</p>
	{#if favorites.length && showFavorites}
		<div class="mt-4 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
			{#each favorites as item}
				<LbCard {key} {item} isFavorite={true}/>
			{/each}
		</div>
	{/if}
	<p class="pl-2 h5">{$_('All')}</p>
	<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
		{#each items as item}
			<LbCard {key} {item} isFavorite={false}/>
		{/each}
	</div>
</div>
