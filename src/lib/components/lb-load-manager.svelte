<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';
	import { locale } from '$lib/helpers/utils';
	
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

	function getPowerLevel(n: number) {
		return (n.toLocaleString(locale, { minimumFractionDigits: 1 })) + ' kW ' + $_('Available').toLowerCase();
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		disableIcon: true
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: (currentPower > 0) ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getPowerLevel(maxPower - currentPower),
		statusColor: (currentPower > 0) ? 'dark:text-primary-500 text-primary-700' : 'text-surface-700 dark:text-surface-300',
		modal: {
			...modal,
			details: {
				loadManager: {
					max: maxPower,
					actual: currentPower,
					loads: loads,
					statusLoads: statusLoads
				}
			}
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
