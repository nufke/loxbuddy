<script lang="ts">
  import { menuNavLinks } from "$lib/links";
  import { AppRail, AppRailAnchor, AppRailTile, getDrawerStore } from "@skeletonlabs/skeleton";
  import { Drawer } from '@skeletonlabs/skeleton';

  let currentRailCategory: keyof typeof menuNavLinks | undefined = undefined;
  const drawerStore = getDrawerStore();

  function onClickAnchor(): void {
    currentRailCategory = undefined;
    drawerStore.close();
  }
</script>

<Drawer width="w-20" rounded=false>

  <AppRail background="bg-transparent" border="border-r border-surface-500/30">

    <AppRailAnchor href="/" class="lg:hidden" on:click={() => { onClickAnchor() }}>
      <svelte:fragment slot="lead">
        <i class="fa-solid fa-home text-2xl"></i>
      </svelte:fragment>
      <span>Home</span>
    </AppRailAnchor>

    <AppRailAnchor href="/blog" class="lg:hidden" on:click={() => { onClickAnchor() }}>
      <svelte:fragment slot="lead">
        <i class="fa-solid fa-bullhorn text-2xl"></i>
      </svelte:fragment>
      <span>Blog</span>
    </AppRailAnchor>

    <AppRailTile bind:group={currentRailCategory} name="docs" value={"/docs"}>
      <svelte:fragment slot="lead">
        <i class="fa-solid fa-book text-2xl"></i>
      </svelte:fragment>
      <span>Docs</span>
    </AppRailTile>

    <hr class="opacity-30" />

    <AppRailTile bind:group={currentRailCategory} name="elements" value={"/elements"}>
      <svelte:fragment slot="lead">
        TW
      </svelte:fragment>
      <span>Tailwind</span>
    </AppRailTile>
    <AppRailTile
      bind:group={currentRailCategory} name="svelte" value={"/svelte"}>
      <svelte:fragment slot="lead">
        SV
      </svelte:fragment>
      <span>Svelte</span>
    </AppRailTile>
    <AppRailTile bind:group={currentRailCategory} name="utilities" value={"/utilities"}>
      <svelte:fragment slot="lead">
        <i class="fa-solid fa-screwdriver-wrench text-2xl"></i>
      </svelte:fragment>
      <span>Utilities</span>
    </AppRailTile>
  </AppRail>

</Drawer>