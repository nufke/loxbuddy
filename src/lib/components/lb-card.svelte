<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import type { Room, Category } from '$lib/types/models';

	export let key: string;
	export let item: Room | Category;

	let color = 'white'; // TODO text and image colour
	let href = key + '/' + item.uuid;
</script>

<a href={href} class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
           	bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		<div class="flex items-center truncate">
			<div class="relative inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full dark:bg-surface-950">
				<svg use:inlineSvg={'/loxicons/' + item.image} fill={color} width="24" height="24"></svg>
			</div>
			<div class="mt-0 ml-3 truncate">
				<h1 class="truncate text-lg">{item.name}</h1>
			</div>
		</div>
	</div>
</a>
