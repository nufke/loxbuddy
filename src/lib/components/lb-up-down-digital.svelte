<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import LbModal from '$lib/components/lb-modal.svelte';
	
	export let control: Control;

	let openModal: boolean;

  $: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		buttons: [
			{
				iconName: 'ChevronDown',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'PulseDown')
			},
			{
				iconName: 'ChevronUp',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'PulseUp')
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
