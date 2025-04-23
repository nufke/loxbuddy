<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		buttons: [
			{
				name: 'Circle',
				type: 'button',
				color: '',
				action: () => {
					publishTopic(control.uuidAction, 'pulse');
				}
			}
		]
	};
</script>

<LbControl {controlView} />