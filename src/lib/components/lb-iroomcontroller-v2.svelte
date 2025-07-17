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

	let tempActual = $derived(fmt.sprintf('%.1f', Number(store.getState(control.states.tempActual))));
	let activeMode = $derived(Number(store.getState(control.states.activeMode)));

	let activeModes : ListItem[] = [ /* active modes for V2 */
		{ id: 0, name: 'Economy', value: 0, abs: 0, corr: 1, visible: true },
		{ id: 1, name: 'Comfort temperature', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 2, name: 'Building protection', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 3, name: 'Manual', value: 0, abs: 0, corr: 0, visible: true },
		{ id: 4, name: 'Off', value: 0, abs: 0, corr: 0, visible: true }
	];

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: '', // no icon, render temperature as text
		iconText: tempActual,
		iconColor: 'fill-surface-950 dark:fill-surface-50',
		textName: $_('IRoomControllerV2').split(',').includes(control.name) ? store.rooms[control.room].name : control.name,
		statusName: activeModes[activeMode]?.name,
		statusColor: 'dark:text-surface-300 text-surface-700', // TODO other colors for temperatures
		list: activeModes,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbIrcModal bind:controlView /> <!-- we reuse the V1 modal -->
</div>
