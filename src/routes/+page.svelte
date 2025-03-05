<script lang="ts">
  import LbUpDownDigital  from "$lib/components/lb-up-down-digital.svelte";
  import LbTextState from "$lib/components/lb-text-state.svelte";
  import LbInfoOnlyAnalog from "$lib/components/lb-info-only-analog.svelte";
  import LbInfoOnlyDigital from "$lib/components/lb-info-only-digital.svelte";
  import LbInfoOnlyText from "$lib/components/lb-info-only-text.svelte";
  import LbJalousie from "$lib/components/lb-jalousie.svelte";
  import LbPushbutton from "$lib/components/lb-pushbutton.svelte";
  import LbRadio from "$lib/components/lb-radio.svelte";
  import LbWebpage from "$lib/components/lb-webpage.svelte";
  import LbSlider from "$lib/components/lb-slider.svelte";
  import LbSwitch from "$lib/components/lb-switch.svelte";
  import { mqttConnect } from '$lib/helpers/mqttclient';
  import { controls, categories } from '$lib/stores/stores';
  import type { PageData } from './$types'
  export let data: PageData

  mqttConnect(data);

  let uuid = "0f5ad681-006d-218c-ffff9fbd670c23f7"; // Woonkamer

  $: filteredControls = $controls.filter(control => control.room === uuid).sort((a, b) => (a.name.localeCompare(b.name)));
  $: filteredLabels = filteredControls.map(control => control.cat);
  $: labels = $categories.filter(item => filteredLabels.indexOf(item.uuid) > -1).sort((a, b) => (a.name.localeCompare(b.name)));

  let componentList = [
    { format: 'UpDownDigital', component: LbUpDownDigital },
    { format: 'TextState', component: LbTextState },
    { format: 'InfoOnlyAnalog', component: LbInfoOnlyAnalog },
    { format: 'InfoOnlyDigital', component: LbInfoOnlyDigital },
    { format: 'InfoOnlyText', component: LbInfoOnlyText },
    { format: 'Radio', component: LbRadio },
    { format: 'Pushbutton', component: LbPushbutton },
    { format: 'Webpage', component: LbWebpage },
    { format: 'Slider', component: LbSlider },
    { format: 'Switch', component: LbSwitch },
    { format: 'Jalousie', component: LbJalousie }
  ];

  function getComponent(name: string) {
    const comp = componentList.find(type => type.format == name);
    return comp ? comp.component : null;
  }

</script>

<div class="container mx-auto p-3 space-y-3">

  <h1 class="h1">Hello LoxBuddy</h1>
  <!--<p>App under development. Use at your own risk.</p>-->

  {#each labels as label}
    <h1 class="h3">{label.name}</h1>
    {#each filteredControls as control}
      {#if control.cat == label.uuid}
        <svelte:component this={getComponent(control.type)} {control}/>
      {/if}
    {/each}
  {/each}

</div>