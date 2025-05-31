<script lang="ts">
	import type { PageProps } from './$types';
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
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{pageTitle?.name}</h1>
	{#each labels as label}
		<h1 class="h5 ml-2">{label.name}</h1>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each filteredControls.filter( item => item.room == label.uuid) as control}
				{@const Component = getComponent(control.type)}
				<Component control={control} isSubControl={false}/>
				{/each}
		</div>
	{/each}
</div>
