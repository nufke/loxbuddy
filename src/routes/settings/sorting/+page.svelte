<script lang="ts">
	import { Switch, Tabs } from '@skeletonlabs/skeleton-svelte';
	import type { Room, Category } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';

	const sortingOptions = [
		{ mode: 0, name: 'Sorting using LoxConfig' },
		{ mode: 1, name: 'User-defined sorting' },
		{ mode: 2, name: 'App-specific sorting' },
	];

	const other = [
		{ name: 'Home', uuid: '/'}
	];

	let openStartpageDialog = $state(false);
	let startPage = $state(localStorage.getItem('startPage') || '/');
	let sortingMode = $state(Number(localStorage.getItem('sortingMode')) || 0);
 	let group = $state('room');
	let sortingButtonDisabled = $derived(Number(sortingMode) == 0);
	let sortingText = $derived(sortingOptions.find(o => o.mode === sortingMode)?.name ?? '');

	let sortingSelectOpen = $state(false);

	let rooms: Room[] = $derived(
		controlStore.roomList.filter((item) => controlStore.controlList.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale)));

	let categories: Category[] = $derived(
		controlStore.categoryList.filter((item) => controlStore.controlList.map((control) => control.cat)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale)));

	/**
	 * Open dialog to specify user defined sorting option
	*/
	function handleSortingOk(sortMode: number): void {
		sortingMode = sortMode;
		controlStore.setSortingMode(sortMode);
		if (sortMode == 0) onSortingEnabled({ checked: false });
		void controlStore.getUserSettings();
	}

	function openUserDefinedSorting(): void {
		sortingSelectOpen = true;
	}

	/**
	 * Get the name of the start page
	 * @param startpageUrl Url of the start page
	 * @returns name of the start page
	 */
	function getStartpageName(startpageUrl: string): string {
		if (startPage == '/' || startPage.length < 3) return 'Home';
		let p = startpageUrl.split('/');
		let room: any = rooms.find((room) => room.uuid == p[2]);
		if (room && room.name) return room.name;
		let category: any = categories.find((cat) => cat.uuid == p[2]);
		if (category && category.name) return category.name;
		return 'Home'; // fallback
	}

	/**
	 * Update the start page, also store this in local Storage
	 * @param cat Category name
	 * @param uuid Unique identifier of the page
	*/
	function onChangeStartpage(cat: string, uuid: string): void {
		startPage = cat.length ? `/${cat}/${uuid}` : uuid;
		localStorage.setItem('startPage', startPage);
		appStore.startPage = startPage;
		openStartpageDialog = false;
	}

	/**
	 * Enable sorting
	 * @param event switch event state
	 */
	function onSortingEnabled(event: { checked: boolean }): void {
		controlStore.sorting = event.checked;
		localStorage.setItem('sorting', event.checked ? '1' : '0');
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Startpage and sorting")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openStartpageDialog = true;}}>
		<p>{$_("Startpage")}</p>
		<p>{getStartpageName(startPage)}</p>
	</button>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p class={sortingButtonDisabled ? 'dark:text-surface-600 text-surface-300' : 'text-surface-950-50'}>{$_("Sorting enabled")}</p>
			<Switch disabled={sortingButtonDisabled} checked={controlStore.sorting} onCheckedChange={onSortingEnabled}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={openUserDefinedSorting}>
		<p>{$_("Sorting option")}</p>
		<p>{$_(sortingText)}</p>
	</button>
</div>

<LbDialog open={openStartpageDialog} onClose={() => openStartpageDialog = false}
	title={$_('Startpage')} zIndex="z-40">
	{#snippet description()}
		<Tabs value={group} onValueChange={(e) => (group = e.value)}>
			<Tabs.List class="border-b-[2px] border-transparent">
				<Tabs.Trigger value="room" class="truncate flex-1 text-lg">{$_("Rooms")}</Tabs.Trigger>
				<Tabs.Trigger value="category" class="truncate flex-1 text-lg">{$_("Categories")}</Tabs.Trigger>
				<Tabs.Trigger value="other" class="truncate flex-1 text-lg">{$_("Other")}</Tabs.Trigger>
				<Tabs.Indicator/>
			</Tabs.List>
			<Tabs.Content value="room">
				<div class="overflow-y-auto">
					{#each rooms as room}
						<button type="button" class="w-full mt-2 btn btn-lg {room.name == getStartpageName(startPage) ? 'bg-surface-200-800' : 'bg-surface-50-950'}
									shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={() => onChangeStartpage(group, room.uuid)}>
							<p class="text-lg">{room.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="category">
				<div class="overflow-y-auto">
					{#each categories as category}
						<button type="button" class="w-full mt-2 btn btn-lg {category.name == getStartpageName(startPage) ? 'bg-surface-200-800' : 'bg-surface-50-950'}
									shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={() => onChangeStartpage(group, category.uuid)}>
							<p class="text-lg">{category.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Content>
			<Tabs.Content value="other">
				<div class="overflow-y-auto">
					{#each other as item}
						<button type="button" class="w-full mt-2 btn btn-lg {item.name == getStartpageName(startPage) ? 'bg-surface-200-800' : 'bg-surface-50-950'}
									shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={() => onChangeStartpage('', item.uuid)}>
							<p class="text-lg">{item.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Content>
		</Tabs>
	{/snippet}
</LbDialog>

<LbDialog open={sortingSelectOpen} onClose={() => sortingSelectOpen = false}
	title={$_('Sorting order')} zIndex="z-40">
	{#snippet description()}
		<div class="w-full mt-3 mb-2 grid gap-2">
			{#each sortingOptions as option}
				<button type="button"
						class="w-full h-[48px] btn btn-lg {sortingMode === option.mode ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={() => { handleSortingOk(option.mode); sortingSelectOpen = false; }}>
					<span class="text-lg">{$_(option.name)}</span>
				</button>
			{/each}
		</div>
	{/snippet}
</LbDialog>