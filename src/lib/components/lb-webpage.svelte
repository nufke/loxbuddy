<script lang="ts">
  import { inlineSvg } from '@svelte-put/inline-svg';
  import type { Control } from "$lib/types/models";
  import { state, structure } from '$lib/stores/stores';

  export let control: Control;

  let count = 0;
  function push() {
    count++;
    console.log('count:', count);
  }

  let image = $structure.cats[control.cat].image;
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
        <p>Web Link</p>
      </div>
    </div>
    <div class="mr-1 flex items-center">
      <button type="button" class="btn-icon btn-icon-sm variant-ghost" on:click|preventDefault={push}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" stroke-width="0.5" stroke="currentColor"/></svg>      </button>
    </div>
  </div>
</div>
