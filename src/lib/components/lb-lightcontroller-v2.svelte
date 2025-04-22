<script lang="ts">
	import type { Control } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, rooms } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: image = $categories[control.cat].image;
	$: moodList = JSON.parse($state[control.states.moodList]);
//	$: console.log('moodList', moodList);
	$: activeMoods = JSON.parse($state[control.states.activeMoods]);
	$: selectedMood = activeMoods && activeMoods.length ? activeMoods[0] : 778;
//	$: console.log('selectedMood', $state[control.states.activeMoods], moodList, moodList.find((item) => item.id == selectedMood));

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

<LbControl {iconView}	{textView} {stateView} {buttonView} />
