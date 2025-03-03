<script lang="ts">
  import "../app.postcss";
  import { AppShell } from "@skeletonlabs/skeleton";
  import MyAppBar from "$lib/components/my-app-bar.svelte";
  import MyAppSlidebar from "$lib/components/my-app-slidebar.svelte";

  import { initializeStores } from '@skeletonlabs/skeleton';
  initializeStores();

  // Font Awesome fonts
  import "@fortawesome/fontawesome-free/css/fontawesome.css";
  import "@fortawesome/fontawesome-free/css/brands.css";
  import "@fortawesome/fontawesome-free/css/solid.css";
</script>

<MyAppSlidebar />

<AppShell>
  <svelte:fragment slot="header">
    <MyAppBar />
  </svelte:fragment>
  <!-- Page Route Content -->
  <slot />
</AppShell>
