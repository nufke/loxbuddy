<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { Room, UserDefaultStructure } from '$lib/types/models';
	import LbCard from '$lib/components/Common/LbCard.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';

	const key = 'room';
	const fav = 'favorites';
	let dragGroup = '';
	let draggingItem: any;
	let animatingItems = new Set();
	let dragHandlePressed = false;

	let userSettings = $derived(controlStore.userSettings);
	let userDefinedOrder = $derived(appStore.userDefinedOrder);
	let userDefaultStructure = $derived(userSettings?.userDefaultStructure) as UserDefaultStructure;

	let items: Room[] = $derived(
		controlStore.roomList.filter((item) => controlStore.controlList.map((control) => control.room)
		.indexOf(item.uuid) > -1)
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userDefaultStructure, a, key) - getPosition(userDefaultStructure, b, key))
	);

	let favorites: Room[] = $derived(
		items.filter((item) => isFavorite(userDefaultStructure, item, fav))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userDefaultStructure, a, fav) - getPosition(userDefaultStructure, b, fav))
	);

	/**
	 * Check if given room is set as favorite
	 * @param obj Object containing the usersettings
	 * @param control Actual room
	 * @param key Filter based on given key
	 */
	function isFavorite(obj: UserDefaultStructure, room: Room, key: string): boolean {
		if (obj && obj[room.uuid] && obj[room.uuid][key] && userDefinedOrder) { 
			return obj[room.uuid][key].isFav ?? false;
		} else {
			return room.isFavorite;
		}
	}

	/**
	 * Get the position of the given room. This defines the order in the sorting
	 * @param obj Object containing the usersettings
	 * @param control Actual room
	 * @param key Filter based on given key
	 */
	function getPosition(obj: UserDefaultStructure, room: Room, key: string): number {
		if (obj && obj[room.uuid] && obj[room.uuid][key] && userDefinedOrder) {
			return obj[room.uuid][key].position ?? 0;
		} else {
			return 0; /* no position enforced, fall-back to alphabatic oder */
		}
	}

	/**
	 * Helper function to swap rooms when sorting is enabled
	 * @param list List of rooms
	 * @param item The selected room being moved
	 * @param group Filter based on the given key
	 */
	function swapItems(list: Room[], item: Room, group: string): Room[] {
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

	function onDragHandlePointerDown(event: PointerEvent): void {
		dragHandlePressed = !!(event.target as Element).closest('[data-drag-handle]');
	}
</script>

<div class="container p-3 mx-auto max-w-[640px] lg:max-w-[960px] lb-page-center">
	<p class="pl-2 h5">{$_('Rooms')}</p>
	{#if favorites.length}
		<div class="mt-2 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each favorites as item (item)}
			<div animate:flip={{ duration: appStore.dnd.duration }}
				draggable={appStore.dnd.isEnabled}
				onpointerdown={onDragHandlePointerDown}
				ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = item; dragGroup = fav; }}
				ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(favorites, fav);}}
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
			<div animate:flip={{ duration: appStore.dnd.duration  }}
				draggable={appStore.dnd.isEnabled}
				onpointerdown={onDragHandlePointerDown}
				ondragstart={(e) => {if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = item; dragGroup = key}}
				ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(items, key)}}
				ondragenter={() => { items = swapItems(items, item, key)}}
				ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
				<LbCard {key} {item} isFavorite={false}/>
			</div>
		{/each}
	</div>
</div>
