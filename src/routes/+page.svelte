<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import type { Control, ControlOptions, UserDefaultStructure } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';
	import { goto } from '$app/navigation';
	import { fadeInOut } from '$lib/helpers/styles';

	let key = 'room';
	let dragGroup = $state('');
	let draggingItem: any;
	let animatingItems = new Set();
	let dragHandlePressed = false;

	let isCustomSorting = $derived(controlStore.sortingMode > 0);
	let customSorting = $derived(controlStore.customSorting);
	let centralRooms = $derived(controlStore.roomList.filter((room) => room.name.includes($_('General')) || room.name.includes($_('Central'))));
	let centralRoomsUuids = $derived(centralRooms.map((room) => room.uuid));
	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);

	let centralControls = $derived(
		controlStore.controlList.filter((control) => centralRoomsUuids.includes(control.room))
		.filter((item) => isFavorite(customSorting, item, key))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(customSorting, a, key) - getPosition(customSorting, b, key))
	);

	let openPopup = $derived(controlStore.controlList.length == 0 && appStore.loginDialog.state == false);

	/**
	 * Check if given control is set as favorite control
	 * @param obj Object containing the sorting
	 * @param control Actual control
	 * @param key Filter based on given key
	 */
	function isFavorite(obj: UserDefaultStructure, control: Control, key: string): boolean {
		if (obj && obj[control.uuidAction] && obj[control.uuidAction][key] && isCustomSorting) { 
			return obj[control.uuidAction][key].isFav ?? false;
		} else {
			return control.defaultRating > 0;
		}
	}

	/**
	 * Get the position of the given control. This defines the order in the sorting
	 * @param obj Object containing the sorting
	 * @param control Actual control
	 * @param key Filter based on given key
	 */
	function getPosition(obj: UserDefaultStructure, control: Control, key: string): number {
		if (obj && obj[control.uuidAction] && obj[control.uuidAction][key] && isCustomSorting) { 
			return obj[control.uuidAction][key].position ?? 0;
		} else {
			return control.defaultRating * -1;
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
		setTimeout(() => animatingItems.delete(item), 300);
		const itemA = list.indexOf(draggingItem);
		const itemB = list.indexOf(item);
		newList[itemA] = item;
		newList[itemB] = draggingItem;
		return [...newList]; // update list (triggers effect)
	}

	/**
	 * Helper function to close the connection dialog and return to login page
	 */
	function cancelConnect(): void {
		openPopup = false;
		appStore.loginDialog.state = true; // goto login 
	}

	/**
	 * Helper function to detect if the drag-handle icon is selected
	 * @param event PointerEvent of the drag pointer
	 */
	function onDragHandlePointerDown(event: PointerEvent): void {
		dragHandlePressed = !!(event.target as Element).closest('[data-drag-handle]');
	}
</script>

<div class="container mx-auto max-w-[800px] lg:max-w-[1280px] p-3">
  <div class="space-y-2">
		{#if centralRooms.length}
			{#each centralRooms as centralRoom}
			{@const selectedControls = centralControls.filter((control) => control.room == centralRoom.uuid)}
				<button class="pl-2 h5" onclick={() => {goto('/room/'+centralRoom.uuid)}}>{centralRoom.name}</button>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each selectedControls as control (control)}
						{@const Component = lbControl.getControl(control.type)}
						<div animate:flip={{ duration: 300 }}
							draggable={controlStore.sorting}
							onpointerdown={onDragHandlePointerDown}
							ondragstart={(e) => { if (!dragHandlePressed) { e.preventDefault(); return; } draggingItem = control; dragGroup = centralRoom.name; }}
							ondragend={() => {draggingItem = undefined; dragGroup = ''; dragHandlePressed = false; controlStore.updateSortingOrder(selectedControls, key);}}
							ondragenter={() => { centralControls = swapItems(centralControls, control, centralRoom.name)}}
							ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
							<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
						</div>
					{/each}
			</div>
			{/each}
		{/if}
  </div>
</div>

<Dialog
	open={openPopup}
	onInteractOutside={()=>{openPopup=false}}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-150 bg-surface-50-950 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-150 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full w-[350px] {fadeInOut}">
				<Dialog.Description>
					<div class="mt-4 grid w-full place-items-center overflow-x-scroll rounded-lg p-3 lg:overflow-visible">
						<svg class="animate-spin w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
					<div class="w-full p-3 flex flex-col justify-center items-center">
						<span>{$_("Connecting to Miniserver")}</span>
						{#if appStore.credentials && appStore.credentials.msName.length}
							<span>{appStore.credentials.msName}</span>
						{/if}
					</div>
				</Dialog.Description>
				<div class="flex justify-center pt-4">
					<button class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={cancelConnect}>
						<span class="flex justify-center items-center truncate text-lg">{$_("Cancel")}</span>
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
