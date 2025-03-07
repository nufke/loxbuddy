<script lang="ts">
  import { createEventDispatcher } from 'svelte';
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
  import { controlList, categoryList, roomList } from '$lib/stores/stores';
  import type { PageData } from './$types'

  const dispatch = createEventDispatcher();
 
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
    { format: 'Jalousie', component: LbJalousie }
  ];

  function getComponent(name: string) {
    const comp = componentList.find(type => type.format == name);
    return comp ? comp.component : null;
  }

  let idx = 0; // TODO select favorite room

  function selectRoom() {
    dispatch('message', {value: idx});
  }

  $: filteredControls = $controlList.filter(control => control.room === rooms[idx].uuid);
  $: filteredLabels = filteredControls.map(control => control.cat);
  $: labels = $categoryList.filter(item => filteredLabels.indexOf(item.uuid) > -1).sort((a, b) => (a.name.localeCompare(b.name)));
  $: rooms = $roomList.sort((a, b) => (a.name.localeCompare(b.name)));
</script>

<style>
/* TODO do we still need this? */
select{
  scrollbar-width: none;     /* For Firefox */;
  -ms-overflow-style: none;  /* For Internet Explorer 10+ */;
}

.select {
  //background: none;
  //border: none;
  //-webkit-appearance: none;
  padding-left:15px;
}

select::-webkit-scrollbar { /* For WebKit Browsers */
  width: 0;
}
</style>

<div class="container mx-auto p-3 space-y-3">

  {#if rooms.length>0} <!-- make sure we have a list before we render the select-->
    <div class="ml-0 w-60 font-bold" >
      <select class="select h4" bind:value={idx} on:change={selectRoom}>
        {#each rooms as room, index}
          <option value={index}>{room.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  
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
