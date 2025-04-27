<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	let openModal: boolean;

	$: buttonActive = $state[control.states.active] == '1';

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		iconColor: buttonActive ? '#69C350' : 'white', //TODO add color map
		textName: control.name,
		buttons: [
			{
				type: 'switch',
				name: 'Switch off,Switch on',
				state: buttonActive,
				action: (e: any) => {
					publishTopic(control.uuidAction, e.checked ? '1' : '0');
				}
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
