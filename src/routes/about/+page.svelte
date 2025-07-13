<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
  import { ArrowLeft, TriangleAlert } from '@lucide/svelte';

	let version = '0.0.1'; // TODO get version from package
	store.setNav({ label: 'ArrowLeft', href: '/', icon: ArrowLeft });
</script>

<div class="container mx-auto max-w-[1280px] p-3 lb-page-center">
	<div class="flex flex-col justify-center text-center items-center m-auto">
		<p class="m-5 h4">{$_("About")}</p>
		<img src="/icons/svg/loxbuddy.svg" width="150" alt="about"/>
		<p class="mt-2 h3 text-primary-500">LoxBuddy</p>
		<p class="text-sm ">{$_("Version").toLocaleLowerCase()} {version}</p>
		<p class="mt-2 text-sm">{$_("Licenced under")} MIT</p>
		<p class="mt-2 text-md font-medium">{$_("The Smarter Home App")}</p>
		<a class="mt-2 text-md text-primary-500" href="https://github.com/nufke/loxbuddy" target="_blank">{$_("Visit")} GitHub</a>
		<span class="mt-10 text-orange-500 "><TriangleAlert size="40"/></span>
		<p class="mt-2 text-md max-w-[600px] text-orange-500 font-medium">{$_("Warning_message")}</p>
	</div>
</div>
