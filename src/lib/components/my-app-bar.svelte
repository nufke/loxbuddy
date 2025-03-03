<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton";
  import { getDrawerStore } from "@skeletonlabs/skeleton";
  import type { DrawerSettings } from '@skeletonlabs/skeleton';
  
  const drawerStore = getDrawerStore();

  function drawerOpen(): void {
    const settings: DrawerSettings = { id: 'doc-sidenav' };
    drawerStore.open(settings);
  }
</script>


<AppBar gridColumns="grid-cols-3" slotDefault="place-self-center" slotTrail="place-content-end">
  <svelte:fragment slot="lead">
    <div class="flex items-center space-x-4">
      <!-- Hamburger Menu -->
      <button on:click={drawerOpen} class="btn-icon btn-icon-sm lg:!hidden">
        <i class="fa-solid fa-bars text-xl"></i>
      </button>
    </div>
  </svelte:fragment>
  <h2 class="h2 text-nowrap">LoxBuddy</h2>
  <svelte:fragment slot="trail">
    <button on:click={drawerOpen} class="btn-icon btn-icon-sm lg:!hidden">
      <i class="fa-solid fa-circle-user text-3xl"></i>
    </button>
  </svelte:fragment>
</AppBar>
