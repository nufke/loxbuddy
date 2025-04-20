<script lang="ts">
	import '../app.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { Home, List, Music, Grid2x2, type Icon as IconType } from '@lucide/svelte';

	import { page } from '$app/state';

	let { children } = $props();

	type Route = {
    label: string;
    href: string;
    icon: typeof IconType;
  };

  const routes: Route[] = [
    { label: 'Home', href: '/home', icon: Home },
    { label: 'Rooms', href: '/rooms', icon: Grid2x2 },
    { label: 'Categories', href: '/cats', icon: List },
    { label: 'Music', href: '/music', icon: Music },
  ];
</script>

<div class="hidden md:grid grid-cols-[auto_1fr]">
  <!-- Sidebar -->
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail>
		{#snippet tiles()}
		{#each routes as {label, href, icon}}
		  {@const Icon = icon}
			<Navigation.Tile {label} {href} selected={page.url.pathname  === href}>
			  <Icon />
			</Navigation.Tile>
		{/each}
		{/snippet}
	</Navigation.Rail>
</aside>
  <main>
		{@render children()}
  </main>
</div>

<div class="md:hidden grid h-screen grid-rows-[auto_1fr_auto]">
	<main>
		{@render children()}
	</main>
	<footer class="sticky bottom-0">
		<Navigation.Bar>
			{#each routes as {label, href, icon}}
				{@const Icon = icon}
				<Navigation.Tile {label} {href} selected={page.url.pathname  === href}>
					<Icon />
				</Navigation.Tile>
			{/each}
		</Navigation.Bar>
	</footer>
</div>
