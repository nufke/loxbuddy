<script lang="ts">
  import LbControl from '$lib/components/lb-control.svelte';
  import type { Control } from "$lib/types/models";
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
          name: "mdi:external-link",
          color: "",
          action: () => console.log('external link')
        }
      ]
    }

    $: cstate = {
        name:  "Web Link",
       color: ""
    }
    
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
