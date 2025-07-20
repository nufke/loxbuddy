<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import fmt from 'sprintf-js';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let actualFormat = control.details.actualFormat;
	let totalFormat = control.details.totalFormat;

	let actual = 10; //$derived(Number(store.getState(control.states.actual)));
	let total = $derived(Number(store.getState(control.states.total)));
	let totalDay = $derived(Number(store.getState(control.states.totalDay)));
	let totalWeek = $derived(Number(store.getState(control.states.totalWeek)));
	let totalMonth = $derived(Number(store.getState(control.states.totalMonth)));
	let totalYear = $derived(Number(store.getState(control.states.totalYear)));

	let details = $derived([
		{ 
			name: $_('Total') + ' (' + $_('Day') + ') ',
		  value: fmt.sprintf(totalFormat, totalDay)
		},
		{ 
			name: $_('Total') + ' (' + $_('Week') + ') ',
		  value: fmt.sprintf(totalFormat, totalWeek)
		},
		{ 
			name: $_('Total') + ' (' + $_('Month') + ') ',
		  value: fmt.sprintf(totalFormat, totalMonth)
		},
		{ 
			name: $_('Total') + ' (' + $_('Year') + ') ',
		  value: fmt.sprintf(totalFormat, totalYear)
		},
		{ 
			name: $_('Total'),
		  value: fmt.sprintf(totalFormat, total)
		}
	]);

		let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (actual > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: fmt.sprintf(actualFormat, actual),
		statusColor: (actual > 0) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-700 dark:text-surface-300',
		modal: {
			...modal,
			details }
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
