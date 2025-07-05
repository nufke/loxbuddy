<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { getComponent } from '$lib/helpers/components';
	import type { ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';

	let tabGroup = $state('1');

	let filteredControls = $derived(
		store.controlList.filter((control) => control.isFavorite === true)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let room = store.roomList.find( (room) => room.name == $_('General'));

	let centralControls = $derived(
		store.controlList.filter((control) => (control.room === room?.uuid && control.defaultRating > 0) )
			.sort((a, b) => a.name.localeCompare(b.name)));

	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
</script>

<div class="container mx-auto max-w-[1280px] p-3">
	<Tabs value={tabGroup} listBorder='' onValueChange={(e) => (tabGroup = e.value)} >
		{#snippet list()}
			<Tabs.Control value="1" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{$_('Favorites')}</Tabs.Control>
			<Tabs.Control value="2" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{$_('General')}</Tabs.Control>
  	{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				<div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each filteredControls as control}
						{@const Component = getComponent(control.type)}
						<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
					{/each}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="2">
				<div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each centralControls as control}
						{@const Component = getComponent(control.type)}
						<Component {control} controlOptions={{...controlOptions, isFavorite: true}}/>
					{/each}
				</div>
			</Tabs.Panel>
	  {/snippet}
	</Tabs>
</div>
