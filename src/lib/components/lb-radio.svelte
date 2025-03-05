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
          name: "mdi:minus",
          color: "",
          action: () => console.log('minus')
        },
        {
          name: "mdi:plus",
          color: "",
          action: () => console.log('plus')
        }
      ]
    }

    $: cstate = {
       name:  (String($state[control.states.activeOutput]) === "0") ? 
              control.details["allOff"] : control.details.outputs[String($state[control.states.activeOutput])],
       color: ""
    }
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
