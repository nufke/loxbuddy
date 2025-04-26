<script lang="ts">
	import '../app.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
  import { Home, List, Music, Grid2x2, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { setMenuItem } from '$lib/stores/menu';
	
	import { page } from '$app/state';

	let { children } = $props();
	let selectedMenu:string = $state('Home');

	const routes: Route[] = [
		{ label: 'Home', action: () => {selectedMenu = setMenuItem('Home')}, icon: Home },
		{ label: 'Rooms', action: () => {selectedMenu = setMenuItem('Rooms')}, icon: Grid2x2 },
		{ label: 'Categories', action: () => {selectedMenu = setMenuItem('Categories')}, icon: List },
		{ label: 'Music', action: () => {selectedMenu = setMenuItem('Music')}, icon: Music },
	];
</script>

<!-- we need to use the innerWidth to avoid we render the children twice -->
{#if (innerWidth.current != undefined) && innerWidth.current > 768 }
<div class="hidden md:grid grid-cols-[auto_1fr]">
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail>
		{#snippet tiles()}
		{#each routes as {label, action, icon}}
		  {@const Icon = icon}
			<Navigation.Tile active="preset-tonal" {label} onclick={action} selected={label==selectedMenu}>
			  <Icon />
			</Navigation.Tile>
		{/each}
		{/snippet}
	</Navigation.Rail>
</aside>
  <main class="">
		{@render children()}
  </main>
</div>
{:else}
<div class="md:hidden grid grid-rows-[auto_1fr_auto]">
	<main class="h-screen">
		{@render children()}
	</main>
	<footer class="sticky bottom-0">
		<Navigation.Bar>
			{#each routes as {label, action, icon}}
				{@const Icon = icon}
				<Navigation.Tile {label} onclick={action} selected={label==selectedMenu}>
					<Icon />
				</Navigation.Tile>
			{/each}
		</Navigation.Bar>
	</footer>
</div>
{/if}
