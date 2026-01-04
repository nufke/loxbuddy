<script lang="ts">
	import type { Control, ControlOptions, ControlView, MoodList, SingleButtonView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbListDialog from '$lib/components/Common/LbListDialog.svelte';
	import { _ } from 'svelte-i18n';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let moodList = $derived(controlStore.getState(control.states.moodList)) as MoodList[];
	let activeMoodsNum = $derived(Number(controlStore.getState(control.states.activeMoodsNum)));

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
		controlStore.setControl(control.uuidAction, 'changeTo/' + String(moodList[moodIndex].id));
	}

	function getTextName() {
		const origNameFound = $_('LightControllerV2').includes(control.name);
		const room = controlStore.rooms.get(control.room);
		return (origNameFound && room) ? room.name : control.name;
	}

	function getStatus() {
		if (activeMoodsNum < 0) return $_('Manual');
		if (moodList) {
			let moodObj = moodList.find((item: MoodList) => item.id == activeMoodsNum);
			if (moodObj) return moodObj.name;
		}
		return '';
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'plus',
			type: 'button',
			color: '',
			click: (e:any) => selectMood(e)
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: controlOptions.showDialog,
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		showControl: controlOptions.showControl,
		isSubControl: controlOptions.isSubControl,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: activeMoodsNum != 778 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50',
		textName: getTextName(),
		statusName: getStatus(),
		statusColor: activeMoodsNum != 778 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		list: moodList,
		buttons: buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbListDialog bind:controlView />
</div>
