<script lang="ts">
  import { inlineSvg } from '@svelte-put/inline-svg';
  import type { ControlView, ControlState } from "$lib/types/models";
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import Icon from "@iconify/svelte";

  export let controlView: ControlView;
  export let controlState: ControlState;
</script>

<div class="card min-h-[70px] justify-start items-center flex px-3 py-2 bg-linear-to-r m-0
            from-white/[0.095] to-white/5 border border-white/5 hover:border-white/10 rounded-xl">
  <div class="flex w-full justify-between">
    <div class="flex items-center truncate">
      <div class="flex placeholder-circle w-10 h-10 items-center justify-center">
        <svg use:inlineSvg={controlView.icon.name} fill={controlView.icon.color} width="24" height="24"></svg>
      </div>
      <div class="ml-3 mt-0 truncate">
        <h1 class="text-lg truncate">{controlView.main.name}</h1>
        <p class="text-md truncate" style="color: {controlState.color}">{controlState.name}</p>
      </div>
    </div>
    <div class="mr-1 flex items-center">
      {#each controlView.buttons as button, index}
        {#if index > 0}
          <div class="ml-3"></div>
        {/if}
        {#if ((button.type == "button") || (button.type == undefined)) }
          <button type="button" class="btn-icon btn-icon-sm variant-ghost" on:click|preventDefault={button.action}><span style="font-size:26px"><Icon icon={button.name} /></span></button>
        {/if}
        {#if (button.type == "switch")}
          <SlideToggle name="slide" active="bg-primary-500" /> <!--TODO checked={checked}-->
        {/if}
      {/each}
    </div>
  </div>
</div>
