<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, SingleButtonView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { msControl } from '$lib/communication/msclient';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let buttonActive = $derived(Number(store.getState(control.states.active)) == 1);

	let buttons: SingleButtonView[] = $derived([
		{
			name: buttonActive ? 'Switch off' : 'Switch on',
			type: 'switch',
			click: (e: any) => {
				msControl(control.uuidAction, e.checked ? 'on' : 'off');
			}
		}
	]);

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		isSubControl: controlOptions.isSubControl,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: buttonActive ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		statusName: buttonActive ? $_('On') : $_('Off'),
		statusColor: buttonActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		textName: control.name,
		textColor: controlOptions.isSubControl && buttonActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-50 text-surface-950',
		buttonState: buttonActive,
		buttons: buttons,
		modal: modal,
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	{#if !controlOptions.action} <!-- TODO disable modal popup for controls with action -->
		<LbModal bind:controlView={controlView}/>
	{/if}
</div>
