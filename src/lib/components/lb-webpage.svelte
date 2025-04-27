<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { categories } from '$lib/stores/stores';
	import LbModal from '$lib/components/lb-modal.svelte';

	export let control: Control;

	let openModal: boolean;

  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		buttons: [
			{
				iconName: 'SquareArrowOutUpRight',
				name: 'Open link',
				type: 'button',
				color: '',
				action: () => window.open(control.details.url, "_blank")
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbModal {controlView} />
</div>
