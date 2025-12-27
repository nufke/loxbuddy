<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { ArrowLeftIcon, TriangleAlertIcon } from '@lucide/svelte';

	let version = __VERSION__;
	appStore.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeftIcon });
</script>

<div class="container flex justify-center items-center h-full mx-auto max-w-[1280px] p-2">
	<div class="flex flex-col justify-center align-center text-center items-center m-auto">
		<img src="/icons/svg/loxbuddy.svg" width="100" alt="about"/>
		<p class="text-base mt-2 h3 dark:text-primary-500 text-primary-700">LOXBUDDY</p>
		<p class="text-sm dark:text-surface-300 text-surface-700">{$_("Version").toLocaleLowerCase()} {version}</p>
		<p class="mt-2 text-lg font-medium">{$_("The Smarter Home App")}</p>
		<a class="mt-2 text-md text-primary-500" href="https://github.com/nufke/loxbuddy" target="_blank">{$_("Visit")} GitHub</a>
		<p class="mt-2 text-xs dark:text-surface-300 text-surface-700 mt-10 mb-5">Interested in supporting the development of this App?</p> 
		<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
		<span class="mt-10 text-orange-500 "><TriangleAlertIcon size="40"/></span>
		<p class="mt-2 text-md max-w-[600px] text-orange-500 font-medium">{$_("Warning_message")}</p>
		<p class="mt-4 text-xs dark:text-surface-300 text-surface-700">App ID: {appStore.appId}</p>
	</div>
</div>
