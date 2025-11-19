<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Room, Category, GeneralView } from '$lib/types/models';
	import { _, locale } from 'svelte-i18n';
	import { store } from '$lib/stores/Store.svelte';
	import { ArrowLeftIcon, XIcon } from '@lucide/svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';

	let openThemeDialog = $state(false);
	let openStartpageDialog = $state(false);
	let showStatus = $state(localStorage.getItem('showStatus') || '0');
	let theme = $state(localStorage.getItem('theme') || 'LoxBuddy');
	let mode = $state(localStorage.getItem('mode') || 'dark');
	let startPage = $state(localStorage.getItem('startPage') || '/');
 	let group = $state('room');
	let localeSettings = $derived(store.locale);

	const loc = ['en', 'de', 'nl'];
	const language: any = {
		en: 'English',
		de: 'German',
		nl: 'Dutch'
	};

	let lang = $derived(language[localeSettings]);

	store.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeftIcon });

	let other = [
		{ name: 'Home', uuid: '/'}
	];

	async function setLocale(s: number) {
		store.locale = loc[s];
		localStorage.setItem('locale', store.locale);
		locale.set(store.locale); // reset svelte-i18n
		console.info('Set locale to', store.locale);
	}

	let languageSelectView: GeneralView = $state({
		label: $_('Select language'),
		openDialog: false,
		buttons: [],
		cancel: () => {},
		ok: (e: any) => {setLocale(e)}
	});

	let languageSelectViewButtons = $derived([
		{
			id: 0,
			name: language['en'],
			selected: language[localeSettings] == language.en
		},
		{
			id: 1,
			name: language['de'],
			selected: language[localeSettings] == language.de
		},
		{
			id: 2,
			name: language['nl'],
			selected: language[localeSettings] == language.nl
		}
	]);

	let rooms: Room[] = $derived(
		store.roomList.filter((item) => store.controlList.map((control) => control.room)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, store.locale)));

	let categories: Category[] = $derived(
		store.categoryList.filter((item) => store.controlList.map((control) => control.cat)
			.indexOf(item.uuid) > -1)
			.sort((a, b) => a.name.localeCompare(b.name, store.locale)));

	const onDarkModeChange = (event: { checked: boolean }) => {
		mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
	};

	function onChangeTheme(s: string) {
		theme = s || 'LoxBuddy';
		document.documentElement.setAttribute('data-theme', theme.toLowerCase());
		localStorage.setItem('theme', theme);
		openThemeDialog = false;
	};

	function openLanguageSelectView() {
		languageSelectView.buttons = languageSelectViewButtons;
		languageSelectView.openDialog = true;
	}

	function getStartpageName(startpageUrl: string) {
		if (startPage == '/' || startPage.length < 3) return 'Home';
		let p = startpageUrl.split('/');
		let room: any = rooms.find( room => room.uuid == p[2]);
		if (room && room.name) return room.name;
		let category: any = categories.find( cat => cat.uuid == p[2]);
		if (category && category.name) return category.name;
		return 'Home'; // fallback
	}

	function onChangeStartpage(cat: string, uuid: string) {
		startPage = cat.length ? ('/' + cat + '/' + uuid) : uuid;
		localStorage.setItem('startPage', startPage);
		store.startPage = startPage;
		openStartpageDialog = false;
	}

	const onShowStatusChange = (event: { checked: boolean }) => {
		showStatus = event.checked ? '1' : '0';
		localStorage.setItem('showStatus', showStatus);
		store.showStatus = event.checked;
	};
</script>

<div class="sticky container flex max-w-[1280px] flex-col">
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Dark mode")}</p>
			<Switch checked={mode == "dark"} onCheckedChange={onDarkModeChange}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Show connection status")}</p>
			<Switch checked={showStatus == "1"} onCheckedChange={onShowStatusChange}>
				<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
					<Switch.Thumb />
				</Switch.Control>
				<Switch.HiddenInput />
			</Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openThemeDialog = true;}}>
		<p>{$_("Theme")}</p>
		<p>{theme}</p>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={openLanguageSelectView}>
		<p>{$_("Language")}</p>
		<p>{$_(lang)}</p>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openStartpageDialog = true;}}>
		<p>{$_("Startpage")}</p>
		<p>{getStartpageName(startPage)}</p>
	</button>
		<a aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg" 
						href="/about">
		<p>{$_("About")}</p>
		</a>
</div>

<Dialog
	open={openThemeDialog}
	onInteractOutside={() => openThemeDialog=false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]">
				<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">Theme selector</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => openThemeDialog=false}>
							<XIcon class="size-4"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="mt-2 grid md:grid-cols-1 lg:grid-cols-2 gap-2 overflow-y-auto h-[500px]">
						<button data-theme="catppuccin" onclick={() => {onChangeTheme("Catppuccin")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🐈</span>
							<h3 class="text-left text-md font-medium capitalize">catppuccin</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="cerberus" onclick={() => {onChangeTheme("Cerberus")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🐺</span>
							<h3 class="text-left text-md font-medium capitalize">cerberus</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="concord" onclick={() => {onChangeTheme("Concord")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🤖</span>
							<h3 class="text-left text-md font-medium capitalize">concord</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="crimson" onclick={() => {onChangeTheme("Crimson")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🔴</span>
							<h3 class="text-left text-md font-medium capitalize">crimson</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="fennec" onclick={() => {onChangeTheme("Fennec")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
										grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🦊</span>
							<h3 class="text-left text-md font-medium capitalize">fennec</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="hamlindigo" onclick={() => {onChangeTheme("Hamlindigo")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>👔</span>
							<h3 class="text-left text-md font-medium capitalize">hamlindigo</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button	data-theme="legacy" onclick={() => {onChangeTheme("Legacy")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>💀</span>
							<h3 class="text-left text-md font-medium capitalize">legacy</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="loxbuddy" onclick={() => {onChangeTheme("LoxBuddy")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🏠</span>
							<h3 class="text-left text-md font-medium capitalize">LoxBuddy</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="mint" onclick={() => {onChangeTheme("Mint")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🍃</span>
							<h3 class="text-left text-md font-medium capitalize">mint</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="modern" onclick={() => {onChangeTheme("Modern")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🌸</span>
							<h3 class="text-left text-md font-medium capitalize">modern</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="mona" onclick={() => {onChangeTheme("Mona")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🐙</span>
							<h3 class="text-left text-md font-medium capitalize">mona</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="nosh" onclick={() => {onChangeTheme("Nosh")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
							grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
							><span>🥙</span>
							<h3 class="text-left text-md font-medium capitalize">nosh</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div></button
						><button
							data-theme="nouveau" onclick={() => {onChangeTheme("Nouveau")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
							><span>👑</span>
							<h3 class="text-left text-md font-medium capitalize">nouveau</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button
							data-theme="pine" onclick={() => {onChangeTheme("Pine")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🌲</span>
							<h3 class="text-left text-md font-medium capitalize">pine</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="reign" onclick={() => {onChangeTheme("Reign")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>📒</span>
							<h3 class="text-left text-md font-medium capitalize">reign</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="rocket" onclick={() => {onChangeTheme("Rocket")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🚀</span>
							<h3 class="text-left text-md font-medium capitalize">rocket</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="rose" onclick={() => {onChangeTheme("Rose")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🌷</span>
							<h3 class="text-left text-md font-medium capitalize">rose</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button
							data-theme="sahara" onclick={() => {onChangeTheme("Sahara")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
							><span>🏜️</span>
							<h3 class="text-left text-md font-medium capitalize">sahara</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button
							data-theme="seafoam" onclick={() => {onChangeTheme("Seafoam")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🧜‍♀️</span>
							<h3 class="text-left text-md font-medium capitalize">seafoam</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div></button>
						<button data-theme="terminus" onclick={() => {onChangeTheme("Terminus")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🌑</span>
							<h3 class="text-left text-md font-medium capitalize">terminus</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="vintage" onclick={() => {onChangeTheme("Vintage")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>📺</span>
							<h3 class="text-left text-md font-medium capitalize">vintage</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button
							data-theme="vox" onclick={() => {onChangeTheme("Vox")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>👾</span>
							<h3 class="text-left text-md font-medium capitalize">vox</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						<button data-theme="wintry" onclick={() => {onChangeTheme("Wintry")}}
							class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
								grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
							<span>🌨️</span>
							<h3 class="text-left text-md font-medium capitalize">wintry</h3>
							<div class="flex items-center justify-center -space-x-1.5">
								<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
								<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
							</div>
						</button>
						</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>

<Dialog
	open={openStartpageDialog}
	onInteractOutside={() => openStartpageDialog=false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[450px]">
				<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">{$_("Startpage")}</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => openStartpageDialog=false}>
							<XIcon class="size-4"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="mt-2">
						<Tabs value={group} onValueChange={(e) => (group = e.value)}>
							<Tabs.List class="border-b-[2px] border-transparent">
								<Tabs.Trigger value="room" class="flex-1 text-lg">{$_("Rooms")}</Tabs.Trigger>
								<Tabs.Trigger value="category" class="flex-1 text-lg">{$_("Categories")}</Tabs.Trigger>
								<Tabs.Trigger value="other" class="flex-1 text-lg">{$_("Other")}</Tabs.Trigger>
								<Tabs.Indicator/>
							</Tabs.List>
							<Tabs.Content value="room">
								<div class="h-[580px] overflow-y-auto">
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
								<div class="h-[580px] overflow-y-auto">
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
								<div class="h-[580px] overflow-y-auto">
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

<LbGeneralDialog bind:view={languageSelectView}/>