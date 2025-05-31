<script lang="ts">
	import type { PageProps } from './$types';
	import { _ } from 'svelte-i18n';
	import { getComponent } from '$lib/helpers/components';
	import { store } from '$lib/stores/store.svelte';

	let { data }: PageProps = $props();
	const uuid = data.uuid;

	let filteredControls = $derived(
		store.controlList.filter((control) => control.room === uuid)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let labels = $derived(
		store.categoryList.filter((item) => filteredControls.map((control) => control.cat)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let pageTitle =  $derived(
		store.roomList.find((item) => filteredControls[0].room == item.uuid)
	);
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{pageTitle?.name}</h1>
	{#each labels as label}
		<h1 class="h5 ml-2">{label.name}</h1>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each filteredControls.filter( item => item.cat == label.uuid ) as control}
				{@const Component = getComponent(control.type)}
    		<Component control={control} isSubControl={false}/>
			{/each}
		</div>
	{/each}
</div>
