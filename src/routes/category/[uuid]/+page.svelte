<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { Control, Room, Category, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { getComponent } from '$lib/helpers/components';
	import { store } from '$lib/stores/store.svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let { data }: PageProps = $props();

	store.setNav({ label: 'ArrowLeft', href: '/room', icon: ArrowLeft }); // TODO change navigation concept

	let tabGroup = $state('1');

	let filteredControls: Control[] = $derived(
		store.controlList.filter((control) => control.cat === data.uuid)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let favorites: Control[] = $derived(
		filteredControls.filter((control) => control.defaultRating > 0));

	let labels: Room[] = $derived(
		store.roomList.filter((item) => filteredControls.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let pageTitle: Category | undefined =  $derived(
		store.categoryList.find((item) => filteredControls[0].cat == item.uuid)
	);

	let controlOptions: ControlOptions = $derived(DEFAULT_CONTROLOPTIONS);
</script>

<div class="container mx-auto max-w-[1280px] p-3 lb-page-center">
	<Tabs value={tabGroup} listBorder='' onValueChange={(e) => (tabGroup = e.value)} >
		{#snippet list()}
			<Tabs.Control value="1" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{pageTitle?.name}</Tabs.Control>
			<Tabs.Control value="2" labelBase="h4" base='border-b-[2px] border-transparent' padding='ml-2 pb-0'>{$_('All')}</Tabs.Control>
  	{/snippet}
		{#snippet content()}
			<Tabs.Panel value="1">
				<div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:flex-wrap">
					{#each favorites as control}
						{@const Component = getComponent(control.type)}
						<Component control={control} controlOptions={{...controlOptions, isFavorite: true}}/>
					{/each}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="2">
				<div class="space-y-2">
					{#each labels as label}
						<button class="h5 ml-2" onclick={() => {goto('/room/'+label.uuid)}}>{label.name}</button>
						<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:flex-wrap">
							{#each filteredControls.filter( item => item.room == label.uuid) as control}
								{@const Component = getComponent(control.type)}
								<Component control={control} {controlOptions}/>
							{/each}
					</div>
					{/each}
				</div>
			</Tabs.Panel>
	  {/snippet}
	</Tabs>
</div>
