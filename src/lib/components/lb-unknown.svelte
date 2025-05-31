<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';

	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

  let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, isSubControl),
		textName: control.name,
		statusName: '(control unknown)',
	});
</script>

<LbControl bind:controlView={controlView} />
