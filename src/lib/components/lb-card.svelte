<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import type { Room, Category } from '$lib/types/models';

	export let item: Room | Category;
	export let currentMenuState: string;
	export let action: any;

	let color = 'white'; // TODO text and image colour
</script>

<button on:click={() => action(currentMenuState, item.uuid)}>
	<div class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
            	bg-linear-to-r from-white/[0.095] to-white/5 px-3 py-2 hover:border-white/10">
		<div class="flex w-full justify-between">
			<div class="flex items-center truncate">
				<div class="placeholder-circle flex h-10 w-10 items-center justify-center">
					<svg use:inlineSvg={'/loxicons/' + item.image} fill={color} width="24" height="24"></svg>
				</div>
				<div class="mt-0 ml-3 truncate">
					<h1 class="truncate text-lg">{item.name}</h1>
				</div>
			</div>
		</div>
	</div>
</button>
