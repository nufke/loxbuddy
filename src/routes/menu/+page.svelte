<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
  import { Modal } from '@skeletonlabs/skeleton-svelte';
	import type { Room, Category, Button, GeneralView } from '$lib/types/models';
	import { _, locale } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
  import { ArrowLeft, X } from '@lucide/svelte';
	import LbGeneralModal from '$lib/components/lb-general-modal.svelte';

  let openThemeModal = $state(false);
	let openStartpageModal = $state(false);
	let showStatus = $state(localStorage.getItem('showStatus') || '1');
	let theme = $state(localStorage.getItem('theme') || 'LoxBuddy');
	let mode = $state(localStorage.getItem('mode') || 'dark');
	let startPage = $state(localStorage.getItem('startPage') || '/');
 	let group = $state('room');
	let localeSettings = $derived(store.locale);

	const loc = ['nl', 'en', 'de'];
	const language: any = {
		nl: 'Dutch',
		en: 'English',
		de: 'German'
	};

	let lang = $derived(language[localeSettings]);

	store.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeft });

	let other = [
		{ name: 'Home', uuid: '/'}
	];

	async function setLocale(s: number) {
		store.locale = loc[s];
		localStorage.setItem('locale', store.locale);
		locale.set(store.locale); // reset svelte-i18n
		console.log('Set locale to', store.locale);
	}

	let languageSelectView: GeneralView = $state({
		title: $_('Select language'),
		openModal: false,
		buttons: [],
		cancel: () => {},
		ok: (e: any) => {setLocale(e)}
	});

	let languageSelectViewButtons = $derived([
		{
			id: 0,
			name: language['nl'],
			selected: language[localeSettings] == language.nl
		},
		{
			id: 1,
			name: language['en'],
			selected: language[localeSettings] == language.en
		},
		{
			id: 2,
			name: language['de'],
			selected: language[localeSettings] == language.de
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
		openThemeModal = false;
	};

	function openLanguageSelectView() {
		languageSelectView.buttons = languageSelectViewButtons;
		languageSelectView.openModal = true;
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
		openStartpageModal = false;
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
			<Switch controlClasses="w-12 h-8" checked={mode == "dark"} thumbInactive="bg-white" controlInactive="preset-filled-surface-300-700" onCheckedChange={onDarkModeChange}></Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Show connection status")}</p>
			<Switch controlClasses="w-12 h-8" checked={showStatus == "1"} thumbInactive="bg-white" controlInactive="preset-filled-surface-300-700" onCheckedChange={onShowStatusChange}></Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openThemeModal = true;}}>
		<p>{$_("Theme")}</p>
		<p>{theme}</p>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={openLanguageSelectView}>
		<p>{$_("Language")}</p>
		<p>{$_(lang)}</p>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openStartpageModal = true;}}>
		<p>{$_("Startpage")}</p>
		<p>{getStartpageName(startPage)}</p>
	</button>
		<a aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg" 
						href="/about">
		<p>{$_("About")}</p>
		</a>
</div>

<Modal
	open={openThemeModal}
	onOpenChange={(e) => (openThemeModal = e.open)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm md:max-w-9/10 md:max-h-9/10 overflow-auto md:w-[380px] lg:w-[680px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
<div class="grid md:grid-cols-1 lg:grid-cols-2 gap-2">
	<button
		data-theme="catppuccin" onclick={() => {onChangeTheme("Catppuccin")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🐈</span>
		<h3 class="text-left text-md font-medium capitalize">catppuccin</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="cerberus" onclick={() => {onChangeTheme("Cerberus")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 preset-outlined-surface-500 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🐺</span>
		<h3 class="text-left text-md font-medium capitalize">cerberus</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="concord" onclick={() => {onChangeTheme("Concord")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🤖</span>
		<h3 class="text-left text-md font-medium capitalize">concord</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="crimson" onclick={() => {onChangeTheme("Crimson")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🔴</span>
		<h3 class="text-left text-md font-medium capitalize">crimson</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="fennec" onclick={() => {onChangeTheme("Fennec")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🦊</span>
		<h3 class="text-left text-md font-medium capitalize">fennec</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="hamlindigo" onclick={() => {onChangeTheme("Hamlindigo")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>👔</span>
		<h3 class="text-left text-md font-medium capitalize">hamlindigo</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="legacy" onclick={() => {onChangeTheme("Legacy")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>💀</span>
		<h3 class="text-left text-md font-medium capitalize">legacy</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	>	<button
		data-theme="loxbuddy" onclick={() => {onChangeTheme("LoxBuddy")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🏠</span>
		<h3 class="text-left text-md font-medium capitalize">LoxBuddy</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="mint" onclick={() => {onChangeTheme("Mint")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🍃</span>
		<h3 class="text-left text-md font-medium capitalize">mint</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="modern" onclick={() => {onChangeTheme("Modern")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🌸</span>
		<h3 class="text-left text-md font-medium capitalize">modern</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="mona" onclick={() => {onChangeTheme("Mona")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🐙</span>
		<h3 class="text-left text-md font-medium capitalize">mona</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="nosh" onclick={() => {onChangeTheme("Nosh")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🥙</span>
		<h3 class="text-left text-md font-medium capitalize">nosh</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="nouveau" onclick={() => {onChangeTheme("Nouveau")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>👑</span>
		<h3 class="text-left text-md font-medium capitalize">nouveau</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="pine" onclick={() => {onChangeTheme("Pine")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🌲</span>
		<h3 class="text-left text-md font-medium capitalize">pine</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="reign" onclick={() => {onChangeTheme("Reign")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>📒</span>
		<h3 class="text-left text-md font-medium capitalize">reign</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="rocket" onclick={() => {onChangeTheme("Rocket")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🚀</span>
		<h3 class="text-left text-md font-medium capitalize">rocket</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="rose" onclick={() => {onChangeTheme("Rose")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🌷</span>
		<h3 class="text-left text-md font-medium capitalize">rose</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="sahara" onclick={() => {onChangeTheme("Sahara")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🏜️</span>
		<h3 class="text-left text-md font-medium capitalize">sahara</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="seafoam" onclick={() => {onChangeTheme("Seafoam")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🧜‍♀️</span>
		<h3 class="text-left text-md font-medium capitalize">seafoam</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="terminus" onclick={() => {onChangeTheme("Terminus")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🌑</span>
		<h3 class="text-left text-md font-medium capitalize">terminus</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="vintage" onclick={() => {onChangeTheme("Vintage")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>📺</span>
		<h3 class="text-left text-md font-medium capitalize">vintage</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="vox" onclick={() => {onChangeTheme("Vox")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>👾</span>
		<h3 class="text-left text-md font-medium capitalize">vox</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	><button
		data-theme="wintry" onclick={() => {onChangeTheme("Wintry")}}
		class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3"
		><span>🌨️</span>
		<h3 class="text-left text-md font-medium capitalize">wintry</h3>
		<div class="flex items-center justify-center -space-x-1.5">
			<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
			<div
				class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
			<div
				class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"
			></div>
		</div></button
	>
	</div>
	{/snippet}
</Modal>

<Modal
	open={openStartpageModal}
	onOpenChange={(e) => (openStartpageModal = e.open)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm md:max-w-9/10 md:max-h-9/10 overflow-auto w-[450px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center mb-3">
			<h2 class="h4 text-center">{$_("Startpage")}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { openStartpageModal = false; }}>
				<X/>
			</button>
		</div>
	</header>
	<div class="">
		<Tabs value={group} onValueChange={(e) => (group = e.value)} fluid>
			{#snippet list()}
				<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="room">{$_("Rooms")}</Tabs.Control>
				<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="category">{$_("Categories")}</Tabs.Control>
				<Tabs.Control labelBase="text-lg" stateLabelActive="dark:text-primary-500 text-primary-700" value="other">{$_("Other")}</Tabs.Control>
			{/snippet}
			{#snippet content()}
			<Tabs.Panel value="room">
				<div class="h-[580px] overflow-y-auto">
					{#each rooms as room}
						<button type="button" class="w-full mt-2 btn btn-lg {(room.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
									 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { onChangeStartpage(group, room.uuid)}}>
							<p class="text-lg">{room.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="category">
				<div class="h-[580px] overflow-y-auto">
					{#each categories as category}
						<button type="button" class="w-full mt-2 btn btn-lg {(category.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
									 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { onChangeStartpage(group, category.uuid)}}>
							<p class="text-lg">{category.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Panel>
			<Tabs.Panel value="other">
				<div class="h-[580px] overflow-y-auto">
					{#each other as item}
						<button type="button" class="w-full mt-2 btn btn-lg {(item.name == getStartpageName(startPage)) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
									 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
							onclick={(e) => { onChangeStartpage('', item.uuid)}}>
							<p class="text-lg">{item.name}</p>
						</button>
					{/each}
				</div>
			</Tabs.Panel>
		{/snippet}
	</Tabs>
	</div>
	{/snippet}
</Modal>

<LbGeneralModal bind:view={languageSelectView}/>