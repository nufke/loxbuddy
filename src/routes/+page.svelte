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
  import LbLightControllerV2 from "$lib/components/lb-lightcontroller-v2.svelte";
  import { mqttConnect } from '$lib/helpers/mqttclient';
  import { controlList, categoryList, roomList } from '$lib/stores/stores';
  import type { PageData } from './home/$types'
 
  export let data: PageData

  mqttConnect(data);

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
    { format: 'Jalousie', component: LbJalousie },
    { format: 'LightControllerV2', component: LbLightControllerV2 }
  ];

  function getComponent(name: string) {
    const comp = componentList.find(type => type.format == name);
    return comp ? comp.component : null;
  }

  let idx = 0; // TODO select favorite room

  $: filteredControls = $controlList.filter(control => control.room === rooms[idx].uuid).sort((a, b) => (a.name.localeCompare(b.name)));
  $: filteredLabels = filteredControls.map(control => control.cat);
  $: labels = $categoryList.filter(item => filteredLabels.indexOf(item.uuid) > -1).sort((a, b) => (a.name.localeCompare(b.name)));
  $: rooms = $roomList.sort((a, b) => (a.name.localeCompare(b.name)));
</script>

<div class="container mx-auto p-3 space-y-3">
  {#each labels as label}
    <h1 class="ml-2 h4">{label.name}</h1>
    <div class="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:flex-wrap">
      {#each filteredControls as control}
        {#if control.cat == label.uuid}
          <svelte:component this={getComponent(control.type)} {control}/>
        {/if}
      {/each}
    </div>
  {/each}
</div>
