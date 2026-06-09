<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { GeneralView } from '$lib/types/models';
	import { _ } from 'svelte-i18n';
	import { fadeInOut } from '$lib/helpers/styles';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';

	const loc = ['en', 'de', 'nl'];
	const language: any = {
		en: 'English',
		de: 'German',
		nl: 'Dutch'
	};

	let theme = $state(localStorage.getItem('theme') || 'LoxBuddy');
	let mode = $state(localStorage.getItem('mode') || 'dark');
	let localeSettings = $derived(appStore.locale);
	let lang = $derived(language[localeSettings]);
	let openThemeDialog = $state(false);

	let languageSelectView: GeneralView = $state({
		label: $_('Select language'),
		openDialog: false,
		buttons: [],
		cancel: () => {},
		ok: (e: number) => {appStore.setLocale(loc[e])}
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

	/**
	 * Helper function to toggle Dark/light mode
	 * @param event: switch event state
	*/
	function onDarkModeChange(event: { checked: boolean }): void {
		mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		appStore.mode = mode;
		localStorage.setItem('mode', mode);
	};

	/**
	 * Helper function to select new theme
	 * @param selectedTheme new theme as string
	*/
	function onChangeTheme(selectedTheme: string): void {
		theme = selectedTheme || 'LoxBuddy';
		document.documentElement.setAttribute('data-theme', theme.toLowerCase());
		localStorage.setItem('theme', theme);
		appStore.theme = theme;
		openThemeDialog = false;
	};

	/**
	 * Open language selection dialog
	 */
	function openLanguageSelectView(): void {
		languageSelectView.buttons = languageSelectViewButtons;
		languageSelectView.openDialog = true;
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Theme and language")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => {openThemeDialog = true;}}>
		<p>{$_("Theme")}</p>
		<p>{theme}</p>
	</button>
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
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={openLanguageSelectView}>
		<p>{$_("Language")}</p>
		<p>{$_(lang)}</p>
	</button>
</div>

<Dialog
	open={openThemeDialog}
	onInteractOutside={() => openThemeDialog=false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								max-w-full max-h-full w-full max-w-[450px] {fadeInOut}">
				<header class="grid grid-cols-[5%_90%_5%]">
					<div></div>
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">Theme selector</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={() => openThemeDialog=false}>
							<LbIcon name="x" height="16" width="16"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
					<div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto h-[500px]">
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

<LbGeneralDialog bind:view={languageSelectView}/>
