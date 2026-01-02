<script lang="ts">
	import type { Control, ControlOptions, ControlView, DialogView, ListItem } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbIrcDialog from '$lib/components/Irc/LbIrcDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let tempActual = $derived(fmt.sprintf('%.1f', Number(controlStore.getState(control.states.tempActual))));
	let activeMode = $derived(Number(controlStore.getState(control.states.activeMode)));
	let operatingMode = $derived(Number(controlStore.getState(control.states.operatingMode)));
	let currentMode = $derived(Number(controlStore.getState(control.states.currentMode)));
	let comfortTemperature = $derived(Number(controlStore.getState(control.states.comfortTemperature))); // Heating
	let comfortTemperatureCool = $derived(Number(controlStore.getState(control.states.comfortTemperatureCool)));
	let frostProtectTemperature = $derived(Number(controlStore.getState(control.states.frostProtectTemperature)));
	let heatProtectTemperature = $derived(Number(controlStore.getState(control.states.heatProtectTemperature)));
	let absentMaxOffset = $derived(Number(controlStore.getState(control.states.absentMaxOffset))); // max temp offset for eco mode
	let absentMinOffset = $derived(Number(controlStore.getState(control.states.absentMinOffset))); // min temp offset for eco mode
	let isHeating = $derived((currentMode == 1) || (currentMode == 4));
	let temperatureList = $derived(getTemperatureList(isHeating, false));
	let mode = $derived((activeMode == 2) ? 4 : activeMode); // remapping

	function getTemperatureList(isHeatingOn: boolean, isManual: boolean) {
		let modes : ListItem[] = [ /* active modes for IRC V2 */
			{ id: 0, name: 'Economy', value: 0, visible: true },
			{ id: 1, name: 'Comfort temperature', value: 0, visible: true },
			{ id: 2, name: 'Building protection', value: 0, visible: true },
			{ id: 3, name: 'Manual', value: 0, visible: false },
			{ id: 4, name: 'Off', value: 0, visible: true }
		];
		if (isHeatingOn) {
			modes[0].value = comfortTemperature - absentMaxOffset;
			modes[1].value = comfortTemperature;
			modes[2].value = frostProtectTemperature;
			modes[4].value = frostProtectTemperature;
		} else { // Cooling
			modes[0].value = comfortTemperatureCool - absentMaxOffset;
			modes[1].value = comfortTemperatureCool;
			modes[2].value = frostProtectTemperature;
			modes[4].value = frostProtectTemperature;
		}
		return modes;
	}

	function getTextName() {
		let findName = $_('IRoomControllerV2').split(',').includes(control.name);
		return (findName && controlStore.rooms) ? controlStore.rooms[control.room].name : control.name;
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
		iconColor: 'fill-surface-950 dark:fill-surface-50',  // note: fill for svg text in IRC
		textName: getTextName(),
		statusName:  temperatureList && temperatureList[mode] ? $_(temperatureList[mode].name) : '',
		statusColor: temperatureList && temperatureList[mode] && temperatureList[mode].id > 0 && temperatureList[mode].id != 4 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700', // TODO other colors for temperatures
		list: temperatureList,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbIrcDialog bind:controlView /> <!-- we reuse the V1 dialog -->
</div>
