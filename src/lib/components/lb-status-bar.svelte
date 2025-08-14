<script lang="ts">
	import { _ } from 'svelte-i18n';
  import { Progress } from '@skeletonlabs/skeleton-svelte';

	let { min, max, actual } = $props();

</script>

<div class="w-full h-full mt-2 mb-2 flex align-center justify-center">
	<div class="flex w-full flex-col ml-2 mr-2">
		<Progress meterBg="bg-primary-500" value={actual} max={max} height="h-10" />
	</div>
</div>