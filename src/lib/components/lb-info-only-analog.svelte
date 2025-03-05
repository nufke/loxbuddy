<script lang="ts">
  import type { Control } from "$lib/types/models";  
  import { state, structure } from '$lib/stores/stores';
  import LbControl from '$lib/components/lb-control.svelte';
  import fmt from 'sprintf-js'

  export let control: Control;

  $: view = {
      icon: {
        name: "/loxicons/" + (control.defaultIcon ? control.defaultIcon : $structure.cats[control.cat].image),
        color: "white"
      },
      main: {
        name: control.name,
        color: ""
      },
      buttons: [] // no buttons
    }
  
  $: cstate = {
       name: fmt.sprintf(control.details.format, Number($state[control.states.value])),
       color: "",
    }

</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
