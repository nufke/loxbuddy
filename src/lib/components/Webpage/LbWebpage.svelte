<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbMap from '$lib/components/Common/LbMap.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { fadeInOut } from '$lib/helpers/styles';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let url = $derived(control.details.url);
	let urlHd = $derived(control.details.urlHd);
	let httpUrl = $derived((urlHd || url).match(/^https?:\/\/(.*)/)[1]); // https prio over http
	let mapInfo = $derived(httpUrl.match(/www.openstreetmap.org\/#map=(.*)\/(.*)\/(.*)/) || []);

	function openWebPage() {
		window.open(url || urlHd, "_blank")
	}

	function close() {
		controlView.dialog.action(false);
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'square-arrow-out-up-right',
			name: 'Open link',
			type: 'button',
			color: '',
			click: () => openWebPage()
		}
	]);

	let	dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: mapInfo.length ? 'loxbuddy:location' : controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: mapInfo.length ? `${mapInfo[2]}, ${mapInfo[3]}` : httpUrl,
		buttons: mapInfo.length ? [] : buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>

	{#if mapInfo.length}
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 overflow-auto w-[680px] {fadeInOut}">
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
					<Dialog.Description>
						<LbMap zoom={mapInfo[1]} latitude={mapInfo[2]} longitude={mapInfo[3]} />
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
	{:else}
		<LbDialog bind:controlView />
	{/if}
</div>
