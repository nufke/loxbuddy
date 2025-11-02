<script lang="ts">
	import { goto } from "$app/navigation";

	let { control } = $props();

	function rightClickContextMenu(e: any) {
		goto('/info/' + control.uuidAction);
	}
</script>

<svelte:window on:contextmenu|preventDefault={rightClickContextMenu}/>

