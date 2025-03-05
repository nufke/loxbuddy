<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, structure } from '$lib/stores/stores';
  import fmt from 'sprintf-js'

  export let control: Control;

  let image = $structure.cats[control.cat].image;
  let position: number;

  $: {
     position = Number($state[control.states.value]);
     if (position > Number(control.details.max)) position == Number(control.details.max);
     if (position < Number(control.details.min)) position == Number(control.details.min);
  }

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
       name: fmt.sprintf(control.details.format, position),
       color: ""
    }
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
