<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let position = $derived(Number(controlStore.getState(control.states.position)) * 100);
	let type = Number(control.details.animation);

	/* Gate types (based on animation detail)
		0 = Garage Door
		1 = Single Gate opening to the left:		open |->	close |<-
		2 = Single Gate opening to the right:		open <-|	close ->|
		3 = Gate opening to both sides:					open <|>	close >|<
		4 = Folding door opening to the left:		open |->	close |<-
		5 = Folding door opening to the right:	open <-|	close ->|
	*/

	let buttonMapLeft = [
		'lucide:chevron-down',
		'lucide:arrow-left-to-line',
		'lucide:arrow-right-to-line',
		'chevrons-right-left-close.svg',
		'lucide:arrow-left-to-line',
		'lucide:arrow-right-to-line'
	];

	let buttonMapRight = [
		'lucide:chevron-up',
		'lucide:arrow-right-from-line',
		'lucide:arrow-left-from-line',
		'chevrons-left-right-open.svg',
		'lucide:arrow-right-from-line',
		'lucide:arrow-left-from-line'
	]

	let buttons: SingleButtonView[] = $state([
		{
			iconName: buttonMapLeft[type],
			type: 'button',
			color: '',
			click: () => controlStore.setControl(control.uuidAction, 'close')
		},
		{
			iconName: buttonMapRight[type],
			type: 'button',
			color: '',
			click: () => controlStore.setControl(control.uuidAction, 'open')
		}
	]);

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: controlOptions.showDialog,
		class: 'grid-cols-2',
		buttons: [
			{
				name: $_('Close'),
				type: 'button',
				color: '',
				click: () => controlStore.setControl(control.uuidAction, 'close'),
			},
			{
				name: $_('Open'),
				type: 'button',
				color: '',
				click: () => controlStore.setControl(control.uuidAction, 'open'),
			},
			{
				name: $_('Open partially'),
				type: 'button',
				color: '',
				class: 'col-span-2',
				click: () => controlStore.setControl(control.uuidAction, 'partiallyOpen'),
			}
		]
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: (position > 99) ? $_('Opened') : ( (position < 1) ? $_('Closed') :  fmt.sprintf('%2.0f%% %s', position, $_('Opened'))),
		statusColor: (position > 1) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttons: buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
