<script lang="ts">
	import '../app.css';
	import '../global.css';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import { innerWidth } from 'svelte/reactivity/window';
  import { Home, List, FileText, Grid2x2, type Icon as IconType } from '@lucide/svelte';
	import type { Route } from '$lib/types/models';
	import { mqttConnect } from '$lib/helpers/mqttclient';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';

	/* start MQTT client */
	mqttConnect(page.data.mqtt);

	let { children } = $props();

	const routes: Route[] = [
		{ label: 'Home', href: '/', icon: Home },
		{ label: 'Rooms', href: '/room', icon: Grid2x2 },
		{ label: 'Categories', href: '/category', icon: List },
		{ label: 'Messages', href: '/messages', icon: FileText },
	];

	function checkUrl(href: string) {
		if (href === '/') {
			return page.url.pathname === href;
		}
		return page.url.pathname.includes(href);
	}
</script>

<!-- we need to use the innerWidth to avoid we render the children twice -->
{#if (innerWidth.current != undefined) && innerWidth.current > 768 }
<div class="hidden md:grid grid-cols-[auto_1fr]">
	<aside class="sticky top-0 col-span-1 h-screen">
	<Navigation.Rail>
		{#snippet tiles()}
		{#each routes as {label, href, icon}}
		  {@const Icon = icon}
			<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'white'} classes="flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
				<Icon class={checkUrl(href) ? 'text-green-500' : 'white'} />
			</Navigation.Tile>
		{/each}
		{/snippet}
	</Navigation.Rail>
</aside>
  <main>
		{@render children()}
  </main>
</div>
{:else}
<div class="md:hidden grid grid-rows-[auto_1fr_auto]">
	<main class="main">
		{@render children()}
	</main>
	<footer class="sticky bottom-0">
		<Navigation.Bar>
			{#each routes as {label, href, icon}}
				{@const Icon = icon}
				<Navigation.Tile labelClasses={checkUrl(href) ? 'text-green-500' : 'white'} classes="flex-col justify-center hover:bg-transparent" label={$_(label)} {href}>
					<Icon class={checkUrl(href) ? 'text-green-500' : 'white'} />
				</Navigation.Tile>
			{/each}
		</Navigation.Bar>
	</footer>
</div>
{/if}

<style>
.main {
	min-height: calc(100vh - 80px); /* trick to keep sticky footer at bottom */
}
</style>
