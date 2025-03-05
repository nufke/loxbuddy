<script lang="ts">
  import LbControl from '$lib/components/lb-control.svelte';
  import type { Control } from "$lib/types/models";
  import { state, structure } from '$lib/stores/stores';

  export let control: Control;

  //$: checked = $state[control.states.active]!="1";
  //$: iconColor = checked ? "green" : "white"; // TODO use theme colours
  //$: console.log('checked', checked, $state[control.states.active])
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
          name: "", // switch has no name
          type: "switch",
          action: () => console.log('switch')
        },
      ]
    }

  $: cstate = {
       name: "",
       color: ""
    }
</script>

<LbControl controlView={{...view}} controlState={{...cstate}}/>
