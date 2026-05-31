<script lang="ts" module>
	import { _ } from 'svelte-i18n';
	import type { Category, UserDefaultStructure } from '$lib/types/models';
	import LbCard from '$lib/components/Common/LbCard.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';

	const key = 'category';
	const fav = 'favorites';
	let dragGroup = '';
	let dragHandlePressed = false;
	let draggingItem: any;
	let animatingItems = new Set();

	let isCustomSorting = $derived(controlStore.sortingMode > 0);
	let customSorting = $derived(controlStore.customSorting);	

	let items: Category[] = $derived(
		controlStore.categoryList.filter((item) => controlStore.controlList.map((control) => control.cat)
		.indexOf(item.uuid) > -1)
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(customSorting, a, key) - getPosition(customSorting, b, key))
	);

	let favorites: Category[] = $derived(
		items.filter((item) => isFavorite(customSorting, item, fav))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(customSorting, a, fav) - getPosition(customSorting, b, fav))
	);

	/**
	 * Check if given control is set as favorite
	 * @param obj Object containing the sorting
	 * @param control Actual category
	 * @param key Filter based on given key
	 */
	function isFavorite(obj: UserDefaultStructure, cat: Category, key: string): boolean {
		if (obj && obj[cat.uuid] && obj[cat.uuid][key] && isCustomSorting) {
			return obj[cat.uuid][key].isFav ?? false;
		} else {
			return cat.isFavorite;
		}
	}

	/**
	 * Get the position of the given Category. This defines the order in the sorting
	 * @param obj Object containing the sorting
	 * @param control Actual category
	 * @param key Filter based on given key
	 */
	function getPosition(obj: UserDefaultStructure, cat: Category, key: string): number {
		if (obj && obj[cat.uuid] && obj[cat.uuid][key] && isCustomSorting) {
			return obj[cat.uuid][key].position ?? 0;
		} else {
			return 0; /* no position enforced, fall-back to alphabatic oder */
		}
	}

	/**
	 * Helper function to swap categories when sorting is enabled
	 * @param list List of categories
	 * @param item The selected category being moved
	 * @param group Filter based on the given key
	 */
	function swapItems(list: Category[], item: Category, group: string): Category[] {
		let newList = list;
		if (draggingItem === item || animatingItems.has(item) || group !== dragGroup) {
			return list;
		}
		animatingItems.add(item);
		setTimeout(() => animatingItems.delete(item), 300);
		const itemA = list.indexOf(draggingItem);
		const itemB = list.indexOf(item);
		newList[itemA] = item;
		newList[itemB] = draggingItem;
		return [...newList]; // update list (triggers effect)
	}

	/**
	 * Helper function to detect if the drag-handle icon is selected
	 * @param event PointerEvent of the drag pointer
	 */
	function onDragHandlePointerDown(event: PointerEvent): void {
		dragHandlePressed = !!(event.target as Element).closest('[data-drag-handle]');
	}
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
	<p class="pl-2 h5">{$_('Categories')}</p>
	{#if favorites.length}
		<div class="mt-2 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each favorites as item (item)}
			<div animate:flip={{ duration: 300 }}
				draggable={controlStore.sorting}
				onpointerdown={onDragHandlePointerDown}
				ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = item; dragGroup = fav; }}
				ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(favorites, fav)}}
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
			<div animate:flip={{ duration: 300 }}
				draggable={controlStore.sorting}
				onpointerdown={onDragHandlePointerDown}
				ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = item; dragGroup = key; }}
				ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(items, key)}}
				ondragenter={() => { items = swapItems(items, item, key)}}
				ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
				<LbCard {key} {item} isFavorite={false}/>
			</div>
		{/each}
	</div>
</div>
