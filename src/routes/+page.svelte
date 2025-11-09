<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/Store.svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { flip } from 'svelte/animate';
	import { customdnd } from '$lib/helpers/custom-drag-n-drop';
	import { Trash } from '@lucide/svelte';

	let tabGroup = $state('1');
	let fav = 'favorites';
	let draggingItem: any;
	let animatingItems = new Set();

	let userSettings = $derived(store.userSettings);
	let room = $derived(store.roomList.find( (room) => room.name == $_('General') || room.name == $_('Central')));
	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);

	let favoriteControls = $derived(
		store.controlList.filter((control) => isFavorite(userSettings.userDefaultStructure, control, fav))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, fav) - getPosition(userSettings.userDefaultStructure, b, fav))
	);

	let centralControls = $derived(
		store.controlList.filter((control) => (control.room === room?.uuid && isFavorite(userSettings.userDefaultStructure, control, 'room')) )
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
	);

	function isFavorite(obj: any, control: Control, key: string) {
		return obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].isFav : false : false;
	}

	function getPosition(obj: any, control: Control, key: string) {
		let pos = obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].position : 999 : 999;
		return pos;
	}

	function swapItems(list: Control[], item: Control) {
		let newList = list;
		if (draggingItem === item || animatingItems.has(item)) {
			return list;
		}
		animatingItems.add(item);
		setTimeout(() => animatingItems.delete(item), store.dnd.duration);
		const itemA = list.indexOf(draggingItem);
		const itemB = list.indexOf(item);
		newList[itemA] = item;
		newList[itemB] = draggingItem;
		return newList; // update list (triggers effect)
	}
</script>

<div class="container mx-auto max-w-[1280px] p-3 lb-page-center">
	<Tabs value={tabGroup} listBorder='' onValueChange={(e) => (tabGroup = e.value)} >
		{#snippet list()}
			<Tabs.Control value="1" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{$_('Favorites')}</Tabs.Control>
			<Tabs.Control value="2" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{$_('General')}</Tabs.Control>
		{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each favoriteControls as control (control)}
						{@const Component = lbControl.getControl(control.type)}
						<div animate:flip={{ duration: store.dnd.duration }} use:customdnd
							draggable={store.dnd.isEnabled}
							ondragstart={() => {draggingItem = control}}
							ondragend={() => {draggingItem = undefined}}
		  				ondragenter={() => { favoriteControls = swapItems(favoriteControls, control)}}
							ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
								<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
						</div>
					{/each}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="2">
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each centralControls as control (control)}
						{@const Component = lbControl.getControl(control.type)}
						<div animate:flip={{ duration: store.dnd.duration }} use:customdnd
							draggable={store.dnd.isEnabled}
							ondragstart={() => {draggingItem = control}}
							ondragend={() => {draggingItem = undefined}}
		  				ondragenter={() => { centralControls = swapItems(centralControls, control)}}
							ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
						<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
						</div>
					{/each}
				</div>
			</Tabs.Panel>
		{/snippet}
	</Tabs>
</div>
