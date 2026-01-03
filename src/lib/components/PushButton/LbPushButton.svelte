<script lang="ts">
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let buttons: SingleButtonView[] = $state([
		{
			name: 'Push',
			iconName: 'circle',
			type: 'button',
			color: '',
			click: () => {
				controlStore.setControl(control.uuidAction, 'pulse');
			}
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		buttons: buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
