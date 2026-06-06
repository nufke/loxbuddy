<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView, GeneralView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS, DEFAULT_GENERALVIEW } from '$lib/types/models';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let url = $derived(control.details.url);
	let urlHd = $derived(control.details.urlHd);
	let httpUrl = $derived((urlHd || url).match(/^https?:\/\/(.*)/)[1]); // https prio over http
	let passwordView: GeneralView = $state(DEFAULT_GENERALVIEW);

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
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: httpUrl,
		buttons: buttons,
		dialog: dialog
	});

	function openWebPage(): void {
		const cachedVisuPw = appStore.getVisuPw(controlView.control.uuidAction);
		if ( (controlView.control.isSecured && cachedVisuPw) || !controlView.control.isSecured) {
			window.open(url || urlHd, "_blank")
			return;
		}
		if (controlView.control.isSecured) {
			passwordView.label = $_('Secured control');
			passwordView.ok = (visuPw: string) => { window.open(url || urlHd, "_blank"); appStore.setVisuPw(controlView.control.uuidAction, visuPw);}
			passwordView.openDialog = true;
			return;
		}
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbDialog bind:controlView />
</div>
