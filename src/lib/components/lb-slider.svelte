<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, categories } from '$lib/stores/stores';
  import fmt from 'sprintf-js'

  export let control: Control;

  $: image = $categories[control.cat].image;
  let position: number;

  $: {
     position = Number($state[control.states.value]);
     if (position > Number(control.details.max)) position == Number(control.details.max);
     if (position < Number(control.details.min)) position == Number(control.details.min);
  };

  $: iconView = {
    name: "/loxicons/" + (control.defaultIcon ? control.defaultIcon : image),
    color: "white"
  };
  
  $: textView ={
    name: control.name,
    color: ""
  };

  $: stateView = {
    name: fmt.sprintf(control.details.format, position),
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
