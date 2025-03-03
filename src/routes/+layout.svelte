<script lang="ts">
  import "../app.postcss";
  import { AppShell } from "@skeletonlabs/skeleton";
  import LbAppBar from "$lib/components/lb-app-bar.svelte";
  import LbAppSlidebar from "$lib/components/lb-app-slidebar.svelte";
  import { initializeStores } from '@skeletonlabs/skeleton';

  initializeStores();

  // Font Awesome fonts
  import "@fortawesome/fontawesome-free/css/fontawesome.css";
  import "@fortawesome/fontawesome-free/css/brands.css";
  import "@fortawesome/fontawesome-free/css/solid.css";
</script>

<LbAppSlidebar />

<AppShell>
  <svelte:fragment slot="header">
    <LbAppBar />
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
