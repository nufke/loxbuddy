<script lang="ts">
  import type { Control } from "$lib/types/models";
  import LbControl from "$lib/components/lb-control.svelte";
  import { categories } from "$lib/stores/stores";

  export let control: Control;

  $: image = $categories[control.cat].image;

  $: iconView = {
    name: "/loxicons/" + (control.defaultIcon ? control.defaultIcon : image),
    color: "white",
  };

  $: textView = {
    name: control.name,
    color: "",
  };

  $: stateView = {
    name: "",
    color: "",
  };

  $: buttonView = {
    buttons: [
      {
        name: "mdi:checkbox-blank-circle-outline",
        type: "button",
        color: "",
        action: () => console.log("push"),
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
