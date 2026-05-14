<script lang="ts">
	import { goto } from "$app/navigation";

	let { control } = $props();

	function rightClickContextMenu(e: any): void {
		goto('/info/' + control.uuidAction);
	}
</script>

<svelte:window on:contextmenu|preventDefault={rightClickContextMenu}/>

