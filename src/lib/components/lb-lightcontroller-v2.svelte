<script lang="ts">
	import type { Control, MoodList } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, rooms } from '$lib/stores/stores';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	import { _ } from 'svelte-i18n';

	export let control: Control;

	let openModal: boolean;

	$: moodList = JSON.parse($state[control.states.moodList]);
	$: activeMoodsNum = Number($state[control.states.activeMoodsNum]);

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		iconColor: (activeMoodsNum != 778) ? '#69C350' : 'white', //TODO add color map
		textName: (control.name === $_('LightcontrollerV2')) ? $rooms[control.room].name : control.name,
		statusName: (activeMoodsNum < 0) ? 'Handmatig' : moodList.find((item:MoodList) => item.id == activeMoodsNum).name,
		statusColor: (activeMoodsNum != 778) ? '#69C350' : 'white', //TODO add color map
		buttons: [
			{
				iconName: 'Plus',
				type: 'button',
				color: '',
				click: (e:any) => {
					selectMood(e);
				}
			}
		],
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			list: moodList
		}
	};

	function selectMood(e:any) {
		let moodIndex: number;
		if (e && e.checked == undefined) { // no mood given, select next mood
			moodIndex = moodList.findIndex((item:any) => { return item.id == activeMoodsNum });
			moodIndex++;
    	if (moodIndex > moodList.length-1) {
				moodIndex = 0;
    	}
		} else {
			moodIndex = e.checked;
		}
		publishTopic(control.uuidAction, 'changeTo/' + String(moodList[moodIndex].id));
	}
</script>

<div>
	<LbControl {controlView} />
	<LbListModal {controlView} />
</div>
