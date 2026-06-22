<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { page } from '$app/state';

	const path = page.url.pathname;

	const items: { label: string; route: string }[] = [
		{ label: 'Login and status', route: '/login' },
		{ label: 'Logs',             route: '/logs' },
		{ label: 'MQTT',             route: '/mqtt' },
		{ label: 'Startpage and sorting', route: '/sorting' },
		{ label: 'Theme and language',    route: '/theming' },
		{ label: 'VoIP',             route: '/voip' },
		{ label: 'Weather',          route: '/weather' },
	];
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Settings")}</p>
	</div>
	{#each items as item}
		<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
				onclick={() => goto(path + item.route)}>
			<p>{$_(item.label)}</p>
			<LbIcon name="mage:chevron-right"></LbIcon>
		</button>
	{/each}
</div>
