<script lang="ts">
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let log = $state();
	let errorMsg = 'Unable to retrieve log from Miniserver';

	function getLog() {
		console.info('Retrieving Miniserver log...');
		controlStore
			.fetchUrl(controlStore.msInfo.serialNr, `dev/fsget/log/def.log`)
			.then((response) => {
				if (response.ok) {
					return response.text();
				} else {
					console.error(errorMsg);
					return errorMsg;
				}
			})
			.then((data) => {
				log = data;
			});
	}

	getLog();
</script>

<div class="text-md container p-3">
	{log}
</div>
