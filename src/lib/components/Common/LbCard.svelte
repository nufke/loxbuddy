<script lang="ts">
	import type { Room, Category } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { appStore } from '$lib/stores/LbAppStore.svelte';

	let { key, item, isFavorite } : { key: string, item: Room | Category, isFavorite: boolean } = $props();

	const color = 'dark:text-surface-50 text-surface-950'; // TODO text and image colour
</script>

<div role="button" tabindex="0" class="card m-0 flex min-h-[70px] shadow-sm items-center justify-start rounded-lg border border-white/5
										bg-surface-100-900 px-2 py-1 hover:border-white/10 relative" onclick={() => goto(key + '/' + item.uuid)}>
	{#if appStore.dnd.isEnabled}
		<div class="absolute right-1 text-surface-500">
			<LbIcon name="grip-vertical"/>
		</div>
	{/if}
	<div class="w-full flex {isFavorite ? 'flex-col mt-1' : 'flex-row'}">
		<div class="flex justify-center">
			<div class="relative inline-flex items-center justify-center w-[54px] h-[54px] min-w-12 overflow-hidden 
								rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
				<LbIcon class={color} name={item.image} width="32" height="32"/>
			</div>
		</div>
		<div class="mt-0 {isFavorite ? 'ml-1' : 'ml-3'} flex justify-center items-center">
			<p class="truncate text-lg">{item.name}</p>
		</div>
	</div>
</div>
