<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories } from '$lib/stores/stores';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import LbJalousieModal from '$lib/components/lb-jalousie-modal.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	let openModal: boolean;

	$: position = Number($state[control.states.position]) * 100;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		iconColor: (position > 0) ? '#69C350' : 'white', //TODO add color map
		textName: control.name,
		statusName: position < 1 ? $_('Opened') : position > 99 ? $_('Closed') : fmt.sprintf('%1.0f%% ', position),
		statusColor: (position > 0) ? '#69C350' : 'white', //TODO add color map
		buttons: [
			{
				iconName: 'ChevronDown',
				type: 'button',
				color: '',
				click: () => console.log('fully down')
			},
			{
				iconName: 'ChevronUp',
				type: 'button',
				color: '',
				click: () => console.log('fully up')
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			buttons: [
				{
					iconName: 'ChevronDown',
					type: 'button',
					color: '',
					mousedown: () => publishTopic(control.uuidAction, 'down'),
					mouseup: () => publishTopic(control.uuidAction, 'DownOff')
				},
				{
					iconName: 'ChevronUp',
					type: 'button',
					color: '',
					mousedown: () => publishTopic(control.uuidAction, 'up'),
					mouseup: () => publishTopic(control.uuidAction, 'UpOff')
				},
				{
					iconName: 'ArrowDownToLine',
					type: 'button',
					color: '',
					click: () => publishTopic(control.uuidAction, 'FullDown')
				},
				{
					iconName: 'ArrowUpToLine',
					type: 'button',
					color: '',
					click: () => publishTopic(control.uuidAction, 'FullUp')
				},
				{
					name: $_('Shade'),
					type: 'button',
					color: '',
					click: () => publishTopic(control.uuidAction, 'shade')
				}
				
			]
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbJalousieModal {controlView} />
</div>

