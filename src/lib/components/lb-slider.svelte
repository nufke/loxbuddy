<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from '$lib/components/lb-control.svelte';
  import { state, categories } from '$lib/stores/stores';
  import { publishTopic } from '$lib/helpers/mqttclient';
  import fmt from 'sprintf-js'

  export let control: Control;

  $: image = $categories[control.cat].image;
  $: position = Number($state[control.states.value]);

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
        action: () => updatePosition(position, -1)
      },
      {
        name: "mdi:plus",
        type: "button",
        color: "",
        action: () => updatePosition(position, 1)
      }
    ]
  };

  function updatePosition(position: number, isUp: number ) {
    let min: number = Number(control.details.min);
    let max: number = Number(control.details.max);
    let step: number = Number(control.details.step);
    let pos: number = position + step * isUp;
    if (pos > max) pos = max;
    if (pos < min) pos = min;
    publishTopic(control.uuidAction, String(pos));
  }
</script>

<LbControl
  iconView={{ ...iconView }}
  textView={{ ...textView }}
  stateView={{ ...stateView }}
  buttonView={{ ...buttonView }}
/>
