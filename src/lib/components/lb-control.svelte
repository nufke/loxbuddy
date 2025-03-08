<script lang="ts">
  import { inlineSvg } from '@svelte-put/inline-svg';
  import type { IconView, TextView, ButtonView, StateView } from "$lib/types/models";
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import Icon from "@iconify/svelte";

  export let iconView: IconView;
  export let textView: TextView;
  export let stateView: StateView;
  export let buttonView: ButtonView = {buttons: []};
</script>

<div class="card min-h-[70px] justify-start items-center flex px-3 py-2 bg-linear-to-r m-0
            from-white/[0.095] to-white/5 border border-white/5 hover:border-white/10 rounded-xl">
  <div class="flex w-full justify-between">
    <div class="flex items-center truncate">
      <div class="flex placeholder-circle w-10 h-10 items-center justify-center">
        <svg use:inlineSvg={iconView.name} fill={iconView.color} width="24" height="24"></svg>
      </div>
      <div class="ml-3 mt-0 truncate">
        <h1 class="text-lg truncate">{textView.name}</h1>
        <p class="text-md truncate" style="color: {stateView.color}">{stateView.name}</p>
      </div>
    </div>
    <div class="mr-1 flex items-center">
      {#each buttonView.buttons as button, index}
        {#if index > 0}
          <div class="ml-3"></div>
        {/if}
        {#if (button.type === "button" && button.name ) }
          <button type="button" class="btn-icon btn-icon-sm variant-ghost" on:click|preventDefault={button.action}><span style="font-size:26px"><Icon icon={button.name} /></span></button>
        {/if}
        {#if (button.type == "switch")}
          <SlideToggle name="slide" active="bg-primary-600" checked={button.state} on:change={button.action}/> <!--TODO checked={checked}-->
        {/if}
      {/each}
    </div>
  </div>
</div>
