<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { page } from '$app/state';
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Logs")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(page.url + '/applog')}>
		<p>{$_("App log")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
			onclick={() => goto(page.url + '/mslog')}>
		<p>{$_("Miniserver log")}</p>
		<LbIcon name="mage:chevron-right"></LbIcon>
	</button>
</div>
