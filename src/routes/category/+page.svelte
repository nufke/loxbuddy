<script lang="ts" module>
	import { _ } from 'svelte-i18n';
	import type { Category, UserSettings } from '$lib/types/models';
	import LbCard from '$lib/components/Common/LbCard.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';
	import { customdnd } from '$lib/helpers/custom-drag-n-drop';

	const key = 'category';
	const fav = 'favorites';
	let dragGroup = '';
	let draggingItem: any;
	let animatingItems = new Set();

	let userSettings = $derived(controlStore.userSettings);
	let items: Category[] = $derived(
		controlStore.categoryList.filter((item) => controlStore.controlList.map((control) => control.cat)
		.indexOf(item.uuid) > -1)
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key) - getPosition(userSettings.userDefaultStructure, b, key))
	);

	let favorites: Category[] = $derived(
		items.filter((item) => isFavorite(userSettings.userDefaultStructure, item, fav))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, fav) - getPosition(userSettings.userDefaultStructure, b, fav))
	);

	function isFavorite(obj: any, cat: Category, key: string) {
		return obj[cat.uuid] ? obj[cat.uuid][key] ? obj[cat.uuid][key].isFav : false : false;
	}

	function getPosition(obj: any, cat: Category, key: string) {
		return obj[cat.uuid] ? obj[cat.uuid][key] ? obj[cat.uuid][key].position : 999 : 999;
	}

	function swapItems(list: Category[], item: Category, group: string) {
		let newList = list;
		if (draggingItem === item || animatingItems.has(item) || group !== dragGroup) {
			return list;
		}
		animatingItems.add(item);
		setTimeout(() => animatingItems.delete(item), appStore.dnd.duration);
		const itemA = list.indexOf(draggingItem);
		const itemB = list.indexOf(item);
		newList[itemA] = item;
		newList[itemB] = draggingItem;
		return [...newList]; // update list (triggers effect)
	}
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
	<p class="pl-2 h5">{$_('Categories')}</p>
	{#if favorites.length}
		<div class="mt-2 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each favorites as item (item)}
			<div animate:flip={{ duration: appStore.dnd.duration }} use:customdnd
				draggable={appStore.dnd.isEnabled}
				class=""
				ondragstart={() => {draggingItem = item; dragGroup = fav}}
				ondragend={() => {draggingItem = undefined; dragGroup = ''}}
				ondragenter={() => { favorites = swapItems(favorites, item, fav)}}
				ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
				<LbCard {key} {item} isFavorite={true}/>
			</div>
			{/each}
		</div>
	{/if}
	<p class="pl-2 h6">{$_('All')}</p>
	<div class="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
		{#each items as item (item)}
			<div animate:flip={{ duration: appStore.dnd.duration }} use:customdnd
				draggable={appStore.dnd.isEnabled}
				ondragstart={() => {draggingItem = item; dragGroup = key}}
				ondragend={() => {draggingItem = undefined; dragGroup = ''}}
				ondragenter={() => { items = swapItems(items, item, key)}}
				ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
				<LbCard {key} {item} isFavorite={false}/>
			</div>
		{/each}
	</div>
</div>
