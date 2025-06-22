<script lang="ts">
	import type { Room, Category } from '$lib/types/models';
	import { loxiconsPath } from '$lib/helpers/paths';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';

	let { key, item } : { key: string, item: Room | Category} = $props();

	const color = 'fill-white'; // TODO text and image colour
	const href = key + '/' + item.uuid;
</script>

<a href={href} class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
           	bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10">
	<div class="w-full">
		<div class="flex items-center truncate">
			<div class="relative inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full dark:bg-surface-950">
				<LbIcon class={color} name={loxiconsPath + item.image} width="24" height="24"/>
			</div>
			<div class="mt-0 ml-3 truncate">
				<h1 class="truncate text-lg">{item.name}</h1>
			</div>
		</div>
	</div>
</a>
