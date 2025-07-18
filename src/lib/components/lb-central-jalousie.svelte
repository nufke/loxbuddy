<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbJalousie from '$lib/components/lb-jalousie.svelte';
	import type { Control, ControlOptions, ControlView, ModalView, ScreenItem, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown, Blinds, Settings, OctagonMinus } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition'
	import { publishTopic } from '$lib/communication/mqttclient';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';

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

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
  let showScrollTop = $state(false);
	let showScrollBottom = $state(true);

	function parseScroll() {
		hasScroll = viewport?.scrollHeight > viewport?.clientHeight;
    showScrollTop = hasScroll && (viewport?.scrollTop > 20);
		showScrollBottom = hasScroll && (viewport.scrollTop + viewport?.clientHeight < (viewport?.scrollHeight - 20));
  }

	$effect( () => {
		parseScroll();
	});

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
		return position > 1 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50';
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

	function getControlName(control: Control) {
		return $_('Jalousie').split(',').includes(control.name) ? store.rooms[control.room].name : control.name;
	}

	function getRoomName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? '' : store.rooms[control.room].name;
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
		isFavorite: controlOptions.isFavorite,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: getActiveScreens(),
		statusColor: screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttons: buttons,
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<Modal
		open={controlView.modal.state}
		transitionsBackdropIn = {fade200}
		transitionsBackdropOut = {fade200}
		transitionsPositionerIn = {fade200}
		transitionsPositionerOut = {fade200}
		onOpenChange={() => controlView.modal.action(false)}
		triggerBase="btn bg-surface-600"
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									max-w-9/10 max-h-9/10 w-[450px]"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
		<Info control={controlView.control}/>
			<header class="relative">
				<div class="mb-2 flex justify-center">
					<h2 class="h4 text-center ">{controlView.textName}</h2>
				</div>
				<h2 class="text-lg text-center {screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">{getActiveScreens()}</h2>
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
			<div class="container relative w-full">
				{#if showScrollTop}
					<div class="absolute z-10 left-[50%] lb-center top-[16px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
				{/if}
				{#if showScrollBottom}
					<div class="absolute z-10 left-[50%] lb-center -bottom-[16px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
				{/if}
				<div class="overflow-y-auto space-y-2 max-h-[474px]" bind:this={viewport} onscroll={parseScroll}>
					{#each screenControls as control, index}
					<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/10 hover:border-white/50
												{screenList[index].selected ? 'dark:bg-surface-800  bg-surface-200' : 'dark:bg-surface-950  bg-surface-50'} px-2 py-2"
												 onclick={() => selectScreen(index)}>
						<div class="flex truncate w-full">
							<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center">
								<div class="flex flex-col">
									<p class="leading-6 truncate text-lg {getStatusColor(screenList[index].uuid)}">{getControlName(control)}</p>
									<p class="truncate text-left text-xs dark:text-surface-300 text-surface-700">{getRoomName(control)}</p>
								</div>
								<p class="text-lg {getStatusColor(screenList[index].uuid)}">{getScreenPosition(screenList[index].uuid)}</p>
							</div>
						</div>
					</button>
					{/each}
				</div>
			</div>
		{/snippet}
	</Modal>

	{#if selectedControl && selectedControlOptions }
		{#key selectedControlOptions}  <!-- reinit component -->
			<LbJalousie control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
