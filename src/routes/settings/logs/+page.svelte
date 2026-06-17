<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { goto } from "$app/navigation";
	import { page } from '$app/state';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';
	import type { GeneralView } from '$lib/types/models';

	const logLevelMap: Record<number, string> = {
		0: 'None',
		1: 'Errors',
		2: 'Warnings',
		3: 'Info',
		4: 'Debug'
	};

	let logLevel = $derived(appStore.logLevel);
	let LogLevelText = $derived(logLevelMap[logLevel] ?? 'Info');

	let logLevelView: GeneralView = $state({
		label: $_('Log level'),
		openDialog: false,
		buttons: [],
		cancel: () => {},
		ok: (level: number) => {
			appStore.setLogLevel(level);
		}
	});

	let logLevelViewButtons = $derived(
		Object.entries(logLevelMap).map(([id, name]) => ({
			id: Number(id),
			name,
			selected: logLevel == Number(id)
		}))
	);

	/**
	 * Open dialog to specify user defined sorting option
	*/
	function openLogLevelDialog(): void {
		logLevelView.buttons = logLevelViewButtons;
		logLevelView.openDialog = true;
	}
</script>

<div class="container pt-3 flex flex-col max-w-[640px] w-screen mx-auto">
	<div>
		<p class="pl-5 h5">{$_("Logs")}</p>
	</div>
	<button aria-current="true" type="button" class="flex w-full justify-between border-b dark:border-surface-900 border-surface-200 p-3 pr-5 pl-5 text-left text-lg"
					onclick={openLogLevelDialog}>
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

<LbGeneralDialog bind:view={logLevelView}/>