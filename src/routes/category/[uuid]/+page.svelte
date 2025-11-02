<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { Control, Room, Category, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { getComponent } from '$lib/helpers/components';
	import { store } from '$lib/stores/Store.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data }: PageProps = $props();

	let key = 'category';
	let room = 'room';
	let userSettings = $derived(store.userSettings);

	store.setNav({ label: 'ArrowLeft', href: '/category', icon: ArrowLeft }); // TODO change navigation concept

	let filteredControls: Control[] = $derived(
		store.controlList.filter((control) => (control.cat === data.uuid) && ((control.restrictions & 1) != 1))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, key + '/' + a.room) - getPosition(userSettings.userDefaultStructure, b, key + '/' + b.room))
	);

	let favoritesSystem: Control[] = $derived(
		filteredControls.filter((control) => control.defaultRating > 0));

	let favorites: Control[] = $derived(
		filteredControls.filter((control) => isFavorite(userSettings.userDefaultStructure, control, room))
		.sort((a, b) => a.name.localeCompare(b.name, store.locale))
		.sort((a, b) => getPosition(userSettings.userDefaultStructure, a, room) - getPosition(userSettings.userDefaultStructure, b, room))
	);

	function isFavorite(obj: any, control: Control, key: string) {
		//console.log('control.uuidAction]', obj[control.uuidAction] )
		return obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].isFav : false : false;
	}

	function getPosition(obj: any, control: Control, key: string) {
		let pos = obj[control.uuidAction] ? obj[control.uuidAction][key] ? obj[control.uuidAction][key].position : 999 : 999;
		//console.log('control.uuidAction]', obj[control.uuidAction], control.name, pos )
		return pos;
	}

	let labels: Room[] = $derived(
		store.roomList.filter((item) => filteredControls.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, store.locale))
	);

	let pageTitle: Category | undefined = $derived(
		store.categoryList.find((item) => filteredControls[0].cat == item.uuid)
	);

	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
</script>

<div class="container mx-auto max-w-[1280px] p-3 lb-page-center">
	<div>
		<p class="ml-2 mb-2 h4">{pageTitle?.name}</p>
	</div>
	{#if favorites.length}
		<div class="mt-4 mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
			{#each favorites as control}
				{@const Component = getComponent(control.type)}
				<Component control={control} controlOptions={{...controlOptions, isFavorite: true}}/>
			{/each}
		</div>
	{/if}
	<div class="space-y-2">
		{#each labels as label}
			<button class="h5 ml-2" onclick={() => {goto('/room/'+label.uuid)}}>{label.name}</button>
			<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:flex-wrap">
				{#each filteredControls.filter( item => item.room == label.uuid) as control}
					{@const Component = getComponent(control.type)}
					<Component control={control} {controlOptions}/>
				{/each}
		</div>
		{/each}
	</div>
</div>
