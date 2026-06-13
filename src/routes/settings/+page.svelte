<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { page } from '$app/state';

	const path = page.url.pathname;
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Settings")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/login')}>
		<p>{$_("Login and status")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/logs')}>
		<p>{$_("Logs")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/mqtt')}>
		<p>{$_("MQTT")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/sorting')}>
		<p>{$_("Startpage and sorting")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/theming')}>
		<p>{$_("Theme and language")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/voip')}>
		<p>{$_("VoIP")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(path + '/weather')}>
		<p>{$_("Weather")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
</div>
