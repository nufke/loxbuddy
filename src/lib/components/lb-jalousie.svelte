<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, structure } from '$lib/stores/stores';
  import fmt from 'sprintf-js'

  export let control: Control;

  $: position = Number($state[control.states.position])*100;
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
       name: position<1 ? "Gesloten" : (position>99 ? "Geopend" : fmt.sprintf("%1.0f%% ", position)),
       color: ""
    }
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
