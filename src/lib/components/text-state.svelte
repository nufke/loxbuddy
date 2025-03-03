<script lang="ts">
  import { inlineSvg } from '@svelte-put/inline-svg';
  import type { Control, State } from "$lib/types/models";  
  import { state, structure } from '$lib/stores/stores';

  export let control: Control;
  let controlState: string;
  let image: string;
  let icon: string;
  $: controlState = $state[control.states.textAndIcon];
  $: image = $structure.cats[control.cat].image;
  $: icon = "/loxicons/" + (control.defaultIcon ? control.defaultIcon : image);
</script>

<div class="card min-h-[70px] justify-start items-center flex px-3 py-2 bg-linear-to-r m-0
            from-white/[0.095] to-white/5 border border-white/5 hover:border-white/10 rounded-xl">
  <div class="flex w-full justify-between">
    <div class="flex items-center truncate">
      <div class="flex placeholder-circle w-10 h-10 items-center justify-center">
        <svg use:inlineSvg={icon} fill="white" width="24" height="24"></svg>
      </div>
      <div class="ml-3 mt-0 truncate">
        <h1 class="text-lg truncate">{control?.name}</h1>
        <p class="text-md truncate">{controlState}</p>
      </div>
    </div>
  </div>
</div>
