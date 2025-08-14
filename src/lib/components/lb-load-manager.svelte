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

	let loads = control.details.loads;

	let currentPower = $derived(Number(store.getState(control.states.currentPower)));
	let peakOverloadPower = $derived(Number(store.getState(control.states.peakOverloadPower)));
	let maxPower = $derived(Number(store.getState(control.states.maxPower)));
	let maxTp = $derived(Number(store.getState(control.states.maxTp)));
	let maxPowerExceeded = $derived(Number(store.getState(control.states.maxPowerExceeded)));
	let availablePower = $derived(Number(store.getState(control.states.availablePower)));
	let lockedLoads = $derived(Number(store.getState(control.states.lockedLoads)));
	let statusLoads = $derived(Number(store.getState(control.states.statusLoads)));

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		details: {
			loadManager: {
				min: 0,
				max: 100,
				actual: 20
			}
		}
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (currentPower > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: String(maxPower - currentPower) + ' kW available',
		statusColor: (currentPower > 0) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-700 dark:text-surface-300',
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
