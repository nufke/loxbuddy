<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { Control, ControlOptions, Category, Room, UserDefaultStructure } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';

	let { data }: PageProps = $props();

	const key = 'room';
	const fav = 'favorites';
	let draggingItem: any;
	let animatingItems = new Set();
	let dragHandlePressed = false;
	appStore.nav = '/room';

	let dragGroup = $state('');
	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
	let userDefinedOrder = $derived(appStore.userDefinedOrder);
	let userSettings = $derived(controlStore.userSettings);
	let userDefaultStructure = $derived(userSettings?.userDefaultStructure) as UserDefaultStructure;
	let page: Room | undefined = $derived(controlStore.rooms.get(data.uuid));

	let filteredControls: Control[] = $derived(
		controlStore.controlList.filter((control) => (control.room === data.uuid) && ((control.restrictions & 1) != 1))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userDefaultStructure, a, key + '/' + a.cat) - getPosition(userDefaultStructure, b, key + '/' + b.cat))
	);

	let favorites: Control[] = $derived(
		controlStore.controlList.filter((control) => (control.room === data.uuid) && ((control.restrictions & 1) != 1))
		.filter((control) => isFavorite(userDefaultStructure, control, key))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userDefaultStructure, a, key) - getPosition(userDefaultStructure, b, key))
	);

	let labels: Category[] = $derived(
		controlStore.categoryList.filter((item) => filteredControls.map((control) => control.cat)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
	);

	/**
	 * Check if given control is set as favorite
	 * @param obj Object containing the usersettings
	 * @param control Actual control
	 * @param key Filter based on given key
	 */
	function isFavorite(obj: UserDefaultStructure, control: Control, key: string): boolean {
		if (obj && obj[control.uuidAction] && obj[control.uuidAction][key] && userDefinedOrder) {
			return obj[control.uuidAction][key].isFav ?? false;
		} else {
			return control.defaultRating > 0;
		}
	}

	/**
	 * Get the position of the given control. This defines the order in the sorting
	 * @param obj Object containing the usersettings
	 * @param control Actual control
	 * @param key Filter based on given key
	 */
	function getPosition(obj: UserDefaultStructure, control: Control, key: string): number {
		if (obj && obj[control.uuidAction] && obj[control.uuidAction][key] && userDefinedOrder) {
			return obj[control.uuidAction][key].position ?? 0;
		} else {
			return 0; /* no position enforced, fall-back to alphabatic oder */
		}
	}

	/**
	 * Helper function to swap controls when control sorting is enabled
	 * @param list List of the controls for the given (central) room
	 * @param item The selected control being moved
	 * @param group Filter based on given key
	 */
	function swapItems(list: Control[], item: Control, group: string): Control[] {
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

	function onDragHandlePointerDown(event: PointerEvent | DragEvent): void {
		dragHandlePressed = !!(event.target as Element).closest('[data-drag-handle]');
	}
</script>

<div class="container mx-auto max-w-[1280px] p-3 lb-page-center">
	<div>
		<p class="ml-2 mb-2 h5">{page?.name}</p>
	</div>
	{#if favorites.length}
		<div class="mt-2 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
			{#each favorites as control (control)}
				{@const Component = lbControl.getControl(control.type)}
				<div animate:flip={{ duration: appStore.dnd.duration }}
					draggable={appStore.dnd.isEnabled}
					onpointerdown={onDragHandlePointerDown}
					ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = control; dragGroup = fav; }}
					ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(favorites, key)}}
					ondragenter={() => { favorites = swapItems(favorites, control, fav)}}
					ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
					<Component control={control} controlOptions={{...controlOptions, isFavorite: true}}/>
				</div>
			{/each}
		</div>
	{/if}
	<div class="space-y-2">
		{#each labels as label }
			{@const selectedControls = filteredControls.filter((item) => item.cat == label.uuid)}
			<button class="h6 ml-2" onclick={() => {goto('/category/'+label.uuid)}}>{label.name}</button>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:flex-wrap" >
				{#each selectedControls as control (control)}
					{@const Component = lbControl.getControl(control.type)}
					<div animate:flip={{ duration: appStore.dnd.duration }}
						draggable={appStore.dnd.isEnabled}
						onpointerdown={onDragHandlePointerDown}
						ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = control; dragGroup = label.name; }}
						ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(selectedControls, 'room/' + label.uuid)}}
						ondragenter={() => { filteredControls = swapItems(filteredControls, control, label.name)}}
						ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
							<Component control={control} {controlOptions}/>
					</div>
					{/each}
			</div>
		{/each}
	</div>
</div>
