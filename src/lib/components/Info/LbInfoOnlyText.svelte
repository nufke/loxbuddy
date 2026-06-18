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

	let isMap = false;

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let dialogExt = $derived(isMap ? {...dialog, disableIcon: true,	details: { map: text }} : dialog);
	let text = $derived(controlStore.getState(control.states?.text));
	let status = $derived(checkMap(text));

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: status,
		dialog: dialogExt
	});

	function checkMap(text: string | MapType): string {
		const map = (text as string).match(/openstreetmap.org\/#map=.*\/(.*)\/(.*)/) ?? [];
		if (map.length) {
			isMap = true;
			return `${map[1]}, ${map[2]}`;
		}
		const mapWithMarker = (text as string).match(/openstreetmap.org\/\?mlat=(.*)&mlon=(.*)#map.*/) ?? [];
		if (mapWithMarker.length) {
			isMap = true;
			return `${mapWithMarker[1]}, ${mapWithMarker}`;
		}
		const mapObj = utils.isValidJSONObject(text as string) ? JSON.parse(text as string) : (text as MapType);
		if (mapObj?.map && mapObj?.coordinates) {
			isMap = true;
			return mapObj.description?.length ? mapObj.description : `${mapObj.coordinates[1]}, ${mapObj.coordinates[0]}`;
		}
		isMap = false;
		return fmt.sprintf(control.details?.format, text); // not a map string nor object, return original text
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
