<script lang="ts">
	import type { Control, ControlView, MoodList, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_MOODLIST } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import LbListModal from '$lib/components/lb-list-modal.svelte';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
	
	let { control, isSubControl = false }: { control: Control, isSubControl: boolean } = $props();

	let moodList = $derived(store.getState(control.states.moodList)) as MoodList[];
	let activeMoodsNum = $derived(Number(store.getState(control.states.activeMoodsNum)));

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

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'Plus',
			type: 'button',
			color: '',
			click: (e:any) => selectMood(e)
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, isSubControl),
		iconColor: (activeMoodsNum != 778) ? '#69C350' : 'white', //TODO add color map
		textName: (control.name === $_('LightcontrollerV2')) ? store.rooms[control.room].name : control.name,
		statusName: (activeMoodsNum < 0) ? $_('Manual') : moodList.find((item:MoodList) => item.id == activeMoodsNum)?.name,
		statusColor: (activeMoodsNum != 778) ? '#69C350' : 'white', //TODO add color map
		list: moodList,
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbListModal bind:controlView={controlView}/>
</div>
