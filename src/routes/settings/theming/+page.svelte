<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';

	const languageOptions = [
		{ name: 'English', locale: 'en' },
		{ name: 'German', locale: 'de' },
		{ name: 'Dutch', locale: 'nl' }
	];

	const themes = [
		{ key: 'catppuccin', name: 'Catppuccin', emoji: '🐈' },
		{ key: 'cerberus',   name: 'Cerberus',   emoji: '🐺' },
		{ key: 'concord',    name: 'Concord',    emoji: '🤖' },
		{ key: 'crimson',    name: 'Crimson',    emoji: '🔴' },
		{ key: 'fennec',     name: 'Fennec',     emoji: '🦊' },
		{ key: 'hamlindigo', name: 'Hamlindigo', emoji: '👔' },
		{ key: 'legacy',     name: 'Legacy',     emoji: '💀' },
		{ key: 'loxbuddy',   name: 'LoxBuddy',   emoji: '🏠' },
		{ key: 'mint',       name: 'Mint',       emoji: '🍃' },
		{ key: 'modern',     name: 'Modern',     emoji: '🌸' },
		{ key: 'mona',       name: 'Mona',       emoji: '🐙' },
		{ key: 'nosh',       name: 'Nosh',       emoji: '🥙' },
		{ key: 'nouveau',    name: 'Nouveau',    emoji: '👑' },
		{ key: 'pine',       name: 'Pine',       emoji: '🌲' },
		{ key: 'reign',      name: 'Reign',      emoji: '📒' },
		{ key: 'rocket',     name: 'Rocket',     emoji: '🚀' },
		{ key: 'rose',       name: 'Rose',       emoji: '🌷' },
		{ key: 'sahara',     name: 'Sahara',     emoji: '🏜️' },
		{ key: 'seafoam',    name: 'Seafoam',    emoji: '🧜‍♀️' },
		{ key: 'terminus',   name: 'Terminus',   emoji: '🌑' },
		{ key: 'vintage',    name: 'Vintage',    emoji: '📺' },
		{ key: 'vox',        name: 'Vox',        emoji: '👾' },
		{ key: 'wintry',     name: 'Wintry',     emoji: '🌨️' },
	];

	let theme = $state(localStorage.getItem('theme') || 'LoxBuddy');
	let mode = $state(localStorage.getItem('mode') || 'dark');
	let localeSettings = $derived(appStore.locale);
	let lang = $derived(languageOptions.find(b => b.locale === localeSettings)?.name ?? localeSettings);
	let openThemeDialog = $state(false);
	let languageSelectOpen = $state(false);

	/**
	 * Helper function to toggle Dark/light mode
	 * @param event switch event state
	 */
	function onDarkModeChange(event: { checked: boolean }): void {
		mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		appStore.mode = mode;
		localStorage.setItem('mode', mode);
	}

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
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Theme and language")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => openThemeDialog = true}>
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
			onclick={() => languageSelectOpen = true}>
		<p>{$_("Language")}</p>
		<p>{$_(lang)}</p>
	</button>
</div>

<LbDialog open={openThemeDialog} onClose={() => openThemeDialog = false} title={$_('Select theme')}>
	{#snippet description()}
		<div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto h-[500px]">
			{#each themes as t}
				<button data-theme={t.key} onclick={() => onChangeTheme(t.name)}
					class="bg-surface-50-950 preset-outlined-surface-100-900 hover:preset-outlined-surface-950-50 grid w-full
						grid-cols-[auto_1fr_auto] items-center gap-4 rounded-md p-3">
					<span>{t.emoji}</span>
					<h3 class="text-left text-md font-medium">{t.name}</h3>
					<div class="flex items-center justify-center -space-x-1.5">
						<div class="bg-primary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
						<div class="bg-secondary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
						<div class="bg-tertiary-500 aspect-square w-4 rounded-full border-[1px] border-black/10"></div>
					</div>
				</button>
			{/each}
		</div>
	{/snippet}
</LbDialog>

<LbDialog open={languageSelectOpen} onClose={() => languageSelectOpen = false}
	title={$_('Select language')} zIndex="z-40">
	{#snippet description()}
		<div class="w-full mt-3 mb-2 grid gap-2">
			{#each languageOptions as button}
				<button type="button"
						class="w-full h-[48px] btn btn-lg {button.locale === localeSettings ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={() => { appStore.setLocale(button.locale); languageSelectOpen = false; }}>
					<span class="text-lg">{button.name}</span>
				</button>
			{/each}
		</div>
	{/snippet}
</LbDialog>
