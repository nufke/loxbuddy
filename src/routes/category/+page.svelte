<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Category } from '$lib/types/models';
	import LbCard from '$lib/components/Common/LbCard.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let key = 'category';
	let fav = 'favorites';
	let showFavorites = true; // TODO make configurable

	let userSettings = $derived(store.userSettings);
	let items: Category[] = $derived(
		store.categoryList.filter((item) => store.controlList.map((control) => control.cat)
		.indexOf(item.uuid) > -1)
		//.sort((a, b) => a.name.localeCompare(b.name, store.locale)));
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key) - getPosition(userSettings.userDefaultStructure, b, key))
	);

	let favorites: Category[] = $derived(
		items.filter((item) => isFavorite(userSettings.userDefaultStructure, item, fav))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, fav) - getPosition(userSettings.userDefaultStructure, b, fav))
	);

	function isFavorite(obj: any, cat: Category, key: string) {
		return obj[cat.uuid] ? obj[cat.uuid][key] ? obj[cat.uuid][key].isFav : false : false;
	}

	function getPosition(obj: any, cat: Category, key: string) {
		let pos = obj[cat.uuid] ?  obj[cat.uuid][key] ? obj[cat.uuid][key].position : 0 : 0;
		return pos;
	}
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
	<p class="pl-2 h4">{$_('Categories')}</p>
	{#if favorites.length && showFavorites}
		<div class="mt-4 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
			{#each favorites as item}
				<LbCard {key} {item}/>
			{/each}
		</div>
	{/if}
	<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
		{#each items as item}
			<LbCard {key} {item}/>
 		{/each}
	</div>
</div>
