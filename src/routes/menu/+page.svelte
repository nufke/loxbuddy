<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
  import { ArrowLeft } from '@lucide/svelte';

	let checked = $state(true); // true = default dark mode
  let openState = $state(false);
	let theme = $state(localStorage.getItem('theme') || 'Cerebus');
	let mode = $state(localStorage.getItem('mode') || 'light');

	store.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeft });

	$effect(() => {
		mode = localStorage.getItem('mode') || 'light';
		checked = mode === 'dark';
	});

	const onCheckedChange = (event: { checked: boolean }) => {
		const mode = event.checked ? 'dark' : 'light';
		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
		checked = event.checked;
	};

	function onChangeTheme(s: string) {
		theme = s || 'Cerebus';
		document.documentElement.setAttribute('data-theme', theme.toLowerCase());
		localStorage.setItem('theme', theme);
		openState = false;
	};
</script>

<div class="sticky container flex max-w-[1280px] flex-col">
	<button aria-current="true" type="button" class="w-full border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg">
		<div class="flex w-full justify-between">
			<p>{$_("Dark mode")}</p>
			<Switch controlClasses="w-12 h-8" {checked} {onCheckedChange}></Switch>
		</div>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg" onclick={() => {openState = true;}}>
		<p>{$_("Selected theme")}</p>
		<p>{theme}</p>
	</button>
</div>

<Modal
	open={openState}
	onOpenChange={(e) => (openState = e.open)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm max-w-9/10 max-h-9/10 overflow-auto md:w-[380px] lg:w-[680px]"
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
