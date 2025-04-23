<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: buttonActive = $state[control.states.active] == '1';

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		iconColor: buttonActive ? '#0ea774' : 'white',
		textName: control.name,
		buttons: [
			{
				type: 'switch',
				state: buttonActive,
				action: (e: any) => {
					console.log(e.checked);
					publishTopic(control.uuidAction, e.checked ? '1' : '0');
				}
			}
		]
	};
</script>

<LbControl {controlView} />