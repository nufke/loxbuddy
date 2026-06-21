<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbMap from '$lib/components/Common/LbMap.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import fmt from 'sprintf-js';
	import type { MapType } from '$lib/types/models';
	import { utils } from '$lib/helpers/Utils';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let text = $derived(controlStore.getState(control.states?.text));
	let mapResult = $derived(checkMap(text));
	let statusName = $derived(mapResult.statusName);
	let isMap = $derived(mapResult.isMap);

	function checkMap(text: string | MapType): { statusName: string, isMap: boolean } {
		const map = (text as string).match(/openstreetmap.org\/#map=.*\/(.*)\/(.*)/) ?? [];
		const mapWithMarker = (text as string).match(/openstreetmap.org\/\?mlat=(.*)&mlon=(.*)#map.*/) ?? [];
		const mapObj = utils.isValidJSONObject(text as string) ? JSON.parse(text as string) : (text as MapType);

		if (map.length) return { statusName: `${map[1]}, ${map[2]}`, isMap: true };
		if (mapWithMarker.length) return { statusName: `${mapWithMarker[1]}, ${mapWithMarker}`, isMap: true };
		if (mapObj?.map && mapObj?.coordinates) {
			const statusName = mapObj.description?.length ? mapObj.description : `${mapObj.coordinates[1]}, ${mapObj.coordinates[0]}`;
			return { statusName, isMap: true };
		}
		return { statusName: fmt.sprintf(control.details?.format, text), isMap: false };
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} {statusName}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			{#if isMap}
				<div class="relative w-full mt-3">
					<LbMap map={text}/>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center">
					<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
						<LbIcon name={iconName} width="36" height="36"/>
					</div>
					<p class="text-lg">{statusName}</p>
				</div>
			{/if}
		{/snippet}
	</LbDialog>
{/if}
