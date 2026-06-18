<script lang="ts">
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';

	let log: string[] = [];

	let errorMsg = 'Unable to retrieve log from Miniserver.';

	function getLog() {
		console.info('[Settings/logs] Retrieving Miniserver log...');
		controlStore.fetchUrl(controlStore.msInfo.serialNr, `dev/fsget/log/def.log`)
		.then((response) => {
			if (response.ok) {
				return response.text();
			} else {
				console.error('[Settings/logs] ' + errorMsg);
				return $_(errorMsg);
			}
		})
		.then((data) => {
			log = data.split('\n');
		});
	}

	getLog();
</script>

<div class="container p-3">
  {#each log.reverse() as line}
    <p class="text-md">{line}</p>
  {/each}
</div>
