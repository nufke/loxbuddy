<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { controlList, categoryList } from '$lib/stores/stores';
	import { getComponent } from '$lib/helpers/components';

	$: filteredControls = $controlList.filter((control) => control.isFavorite === true)
				.sort((a, b) => a.name.localeCompare(b.name));

	$: labels = $categoryList.filter((item) => filteredControls.map((control) => control.cat)
				.indexOf(item.uuid) > -1)
				.sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[1280px]">
	<h1 class="h4 ml-2">{$_('Favorites')}</h1>
	{#each labels as label}
		<h1 class="h5 ml-2">{label.name}</h1>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:flex-wrap">
			{#each filteredControls.filter( item => item.cat == label.uuid || item.room == label.uuid) as control, index}
				<svelte:component this={getComponent(control.type)} {control} />
			{/each}
		</div>
	{/each}
</div>
