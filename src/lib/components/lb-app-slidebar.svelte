<script lang="ts">
  import { AppRail, AppRailAnchor, getDrawerStore } from "@skeletonlabs/skeleton";
  import { Drawer } from '@skeletonlabs/skeleton';

  const drawerStore = getDrawerStore();

  function onClickAnchor(): void {
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

    <!-- disable separator -->
    <!--<hr class="opacity-30" />-->

    <AppRailAnchor href="/utils" class="lg:hidden" on:click={() => { onClickAnchor() }}>
      <svelte:fragment slot="lead">
        <i class="fa-solid fa-screwdriver-wrench text-2xl"></i>
      </svelte:fragment>
      <span>Utilities</span>
    </AppRailAnchor>
  </AppRail>

</Drawer>