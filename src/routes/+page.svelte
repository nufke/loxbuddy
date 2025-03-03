<script lang="ts">
  import UpDownDigital  from "$lib/components/up-down-digital.svelte";
  import TextState from "$lib/components/text-state.svelte";
  import InfoOnlyText from "$lib/components/info-only-text.svelte";
  import InfoOnlyDigital from "$lib/components/info-only-digital.svelte";
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
    { format: 'UpDownDigital', component: UpDownDigital },
    { format: 'TextState', component: TextState },
    { format: 'InfoOnlyText', component: InfoOnlyText },
    { format: 'InfoOnlyDigital', component: InfoOnlyDigital }
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