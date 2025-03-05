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
