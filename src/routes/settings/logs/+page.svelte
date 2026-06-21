<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { page } from '$app/state';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';

	const logLevelOptions = [
		{ level: 0, name: 'None' },
		{ level: 1, name: 'Errors' },
		{ level: 2, name: 'Warnings' },
		{ level: 3, name: 'Info' },
		{ level: 4, name: 'Debug' },
	];

	let logLevel = $derived(appStore.logLevel);
	let LogLevelText = $derived(logLevelOptions.find(o => o.level === logLevel)?.name ?? 'Info');
	let logLevelOpen = $state(false);
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Logs")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={() => logLevelOpen = true}>
		<p>{$_("Log level")}</p>
		<p>{$_(LogLevelText)}</p>
	</button>
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

<LbDialog open={logLevelOpen} onClose={() => logLevelOpen = false}
	title={$_('Log level')} zIndex="z-40">
	{#snippet description()}
		<div class="w-full mt-3 mb-2 grid gap-2">
			{#each logLevelOptions as option}
				<button type="button"
						class="w-full h-[48px] btn btn-lg {logLevel === option.level ? 'bg-surface-200-800' : 'bg-surface-50-950'} shadow-sm rounded-lg border border-white/15 hover:border-white/50"
						onclick={() => { appStore.setLogLevel(option.level); logLevelOpen = false; }}>
					<span class="text-lg">{$_(option.name)}</span>
				</button>
			{/each}
		</div>
	{/snippet}
</LbDialog>