<script lang="ts">
	import type { Room, Category } from '$lib/types/models';
	import { loxiconsPath } from '$lib/helpers/paths';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';

	let { key, item, isFavorite } : { key: string, item: Room | Category, isFavorite: boolean } = $props();

	const color = 'dark:fill-surface-50 fill-surface-950'; // TODO text and image colour
	const href = key + '/' + item.uuid;
</script>

<a href={href} class="card m-0 flex min-h-[70px] shadow-sm items-center justify-start rounded-lg border border-white/5
										 	bg-surface-100-900 px-2 py-2 hover:border-white/10">
	<div class="w-full flex {isFavorite ? 'flex-col mt-1' : 'flex-row'}">
		<div class="flex justify-center">
			<div class="relative inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden 
								rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
				<LbIcon class={color} name={loxiconsPath + item.image} width="24" height="24"/>
			</div>
		</div>
		<div class="mt-0 {isFavorite ? 'ml-1' : 'ml-3'} flex justify-center items-center">
			<p class="truncate text-lg">{item.name}</p>
		</div>
	</div>
</a>
