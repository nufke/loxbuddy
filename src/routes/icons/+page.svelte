<script lang="ts">
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
 	import { iconStore } from '$lib/stores/LbIconStore.svelte';
</script>

<div class="container max-w-[1280px] p-2 gap-3">
  {#each iconStore.iconMap as [name, icon]}
    <div class="grid grid-cols-5 gap-3 mt-3">
      <p class="text-xs col-span-2">{name.split('/')[1] || name}</p>
      <LbIcon class="text-primary-500" name={'../../loxicons/162/' + name} width="32" height="32"/>
      <LbIcon class="fill-blue-500" name={'../../loxicons/16/' + name} width="32" height="32"/>
      <LbIcon class="text-primary-500" name={icon} width="32" height="32"/> <!-- we scale up to 38px to match the size of the Loxicons, which are slightly bigger -->
    </div>
  {/each}
</div>
