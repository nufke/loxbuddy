<script lang="ts">
  import { consoleArray } from '$lib/helpers/Logger';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { format } from 'date-fns';

  appStore.nav = '/';
</script>

<div class="container p-3">
  {#each consoleArray as item}
    <p>{format(item.date, "Pp")} [{item.level}] {item.message}</p>
  {/each}
</div>
