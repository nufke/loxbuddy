<script lang="ts">
	import type { Control, MoodList } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, rooms } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	
	export let control: Control;

	let openModal: boolean;
	
	$: moodList = JSON.parse($state[control.states.moodList]);
	$: activeMoodsNum = Number($state[control.states.activeMoodsNum]);

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: $rooms[control.room].name,
		statusName: (activeMoodsNum < 0) ? 'Handmatig' : moodList.find((item:MoodList) => item.id == activeMoodsNum).name,
		buttons: [
			{
				name: 'Plus',
				type: 'button',
				color: '',
				action: () => {
					selectMextMood();
				}
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal
		}
	};

	function selectMextMood() {
    let moodIndex = moodList.findIndex((item:any) => { return item.id == activeMoodsNum });
		moodIndex++;
    if (moodIndex > moodList.length-1) {
			moodIndex = 0;
    }
    //console.log('changeTo/' + String(moodList[moodIndex].id));
		publishTopic(control.uuidAction, 'changeTo/' + String(moodList[moodIndex].id));
	}

</script>

<div>
	<LbControl {controlView} />
	<LbListModal {controlView} />
</div>