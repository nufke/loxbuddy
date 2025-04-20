<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, rooms } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: image = $categories[control.cat].image;
	$: moodList = JSON.parse($state[control.states.moodList]);
	$: selectedMood = JSON.parse($state[control.states.activeMoods])[0];
	$: console.log('selectedMood', moodList, moodList.find((item) => item.id == selectedMood));

	$: iconView = {
		name: '/loxicons/' + (control.defaultIcon ? control.defaultIcon : image),
		color: 'white'
	};

	$: textView = {
		name: $rooms[control.room].name,
		color: ''
	};

	$: stateView = {
		name: moodList.find((item) => item.id == selectedMood).name,
		color: ''
	};

	$: buttonView = {
		buttons: [
			{
				name: 'circle',
				type: 'button',
				color: '',
				action: () => {publishTopic(control.uuidAction, 'pulse');}
			}
		]
	};
</script>

<LbControl
	iconView={{ ...iconView }}
	textView={{ ...textView }}
	stateView={{ ...stateView }}
	buttonView={{ ...buttonView }} />
