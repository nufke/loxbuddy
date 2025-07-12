<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView, ListItem } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbIrcModal from '$lib/components/lb-irc-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let subControls = $derived(Object.values(control.subControls));

	let temperatureIdsList : ListItem[] = [
		{ id: 0, name: 'Economy', value: 0, abs: 0, corr: 1, visible: true },
		{ id: 1, name: 'Comfort heating', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 2, name: 'Comfort cooling', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 3, name: 'Empty house', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 4, name: 'Heat protection', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 5, name: 'Increased heat', value: 0, abs: 0, corr: 1, visible: true },
		{ id: 6, name: 'Party', value: 0, abs: 0, corr: 1, visible: true },
		{ id: 7, name: 'Manual', value: 0, abs: 0, corr: 0, visible: true }
	];

	function removeListItem(a: ListItem[], id: number) {
		let newList: ListItem[] = [];
		for (let i = 0; i < a.length; i++) {
			if (a[i].id !== id) {
				newList.push(a[i]);
			}
		}
    return newList;
	}

	let tempActual = $derived(fmt.sprintf('%.1f', Number(store.getState(control.states.tempActual))));

	// grab temperature ID from first subcontrol
	let id = $derived(Number(store.getState(control.subControls[subControls[0].uuidAction].states.value))); // TODO check

	let mode = $derived(Number(store.getState(control.states.mode)));
	let isHeatPeriod = $derived(((mode == 1) || (mode == 3) || (mode == 5)));

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	// remove double entry in temperaure presetn list based on heating or cooling period
	let reducedTempList = $derived(isHeatPeriod ? removeListItem(temperatureIdsList, 2) : removeListItem(temperatureIdsList, 1));
	let tempList = $derived(removeListItem(reducedTempList, 7)); // manual cannot be selected from list

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: '', // no icon, render temperature as text
		iconText: tempActual,
		iconColor: 'fill-surface-950 dark:fill-surface-50',
		textName: control.name === $_('IRoomController') ? store.rooms[control.room].name : control.name,
		statusName: temperatureIdsList[id]?.name,
		statusColor: 'text-surface-500', // TODO other colors for temperatures
		list: tempList,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbIrcModal bind:controlView />
</div>
