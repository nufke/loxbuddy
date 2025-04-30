<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { controlList, categoryList, roomList } from '$lib/stores/stores';
	import { getComponent } from '$lib/helpers/components';

	export let data;
	let uuid = data.uuid;

	$: filteredControls = $controlList.filter((control) => control.room === uuid)
				.sort((a, b) => a.name.localeCompare(b.name));

	$: labels =  $categoryList.filter((item) => filteredControls.map((control) => control.cat)
				.indexOf(item.uuid) > -1)
				.sort((a, b) => a.name.localeCompare(b.name));

	$: pageTitle = $roomList.find((item) => filteredControls[0].room == item.uuid)
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{pageTitle?.name}</h1>
	{#each labels as label}
		<h1 class="h5 ml-2">{label.name}</h1>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each filteredControls.filter( item => item.cat == label.uuid ) as control}
				<svelte:component this={getComponent(control.type)} {control} />
			{/each}
		</div>
	{/each}
</div>
