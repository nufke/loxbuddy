<script lang="ts">
	import type { Control, MoodList } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, rooms } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';

	export let control: Control;

	$: moodList = JSON.parse($state[control.states.moodList]);
	$: console.log('moodlist', activeMoods, manualMood, selectedMood, $state[control.states.activeMoodsNum]);
	$: activeMoods = JSON.parse($state[control.states.activeMoods]);
	$: manualMood = Number($state[control.states.activeMoodsNum]) < 0;
	$: selectedMood = activeMoods && activeMoods.length && activeMoods[0] ? Number(activeMoods[0]) : 778;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: $rooms[control.room].name,
		statusName: manualMood ? 'Handmatig' : moodList.find((item:MoodList) => item.id == selectedMood).name,
		buttons: [
			{
				name: 'Plus',
				type: 'button',
				color: '',
				action: () => {
					publishTopic(control.uuidAction, 'changeTo/778' ); // TODO
				}
			}
		]
	};
</script>

<LbControl {controlView} />