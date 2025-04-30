<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { controlList, categoryList } from '$lib/stores/stores';
	import LbCard from '$lib/components/lb-card.svelte';

	$: items = $categoryList.filter((item) => $controlList.map((control) => control.cat)
							.indexOf(item.uuid) > -1)
							.sort((a, b) => a.name.localeCompare(b.name));
  let key = 'category';
</script>

<div class="container space-y-3 p-3 mx-auto max-w-[640px]">
 	<h2 class="h4">{$_('Categories')}</h2>
	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex-wrap">
 		{#each items as item}
   		<LbCard {key} {item}/>
 		{/each}
	</div>
</div>
