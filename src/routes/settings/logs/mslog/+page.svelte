<script lang="ts">
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let log = $state();
	let errorMsg = 'Unable to retrieve log from Miniserver';

	function getLog() {
		console.log('Retrieving Miniserver log...');
		controlStore
			.fetchUrl(controlStore.msInfo.serialNr, `dev/fsget/log/def.log`)
			.then((response) => {
				if (response.ok) {
					return response.text();
				} else {
					console.log(errorMsg);
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
