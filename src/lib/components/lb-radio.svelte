<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, categories } from '$lib/stores/stores';

  export let control: Control;

  $: image = $categories[control.cat].image;

  $: iconView = {
    name: "/loxicons/" + (control.defaultIcon ? control.defaultIcon : image),
    color: "white"
  };
  
  $: textView =  {
    name: control.name,
    color: ""
  };

  $: stateView = {
     name:  (String($state[control.states.activeOutput]) === "0") ? 
            control.details["allOff"] : control.details.outputs[String($state[control.states.activeOutput])],
     color: ""
  };

  $: buttonView = {
    buttons: [
      {
        name: "mdi:minus",
        type: "button",
        color: "",
        action: () => console.log('minus')
      },
      {
        name: "mdi:plus",
        type: "button",
        color: "",
        action: () => console.log('plus')
      }
    ]
  };
</script>

<LbControl
  iconView={{ ...iconView }}
  textView={{ ...textView }}
  stateView={{ ...stateView }}
  buttonView={{ ...buttonView }}
/>
