<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, structure } from '$lib/stores/stores';

  export let control: Control;

  let image = $structure.cats[control.cat].image;
  $: view = {
      icon: {
        name: "/loxicons/" + (control.defaultIcon ? control.defaultIcon : image),
        color: "white"
      },
      main: {
        name: control.name,
        color: ""
      },
      buttons: [
        {
          name: "mdi:chevron-down",
          color: "",
          action: () => console.log('down')
        },
        {
          name: "mdi:chevron-up",
          color: "",
          action: () => console.log('up')
        }
      ]
    }

    $: cstate = {
        name:  "",
       color: ""
    }
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
<!--
<div class="card min-h-[70px] justify-start items-center flex px-3 py-2 bg-linear-to-r m-0
            from-white/[0.095] to-white/5 border border-white/5 hover:border-white/10 rounded-xl">
  <div class="flex w-full justify-between">
    <div class="flex items-center truncate">
      <div class="flex placeholder-circle w-10 h-10 items-center justify-center">
        <svg use:inlineSvg={icon} fill="white" width="24" height="24"></svg>
      </div>
      <div class="ml-3 mt-0 truncate">
        <h1 class="text-lg truncate">{control?.name}</h1>
      </div>
    </div>
    <div class="mr-1 flex items-center">
      <button type="button" class="btn-icon btn-icon-sm variant-ghost" on:click|preventDefault={incrementCount}><i class="fa fa-xl fa-plus"></i></button>
      <button type="button" class="ml-3 btn-icon btn-icon-sm variant-ghost" on:click|preventDefault={decrementCount}><i class="fa fa-xl fa-minus"></i></button>
    </div>
  </div>
</div>
-->