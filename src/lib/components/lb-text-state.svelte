<script lang="ts">
  import LbControl from '$lib/components/lb-control.svelte';
  import type { Control, State } from "$lib/types/models";  
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
       name: $state[control.states.textAndIcon],
       color: ""
    }

</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
