<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbJalousie from '$lib/components/Jalousie/LbJalousie.svelte';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbJalousieIcon from '$lib/components/Jalousie/LbJalousieIcon.svelte';
	import type { Control, ControlOptions, ControlView, DialogView, ScreenItem, SingleButtonView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { XIcon, ChevronUpIcon, ChevronDownIcon, BlindsIcon, SettingsIcon, OctagonMinusIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let selectedControl: Control | undefined= $state();
	let selectedControlOptions: ControlOptions | undefined = $state();
	let screenSelected = $state(false);

	let screenList = control.details.controls as ScreenItem[];
	screenList.forEach( item => item.selected = false); // default all screens unselected

	let screenUuid = control.details.controls.map((item: ScreenItem) => item.uuid);
	let screenControls = $derived(controlStore.controlList.filter(
		(controls: Control) => screenUuid.indexOf(controls.uuidAction) > -1
	));

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);
	
	let screensClosed = $derived(
		screenControls.filter((control: Control) => Number(controlStore.getState(control.states.position)) * 100 > 1)
	);

	let selectedScreenCount = $derived(screenList.filter( item => item.selected == true).length);
	let windowHeight = $derived(innerHeight.current || 0);
	let margin = 200;
	let size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin || 0);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});

	function parseScroll(height: number, view: any = undefined) {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

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

	function selectScreen(control: Control) {
		let index = screenList.findIndex( item => item.uuid == control.uuidAction);
		if (screenList[index]) {
			screenList[index].selected = !screenList[index].selected;
		}
		screenSelected = selectedScreenCount == 1;
	}

	function isSelected(control: Control) {
		let screen = screenList.find( item => item.uuid == control.uuidAction);
		return screen ? screen.selected : false;
	}

	function selectScreenOptions() {
		if (!screenSelected) return; // more than one screen selected
		let screen = screenList.find( item => item.selected);
		let control: Control | undefined = controlStore.controlList.find( (control: Control) => control.uuidAction == screen?.uuid);
		if (control) {
			selectedControl = control;
			selectedControlOptions = {...DEFAULT_CONTROLOPTIONS, showDialog: true, showControl: false};
		}
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {
			dialog.state = state;
		},
		state: false
	});

	function isAutoActive(control: Control) {
		return Number(controlStore.getState(control.states.autoActive));
	}

	function getStatusColor(control: Control) {
		let position = Math.round(Number(controlStore.getState(control.states.position)) * 100);
		return position > 1 ? 'dark:text-primary-500 text-primary-700' : 'text-surface-950 dark:text-surface-50';
	}

	function close() {
		screenList.forEach( item => item.selected = false ); // clear selected screens
		screenSelected = false;
		selectedControl = undefined;
		selectedControlOptions = undefined;
		controlView.dialog.action(false);
	}

	function screenAction(action: string) {
		screenList.forEach( screen => { 
			if (screen.selected) {
				controlStore.setControl(screen.uuid, action);
			}
		});
	}

	function getControlName(control: Control) {
		return $_('Jalousie').split(',').includes(control.name) ? controlStore.rooms[control.room].name : control.name;
	}

	function getRoomName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? '' : controlStore.rooms[control.room].name;
	}

	let buttons: SingleButtonView[] = $state([
		{
			iconName: 'ChevronDownIcon',
			type: 'button',
			color: '',
			click: () => controlStore.setControl(control.uuidAction, 'FullDown')
		},
		{
			iconName: 'ChevronUpIcon',
			type: 'button',
			color: '',
			click: () => controlStore.setControl(control.uuidAction, 'FullUp')
		}
	]);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		textName: control.name,
		statusName: getActiveScreens(),
		statusColor: screensClosed.length ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700',
		buttons: buttons,
		dialog: dialog
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
					<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										md:max-w-9/10 md:max-h-9/10 w-[450px]">
							<LbInfo control={controlView.control}/>
							<header class="grid grid-cols-[5%_90%_5%]">
								<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
								<div>
									<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
								</div>
								<div class="flex justify-center items-center">
									<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
										<XIcon class="size-4"/>
									</button>
								</div>
							</header>
						<Dialog.Description>
							<div class="flex flex-col items-center justify-center">
								<p class="mt-2 mb-4 text-lg text-center {screensClosed.length ? 'dark:text-primary-500 text-primary-700' :
												'dark:text-surface-300 text-surface-700'}">{getActiveScreens()}</p>
								<div class="container grid grid-cols-5 gap-2 mb-2">
									<button type="button" class="btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("FullDown")}>
																				<span class="w-[32px] flex justify-center items-center"><ChevronDownIcon/></span></button> <!-- to span to avoid scaling of icons -->
									<button type="button" class="btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("FullUp")}>
																				<span class="w-[32px] flex justify-center items-center"><ChevronUpIcon/></span></button>
									<button type="button" class="btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("shade")}>
																				<span class="w-[32px] flex justify-center items-center"><BlindsIcon/></span></button>
									<button type="button" class="btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => screenAction("stop")}>
																				<span class="w-[32px] flex justify-center items-center"><OctagonMinusIcon/></span></button>
									<button type="button" class="btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm {screenSelected ? 'text-surface-800-200' : 'text-surface-200-800'}
																				rounded-lg border border-white/10 hover:border-white/50" onclick={() => selectScreenOptions()}>
																				<span class="w-[32px] flex justify-center items-center"><SettingsIcon/></span></button>
								</div>
								<div class="relative flex flex-col w-full">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[10px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUpIcon size="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDownIcon size="30"/></div>
									{/if}
									<div class="flex flex-col overflow-y-auto space-y-2" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
										{#each screenControls as control}
											<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/10 hover:border-white/50
												{isSelected(control) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50'} px-2 py-2"
												onclick={() => selectScreen(control)}>
												<div class="relative flex truncate w-full">
													<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center h-[60px]">
														<div class="flex flex-col">
															<p class="leading-6 truncate text-lg {getStatusColor(control)}">{getControlName(control)}</p>
															<p class="truncate text-left text-xs dark:text-surface-300 text-surface-700">{getRoomName(control)}</p>
														</div>
														<div class="relative inline-flex h-12 p-0">
															<LbJalousieIcon {control} width="32" height="32"/>
															{#if control.details.isAutomatic }
																<div class="absolute -top-[0px] -left-[9px] inline-flex items-center justify-center w-[18px] h-[18px]
																	{isAutoActive(control) ? 'dark:bg-primary-500 bg-primary-700' : 'dark:bg-surface-50 bg-surface-950'} rounded-full
																	border border-1 dark:border-surface-950 border-surface-50">
																	<LbIcon class='dark:text-surface-950 text-surface-50' name="automatic-2.svg" size="10"/>
																</div>
															{/if}
														</div>
													</div>
												</div>
											</button>
										{/each}
									</div>
								</div>
							</div>
						</Dialog.Description>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
	{/if}
	{#if selectedControl && selectedControlOptions }
		{#key selectedControlOptions} <!-- reinit component -->
			<LbJalousie control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
