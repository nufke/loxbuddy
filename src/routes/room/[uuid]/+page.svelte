<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { Control, ControlOptions, Category, Room } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import { store } from '$lib/stores/Store.svelte';
	import { ArrowLeftIcon } from '@lucide/svelte';
	import { flip } from 'svelte/animate';
	import { customdnd } from '$lib/helpers/custom-drag-n-drop';

	let { data }: PageProps = $props();

	const key = 'room';
	const fav = 'favorites';
	let userSettings = $derived(store.userSettings);
	let dragGroup = $state('');
	let draggingItem: any;
	let animatingItems = new Set();

	store.setNav({ label: 'ArrowLeft', href: '/room', icon: ArrowLeftIcon }); // TODO change navigation concept

	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);

	let filteredControls: Control[] = $derived(
		store.controlList.filter((control) => (control.room === data.uuid) && ((control.restrictions & 1) != 1))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key + '/' + a.cat) - getPosition(userSettings.userDefaultStructure, b, key + '/' + b.cat))
	);

	let favorites: Control[] = $derived(
		filteredControls.filter((control) => isFavorite(userSettings.userDefaultStructure, control, key))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key) - getPosition(userSettings.userDefaultStructure, b, key))
	);

	let labels: Category[] = $derived(
		store.categoryList.filter((item) => filteredControls.map((control) => control.cat)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, store.locale))
	);

	let pageTitle: Room | undefined = $derived(
		store.roomList.find((item) => filteredControls[0].room == item.uuid)
	);

	function isFavorite(obj: any, control: Control, key: string) {
		return obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].isFav : false : false;
	}

	function getPosition(obj: any, control: Control, key: string) {
		let pos = obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].position : 999 : 999;
		return pos;
	}

	function swapItems(list: Control[], item: Control, group: string) {
		let newList = list;
		if (draggingItem === item || animatingItems.has(item) || group !== dragGroup) {
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
	<div>
		<p class="ml-2 mb-2 h5">{pageTitle?.name}</p>
	</div>
	{#if favorites.length}
		<div class="mt-2 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
			{#each favorites as control (control)}
				{@const Component = lbControl.getControl(control.type)}
				<div animate:flip={{ duration: store.dnd.duration }} use:customdnd
					draggable={store.dnd.isEnabled}
					ondragstart={() => {draggingItem = control; dragGroup = fav}}
					ondragend={() => {draggingItem = undefined; dragGroup = ''}}
					ondragenter={() => { favorites = swapItems(favorites, control, fav)}}
					ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
					<Component control={control} controlOptions={{...controlOptions, isFavorite: true}}/>
				</div>
			{/each}
		</div>
	{/if}
	<div class="space-y-2">
		{#each labels as label }
			<button class="h6 ml-2" onclick={() => {goto('/category/'+label.uuid)}}>{label.name}</button>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:flex-wrap" >
				{#each filteredControls.filter( item => item.cat == label.uuid) as control (control)}
					{@const Component = lbControl.getControl(control.type)}
					<div animate:flip={{ duration: store.dnd.duration }} use:customdnd
						draggable={store.dnd.isEnabled}
						ondragstart={() => {draggingItem = control; dragGroup = label.name}}
						ondragend={() => {draggingItem = undefined; dragGroup = ''}}
						ondragenter={() => { filteredControls = swapItems(filteredControls, control, label.name)}}
						ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
							<Component control={control} {controlOptions}/>
					</div>
					{/each}
			</div>
		{/each}
	</div>
</div>
