<script lang="ts">
	import type { Control, ControlOptions, ControlView, DialogView, ListItem } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbIrcDialog from '$lib/components/Irc/LbIrcDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let temperatureDetails = control.details.temperatures;

	let subControls = $derived(Object.values(control.subControls))
	let selectedDayTimer = $derived(subControls.find( subControl => subControl.name == (isHeatPeriod ? 'Heating' : 'Cooling')) || subControls[0] );
	let value = $derived(Number(controlStore.getState(selectedDayTimer.states.value))); // mode via IRCDayTimer
	let mode = $derived(Number(controlStore.getState(control.states.mode)));
	let isHeatPeriod = $derived(((mode == 1) || (mode == 3) || (mode == 5)));
	let temperatureList = $derived(control.states.temperatures);
	let temperatures = $derived(updateTemperatures(temperatureList));
	let temperatureIdsList = $derived(getTemperatureList(isHeatPeriod, false));
	let tempActual = $derived(fmt.sprintf('%.1f', Number(controlStore.getState(control.states.tempActual))));

	function updateTemperatures(tempList: string[]) {
		let temp: number[] = [];
		tempList.forEach( (uuid: string) => {
			let t = Number(controlStore.getState(uuid));
			temp.push(t); 
		});
		return temp;
	}

	function getTemperatureList(isHeatPeriod: boolean, isManual: boolean) {
		let Idlist: ListItem[] = [
			{ id: 0, name: 'Economy', value: 0, isAbsolute: false, correctionHeating: -1, correctionCooling: 1,  visible: true },
			{ id: 1, name: 'Comfort heating', value: 0, isAbsolute: false, correctionHeating: 1, correctionCooling: 1, visible: true },
			{ id: 2, name: 'Comfort cooling', value: 0, isAbsolute: false, correctionHeating: 1, correctionCooling: 1, visible: true },
			{ id: 3, name: 'Empty house', value: 0, isAbsolute: false, correctionHeating: 1, correctionCooling: 1, visible: true },
			{ id: 4, name: 'Heat protection', value: 0, isAbsolute: false, correctionHeating: 1, correctionCooling: 1, visible: true },
			{ id: 5, name: 'Increased heat', value: 0, isAbsolute: false, correctionHeating: 1, correctionCooling: 1, visible: true },
			{ id: 6, name: 'Party', value: 0, isAbsolute: false, correctionHeating: -1, correctionCooling: -1, visible: true },
			{ id: 7, name: 'Manual', value: 0, isAbsolute: false, correctionHeating: -1, correctionCooling: -1, visible: false }
		];
		Idlist.forEach( (item: ListItem, index: number) => {
			if (index < 7) { //skip manual
				item.isAbsolute = temperatureDetails[index].isAbsolute; // update based on control details
				let corr = (isHeatPeriod ? item.correctionHeating : item.correctionCooling ) || 1;
				item.value = item.isAbsolute ? temperatures[index] : 
										(isHeatPeriod ? temperatures[1] + temperatures[index] * corr : temperatures[2] + temperatures[index] * corr);
			}
		});

		if (isHeatPeriod) { // Heating period, hide item 2
			Idlist[2].visible = false;
		} else { // Cooling period, hide item 1
			Idlist[1].visible = false;
		}
		if (!isManual) { // Not manual, hide item 7
			Idlist[7].visible = false;
		}
		return Idlist;
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: '', // no icon, render temperature as text
		iconText: tempActual,
		iconColor: 'fill-surface-950 dark:fill-surface-50',
		textName: $_('IRoomController').split(',').includes(control.name) ? controlStore.rooms[control.room].name : control.name,
		statusName: temperatureIdsList && temperatureIdsList[value] ? $_(temperatureIdsList[value].name) : '',
		statusColor: temperatureIdsList && temperatureIdsList[value] && temperatureIdsList[value].id > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700', // TODO other colors for temperatures
		list: temperatureIdsList,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbIrcDialog bind:controlView />
</div>
