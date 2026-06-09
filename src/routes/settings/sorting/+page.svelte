<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Room, Category, GeneralView } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { fadeInOut } from '$lib/helpers/styles';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';

	const sortMap: any = {
		0: 'Sorting using LoxConfig',
		1: 'User-defined sorting',
		2: 'App-specific sorting'
	};

	const other = [
		{ name: 'Home', uuid: '/'}
	];

	let openStartpageDialog = $state(false);
	let startPage = $state(localStorage.getItem('startPage') || '/');
	let sortingMode = $state(Number(localStorage.getItem('sortingMode')) || 0);
 	let group = $state('room');
	let sortingButtonDisabled = $derived(Number(sortingMode) == 0);
	let sortingText = $derived(sortMap[sortingMode]);

	let sortingSelectView: GeneralView = $state({
		label: $_('Sorting order'),
		openDialog: false,
		buttons: [],
		cancel: () => {},
		ok: (sortMode: number) => {
			sortingMode = sortMode;
			controlStore.setSortingMode(sortMode);
			controlStore.getUserSettings();
			if (sortMode == 0) { /* when config selected, disable sorting */
				onSortingEnabled({ checked: false });
			}
		}
	});

	let sortingSelectViewButtons = $derived([
		{
			id: 0,
			name: sortMap['0'],
			selected: sortingMode == 0
		},
		{
			id: 1,
			name: sortMap['1'],
			selected: sortingMode == 1
		},
		{
			id: 2,
			name: sortMap['2'],
			selected: sortingMode == 2
		}
	]);

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
	function openUserDefinedSorting(): void {
		sortingSelectView.buttons = sortingSelectViewButtons;
		sortingSelectView.openDialog = true;
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

<Dialog
	open={openStartpageDialog}
	onInteractOutside={() => openStartpageDialog=false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/1 w-full w-[450px] {fadeInOut}">
				<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">{$_("Startpage")}</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => openStartpageDialog=false}>
							<LbIcon name="x" height="16" width="16"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="mt-2">
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
										<button type="button" class="w-full mt-2 btn btn-lg {(room.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
													shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { onChangeStartpage(group, room.uuid)}}>
											<p class="text-lg">{room.name}</p>
										</button>
									{/each}
								</div>
							</Tabs.Content>
							<Tabs.Content value="category">
								<div class="overflow-y-auto">
									{#each categories as category}
										<button type="button" class="w-full mt-2 btn btn-lg {(category.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
													shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { onChangeStartpage(group, category.uuid)}}>
											<p class="text-lg">{category.name}</p>
										</button>
									{/each}
								</div>
							</Tabs.Content>
							<Tabs.Content value="other">
								<div class="overflow-y-auto">
									{#each other as item}
										<button type="button" class="w-full mt-2 btn btn-lg {(item.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
													shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={(e) => { onChangeStartpage('', item.uuid)}}>
											<p class="text-lg">{item.name}</p>
										</button>
									{/each}
								</div>
							</Tabs.Content>
						</Tabs>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>

<LbGeneralDialog bind:view={sortingSelectView}/>