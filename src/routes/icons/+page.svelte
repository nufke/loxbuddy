<script lang="ts">
	import iconmap from '$lib/components/Common/lox2iconify.json';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
</script>

<div class="container max-w-[1280px] p-2 gap-3">
  {#each Object.entries(iconmap) as icon}
    <div class="grid grid-cols-5 gap-3 mt-3">
      <p class="text-xs col-span-2">{icon[0].split('/')[1]}</p>
      <LbIcon class="text-primary-500" name={'../../loxicons/162/' + icon[0]} width="32" height="32"/>
      <LbIcon class="fill-blue-500" name={'../../loxicons/16/' + icon[0]} width="32" height="32"/>
      <LbIcon class="text-primary-500" name={icon[1]} width="38" height="38"/> <!-- we scale up to 38px to match the size of the Loxicons, which are slightly bigger -->
    </div>
  {/each}
</div>
