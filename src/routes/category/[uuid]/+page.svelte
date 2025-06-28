<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { getComponent } from '$lib/helpers/components';
	import { store } from '$lib/stores/store.svelte';

	let { data }: PageProps = $props();
	let uuid = data.uuid;

	let filteredControls = $derived(
		store.controlList.filter((control) => control.cat === uuid)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let labels = $derived(
		store.roomList.filter((item) => filteredControls.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let pageTitle =  $derived(
		store.categoryList.find((item) => filteredControls[0].cat == item.uuid)
	);

	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{pageTitle?.name}</h1>
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
