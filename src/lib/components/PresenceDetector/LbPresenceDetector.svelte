<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/Store.svelte';
	import { _ } from 'svelte-i18n';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let locked = $derived(Number(store.getState(control.states.locked)) || 0);
	let active = $derived(Number(store.getState(control.states.active)) || 0);

	let	dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		badgeIconName: locked ? 'Lock' : '',
		badgeIconColor: locked ? 'bg-red-500' : '',
		statusName: locked ? $_('Locked') : ( active ? $_('Presence active') : $_('No presence') ),
		statusColor: locked ? 'text-red-500' : ( active ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700' ),
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
