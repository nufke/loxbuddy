<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { categories } from '$lib/stores/stores';

	export let control: Control;

  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: '(control unknown)',
	};
</script>

<LbControl {controlView} />
