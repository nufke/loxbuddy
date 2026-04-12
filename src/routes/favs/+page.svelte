<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { lbControl } from '$lib/helpers/LbControl';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { flip } from 'svelte/animate';

	let fav = 'favorites';
	let dragGroup = $state('');
	let draggingItem: any;
	let animatingItems = new Set();

	let userSettings = $derived(controlStore.userSettings);
	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
	let userDefinedOrder = $derived(appStore.userDefinedOrder);
	let favoriteControls = $derived(
		controlStore.controlList.filter((control) => isFavorite(userSettings.userDefaultStructure, control, fav))
		.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, b, fav) - getPosition(userSettings.userDefaultStructure, a, fav))
	);

	function isFavorite(obj: any, control: Control, key: string) {
		if (obj && obj[control.uuidAction] && userDefinedOrder) { 
			return obj[control.uuidAction][key] ? obj[control.uuidAction][key].isFav : false;
		} else {
			return control.isFavorite;
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
</script>

<div class="container mx-auto max-w-[800px] lg:max-w-[1280px] p-3">
	<p class="pl-2 pb-2 h5">{$_('Favorites')}</p>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
		{#each favoriteControls as control (control)}
			{@const Component = lbControl.getControl(control.type)}
			<div animate:flip={{ duration: appStore.dnd.duration }}
				draggable={appStore.dnd.isEnabled}
				ondragstart={() => {draggingItem = control; dragGroup = fav}}
				ondragend={() => {draggingItem = undefined; dragGroup = ''}}
				ondragenter={() => { favoriteControls = swapItems(favoriteControls, control, fav)}}
				ondragover={(event) => {event.preventDefault(); if (event && event.dataTransfer) event.dataTransfer.dropEffect = 'move';}}>
					<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
			</div>
		{/each}
	</div>
</div>
