<script lang="ts">
  import { consoleArray } from '$lib/helpers/Logger';
	import { format } from 'date-fns';
</script>

<div class="container p-3">
  {#each consoleArray.reverse() as item}
    <p class="text-md">{format(item.date, "Pp")} [{item.level}] {item.message}</p>
  {/each}
</div>
