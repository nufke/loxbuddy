<script lang="ts">
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbJalousieModal from '$lib/components/lb-jalousie-modal.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { store } from '$lib/stores/store.svelte';
	
	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let position = $derived(Number(store.getState(control.states.position)) * 100);
	let shadePosition = $derived(store.getState(control.states.shadePosition) * 100);
	let autoActive = $derived(Number(store.getState(control.states.autoActive)));
	let isAutomatic = $derived(Number(control.details.isAutomatic));
	let type = control.details.animation;

	/* blinds type
		0: Venetian blinds (jaloezie/lamellen)
		1: Roller blinds (rolluik/dakrolgordijn/screen)
		2: Curtains opening to both sides
		3: Schlotterer Retrolux
		4: Curtain left
		5: Curtain right
		6: Awning (zonneluifel)
		*/
		
	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'ChevronDown',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullDown')
		},
		{
			iconName: 'ChevronUp',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullUp')
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: controlOptions.showModal,
		buttons: [
			{
				iconName: 'ChevronDown',
				type: 'button',
				color: '',
				click: () => {},  // do nothing
				mousedown: () => { publishTopic(control.uuidAction, 'down')},
				mouseup: () => { publishTopic(control.uuidAction, 'DownOff')}
			},
			{
				iconName: 'ChevronUp',
				type: 'button',
				color: '',
				click: () => {}, // do nothing
				mousedown: () => publishTopic(control.uuidAction, 'up'),
				mouseup: () => publishTopic(control.uuidAction, 'UpOff')
			},
			{
				iconName: 'ArrowDownToLine',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'FullDown'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			},
			{
				iconName: 'ArrowUpToLine',
				type: 'button',
				color: '',
				click: () => publishTopic(control.uuidAction, 'FullUp'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			},
			{
				name: $_('Shade'),
				type: 'button',
				color: '',
				class: 'col-span-2',
				click: () => publishTopic(control.uuidAction, 'shade'),
				mousedown: () => {}, // do nothing
				mouseup: () => {} // do nothing
			}
		]
	});

	function getPosition() {
		if (position < 1 && (shadePosition < 1 || type != 0)) return $_('Opened');
		if (position > 99 && (shadePosition > 99 || type != 0)) return $_('Closed');
		let str = (position < 1 ) ? $_('Opened') : ( (position > 99 ) ? $_('Closed') : fmt.sprintf('%1.0f%% ', position) + $_('Closed').toLowerCase());
		if (shadePosition < 1 && type == 0) {
			return str += ', ' + $_('Slats are horizontal').toLocaleLowerCase();
		}
		if (shadePosition > 99 && type == 0) {
			return str += ', ' + $_('Slats are vertical').toLocaleLowerCase();
		}
		if (type == 0) {
			return str += fmt.sprintf(', lamellen %1.0f%%', shadePosition);
		}
		return str;
	}

	let jalousie = $derived({
		position: position,
		shadePosition: type == 0 ? shadePosition : 100 // only use shadePosition for lamellen
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		showControl: controlOptions.showControl,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (position > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getPosition(),
		statusColor: (position > 0) ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		badgeIconName: isAutomatic ? '/icons/svg/automatic-2.svg' : '',
		badgeIconColor: autoActive ? 'dark:bg-primary-500 bg-primary-700' : 'dark:bg-surface-50 bg-surface-950',
		buttons: buttons,
		modal: { ...modal,
			details: jalousie
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbJalousieModal bind:controlView />
</div>
