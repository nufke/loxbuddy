<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control } from '$lib/types/models';
	import { state, categories } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: image = $categories[control.cat].image;
	$: buttonActive = $state[control.states.active] == '1';

	$: iconView = {
		name: '/loxicons/' + (control.defaultIcon ? control.defaultIcon : image),
		color: buttonActive ? '#0ea774' : 'white'
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

<LbControl {iconView}	{textView} {stateView} {buttonView} />
