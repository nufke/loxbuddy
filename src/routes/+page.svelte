<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import type { Control, ControlOptions } from '$lib/types/models';
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

	let userSettings = $derived(controlStore.userSettings);
	let userDefinedOrder = $derived(appStore.userDefinedOrder);
	let centralRooms = $derived(controlStore.roomList.filter((room) => room.name.includes($_('General')) || room.name.includes($_('Central'))));
	let centralRoomsUuids = $derived(centralRooms.map((room) => room.uuid));
	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);

	let centralControls = $derived(
		controlStore.controlList.filter((control) => centralRoomsUuids.includes(control.room))
		.filter((item) => isFavorite(userSettings.userDefaultStructure, item, key))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, b, key) - getPosition(userSettings.userDefaultStructure, a, key))
	);

	let openPopup = $derived(centralControls.length == 0 && appStore.loginDialog.state == false);

	function isFavorite(obj: any, control: Control, key: string) {
		if (obj && obj[control.uuidAction] && userDefinedOrder) { 
			return obj[control.uuidAction][key] ? obj[control.uuidAction][key].isFav : false;
		} else {
			return control.defaultRating > 0;
		}
	}

	function getPosition(obj: any, control: Control, key: string) {
		if (obj && obj[control.uuidAction] && userDefinedOrder) { 
			return obj[control.uuidAction][key] ? obj[control.uuidAction][key].position : 0;
		} else {
			return control.defaultRating;
		}
	}

	function swapItems(list: Control[], item: Control, group: string) {
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

	function cancelConnect() {
		openPopup = false;
		appStore.loginDialog.state = true; // goto login 
	}
</script>

<div class="container mx-auto max-w-[800px] lg:max-w-[1280px] p-3">
  <div class="space-y-2">
		{#if centralRooms.length}
			{#each centralRooms as centralRoom}
				<button class="pl-2 h5" onclick={() => {goto('/room/'+centralRoom.uuid)}}>{centralRoom.name}</button>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each centralControls.filter((control) => control.room == centralRoom.uuid) as control (control)}
						{@const Component = lbControl.getControl(control.type)}
						<div animate:flip={{ duration: appStore.dnd.duration }}
							draggable={appStore.dnd.isEnabled}
							ondragstart={() => {draggingItem = control; dragGroup = centralRoom.name}}
							ondragend={() => {draggingItem = undefined; dragGroup = ''}}
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
								md:max-w-9/10 md:max-h-9/10 w-[350px] {fadeInOut}">
				<Dialog.Description>
					<div class="mt-4 grid w-full place-items-center overflow-x-scroll rounded-lg p-3 lg:overflow-visible">
						<svg class="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
							<path d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
								stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
							<path d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
								stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
							</path>
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
					<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={cancelConnect}>
						<span class="flex justify-center items-center truncate text-lg">{$_("Cancel")}</span>
					</button>
				</div>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
