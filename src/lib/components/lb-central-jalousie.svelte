<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbJalousie from '$lib/components/lb-jalousie.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, ScreenItem, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown, Blinds, Settings, OctagonMinus } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/communication/mqttclient';
	import { fade200 } from '$lib/helpers/transition';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let selectedControl: Control | undefined= $state();
	let selectedControlOptions: ControlOptions | undefined = $state();
	let screenSelected = $state(false);

	let screenList = control.details.controls as ScreenItem[];
	screenList.forEach( item => item.selected = false); // default all screens unselected

	let screenUuid = control.details.controls.map((item: ScreenItem) => item.uuid);
	let screenControls = store.controlList.filter(
		(controls: Control) => screenUuid.indexOf(controls.uuidAction) > -1
	);

	let screensClosed = $derived(
		screenControls.filter((control: Control) => Number(store.getState(control.states.position)) * 100 > 1)
	);

	let selectedScreenCount = $derived(screenList.filter( item => item.selected == true).length);
	
	function getActiveScreens() {
		let status = '';
		switch (screensClosed.length) {
        case 0:
          status = $_('All open');
          break;
        default:
          status = String(screensClosed.length) + ' ' + $_('Closed').toLowerCase();
      }
			return status;
	}

	function selectScreen(i: number) {
		screenList[i].selected = !screenList[i].selected;
		screenSelected = selectedScreenCount == 1;
	}

	function selectScreenOptions() {
		if (!screenSelected) return; // more than one screen selected
		let screen = screenList.find( item => item.selected);
		let control: Control | undefined = store.controlList.find( (control: Control) => control.uuidAction == screen?.uuid);
		if (control) {
			controlView.modal.action(false);
			selectedControl = control;
			selectedControlOptions = {...DEFAULT_CONTROLOPTIONS, showModal: true, showControl: false};
		}
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {
			modal.state = state;
			if (!state) resetState()
		},
		state: false
	});

	function getScreenPosition(uuid: string) {
		let position = Math.round(Number(store.getState(store.controls[uuid].states.position)) * 100);
		return position < 1 ? $_('Opened') : (position > 99 ? $_('Closed') : String(position) + ' %');
	}

	function getStatusColor(uuid: string) {
		let position = Math.round(Number(store.getState(store.controls[uuid].states.position)) * 100);
		return position > 1 ? 'text-primary-500' : 'text-surface-950 dark:text-surface-50';
	}

	function resetState() {
		screenList.forEach( item => item.selected = false ); // clear selected screens
		selectedControl = undefined;
		selectedControlOptions = undefined;
	}

	function screenAction(action: string) {
		screenList.forEach( screen => { 
			if (screen.selected) {
				publishTopic(screen.uuid, action)
			}
		});
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'ChevronDown',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullDown')
		},
		{
			iconName: 'ChevronUp',
			type: 'button',
			color: '',
			click: () => publishTopic(control.uuidAction, 'FullUp')
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: getActiveScreens(),
		statusColor: screensClosed.length ? 'text-primary-500' : 'text-surface-500',
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView />

	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={() => controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
		backdropClasses="backdrop-blur-sm">
		{#snippet content()}
			<header class="relative">
				<div class="mb-2 flex justify-center">
					<h2 class="h4 text-center ">{controlView.textName}</h2>
				</div>
				<h2 class="text-lg text-center {screensClosed.length ? 'text-primary-500' : 'text-surface-500'}">{getActiveScreens()}</h2>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
						<X />
					</button>
				</div>
				<div class="container grid grid-cols-5 gap-2 mt-4">
					<button type="button" class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("FullDown")}><ChevronDown/></button>
					<button type="button" class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("FullUp")}><ChevronUp/></button>
					<button type="button" class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("shade")}><Blinds/></button>
					<button type="button" class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("stop")}><OctagonMinus/></button>
					<button type="button" class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm {screenSelected ? 'text-surface-800-200' : 'text-surface-200-800'}
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => selectScreenOptions()}><Settings/></button>
				</div>
			</header>
			<div class="overflow-y-scroll" style="max-height: 575px">
				{#each screenControls as control, index}
					{#if index > 0}
						<div class="mt-2"></div>
					{/if}
					<button class="w-full m-0 flex min-h-[50px] items-center justify-start rounded-lg border border-white/10 hover:border-white/50
												{screenList[index].selected ? 'dark:bg-surface-800  bg-surface-200' : 'dark:bg-surface-950  bg-surface-50'} px-2 py-2"
												 onclick={() => selectScreen(index)}>
						<div class="w-full">
							<div class="flex items-center truncate">
								<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
									<p class="truncate text-lg {getStatusColor(screenList[index].uuid)}">{control.name}</p>
									<p class="text-lg {getStatusColor(screenList[index].uuid)}">{getScreenPosition(screenList[index].uuid)}</p>
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/snippet}
	</Modal>

	{#if selectedControl && selectedControlOptions }
		{#key selectedControlOptions}  <!-- reinit component -->
			<LbJalousie control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>
