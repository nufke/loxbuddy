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
      buttons: [] // no buttons
    }

  $: cstate = {
       name: $state[control.states.text],
       color: ""
    }

</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
