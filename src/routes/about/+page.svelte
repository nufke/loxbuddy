<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
  import { ArrowLeft, TriangleAlert } from '@lucide/svelte';

	let version = '0.0.1'; // TODO get version from package
	store.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeft });
</script>

<div class="container mx-auto max-w-[1280px] p-2">
	<div class="flex flex-col justify-center text-center items-center m-auto">
		<p class="m-5 h4">{$_("About")}</p>
		<img src="/icons/svg/loxbuddy.svg" width="150" alt="about"/>
		<p class="mt-2 h3 dark:text-primary-500 text-primary-700">LoxBuddy</p>
		<p class="text-sm dark:text-surface-300 text-surface-700">{$_("Version").toLocaleLowerCase()} {version}</p>
		<p class="mt-2 text-lg font-medium">{$_("The Smarter Home App")}</p>
		<a class="mt-2 text-md text-primary-500" href="https://github.com/nufke/loxbuddy" target="_blank">{$_("Visit")} GitHub</a>
		<p class="mt-2 text-sm dark:text-surface-300 text-surface-700 mt-10 mb-5">Interested in supporting the development of this App?</p> 
		<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
		<span class="mt-20 text-orange-500 "><TriangleAlert size="40"/></span>
		<p class="mt-2 text-md max-w-[600px] text-orange-500 font-medium">{$_("Warning_message")}</p>
	</div>
</div>
