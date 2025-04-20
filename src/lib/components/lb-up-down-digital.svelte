<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: image = $categories[control.cat].image;

	$: iconView = {
		name: '/loxicons/' + (control.defaultIcon ? control.defaultIcon : image),
		color: 'white'
	};

	$: textView = {
		name: control.name,
		color: ''
	};

	$: stateView = {
		name: '',
		color: ''
	};

	$: buttonView = {
		buttons: [
			{
				name: 'ChevronDown',
				type: 'button',
				color: '',
				action: () => publishTopic(control.uuidAction, 'PulseDown')
			},
			{
				name: 'ChevronUp',
				type: 'button',
				color: '',
				action: () => publishTopic(control.uuidAction, 'PulseUp')
			}
		]
	};
</script>

<LbControl
	iconView={{ ...iconView }}
	textView={{ ...textView }}
	stateView={{ ...stateView }}
	buttonView={{ ...buttonView }}
/>
