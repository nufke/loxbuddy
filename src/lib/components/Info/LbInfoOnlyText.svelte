<script lang="ts">
	import type { Control, ControlOptions, ControlView, DialogView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import type { MapType } from '$lib/types/models';
	import { utils } from '$lib/helpers/Utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();
	let text = $derived(controlStore.getState(control.states?.text));
	let mapCoordinates = $derived(extractCoordinates(text));

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let dialogExt = $derived(mapCoordinates.length ? {...dialog, disableIcon: true,	details: { map: text }} : dialog)

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: mapCoordinates.length ? `${mapCoordinates[0]}, ${mapCoordinates[1]}` : fmt.sprintf(control.details?.format, text),
		dialog: dialogExt
	});

	function extractCoordinates(text: string | MapType): number[] {
		const map = (text as string).match(/openstreetmap.org\/#map=.*\/(.*)\/(.*)/) ?? [];
		if (map.length) {
			return [Number(map[1]), Number(map[2])];
		}
		const mapObj = utils.isValidJSONObject(text as string) ? JSON.parse(text as string) : (text as MapType);
		if (mapObj?.map && mapObj?.coordinates) {
			return mapObj.coordinates.reverse();
		}
		return []; // not a map string nor object, return []
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
