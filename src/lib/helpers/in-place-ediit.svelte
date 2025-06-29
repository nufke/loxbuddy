<script lang="ts">
/*
	derived from proposal:
	https://svelte.dev/playground/29c1026dda3c47a187bd21afa0782df1?version=5.34.9
*/

	let { value = $bindable(), required = true }  = $props();

	let editing = $state(false);

	function edit() {
		editing = true;
	}

	function submit() {
		editing = false;
	}

	function focus(element: any) {
		element.focus();
	}
</script>

{#if editing}
	<form onsubmit={submit}>
		<input bind:value onblur={submit} {required} use:focus />
	</form>
{:else}
	<div onclick={edit}>
		{value}
	</div>
{/if}

<style>
	input {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		font-size: inherit;
		color: inherit;
		font-weight: inherit;
		text-align: inherit;
		box-shadow: none;
	}
</style>
