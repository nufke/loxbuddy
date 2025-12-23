<script lang="ts">
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbLightControllerV2 from '$lib/components/LightController/LbLightControllerV2.svelte'
	import type { Control, ControlOptions, ControlView, DialogView, LightItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { XIcon, ChevronUpIcon, ChevronDownIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import fmt from 'sprintf-js';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let selectedControl: Control | undefined= $state();
	let selectedControlOptions: ControlOptions | undefined = $state();
	let lightList = control.details.controls as LightItem[];
	lightList.forEach( item => item.selected = false ); // default all lights unselected
	let lightsUuid = control.details.controls.map((item: LightItem) => item.uuid);

	let scenesEnabled = $state(false);
	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	let lightControls = $derived(controlStore.controlList.filter(
		(controls: Control) => lightsUuid.indexOf(controls.uuidAction) > -1
	));

	let lightsOff = $derived(
		lightControls.filter((control: Control) => controlStore.getState(control.states.activeMoodsNum) == 778)
	);

	let lightsOn = $derived(lightList.length - lightsOff.length);
	let selectedLightCount = $derived(lightList.filter( item => item.selected == true).length);

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

	function getActiveLights() {
		let status = '';
		switch (lightsOn) {
			case 0:
				status = $_('All off');
				break;
			case 1:
				status = fmt.sprintf($_('On in %s room'), 1);
				break;
			default:
				status = fmt.sprintf($_('On in %s rooms'), lightsOn);
		}
		return status;
	}

	function close() {
		lightList.forEach( item => item.selected = false ); // empty selected lights
		scenesEnabled = false;
		selectedControl = undefined;
		selectedControlOptions = undefined;
		controlView.dialog.action(false);
	}

	let dialog: DialogView = $state({
		action: (state: boolean) => {
			dialog.state = state; },
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: lightsOn ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getActiveLights(),
		statusColor: lightsOn ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700', 
		dialog: dialog
	});

	function getControlName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? controlStore.rooms[control.room].name : control.name;
	}

	function getRoomName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? '' : controlStore.rooms[control.room].name;
	}

	function getStatusName(control: Control) {
		let moodList = controlStore.getState(control.states.moodList) as MoodList[];
		let activeMoodsNum = Number(controlStore.getState(control.states.activeMoodsNum));
		return (activeMoodsNum < 0) ? $_('Manual') : moodList?.find((item:MoodList) => item.id == activeMoodsNum)?.name;
	}

	function getStatusColor(control: Control) {
		let activeMoodsNum = Number(controlStore.getState(control.states.activeMoodsNum));
		return activeMoodsNum == 778 ? 'text-surface-950 dark:text-surface-50' : 'dark:text-primary-500 text-primary-700';
	}

	function selectLight(control: Control) {
		let index = lightList.findIndex( item => item.uuid == control.uuidAction);
		if (lightList[index]) {
			lightList[index].selected = !lightList[index].selected;
		}
		scenesEnabled = selectedLightCount == 1;
	}
	
	function isSelected(control: Control) {
		let light = lightList.find( item => item.uuid == control.uuidAction);
		return light ? light.selected : false;
	}

	function changeLight(mood: string) {
		lightList.forEach( light => { 
			if (light.selected) {
				let control: Control | undefined = controlStore.controlList.find( (control: Control) => control.uuidAction == light.uuid);
				let moodList = controlStore.getState(control?.states.moodList) as MoodList[];
				let moodCmd;
				switch (mood) {
					case 'On': moodCmd = String(moodList[0].id); break;
					case 'Off': moodCmd = '778'; break; // TODO check if Off is always nr 778
					default: /* none */
				}
				if (control && moodList && moodCmd) {
					controlStore.setControl(control.uuidAction, 'changeTo/' + moodCmd);
				}
			}
		});
	}

	function selectScenes() {
		if (!scenesEnabled) return; // more than one scene selected
		let light = lightList.find( item => item.selected);
		let control: Control | undefined = controlStore.controlList.find( (control: Control) => control.uuidAction == light?.uuid);
		if (control) {
			selectedControl = control;
			selectedControlOptions = {...DEFAULT_CONTROLOPTIONS, showDialog: true, showControl: false};
		}
	}
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4" >
					<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										md:max-w-9/10 md:max-h-9/10 w-[450px]">
						<!--<Info control={controlView.control}/>-->
						<header>
							<div class="grid grid-cols-[5%_90%_5%]">
								<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
								<div>
									<p class="h5 flex justify-center items-center">{controlView.textName}</p>
								</div>
								<div class="flex justify-center items-center">
									<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
										<XIcon class="size-4"/>
									</button>
								</div>
							</div>
							<p class="text-lg text-center {lightsOn ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">{getActiveLights()}</p>
							<div class="grid grid-cols-3 gap-2 mt-2 mb-2">
								<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('On')}>{$_('On')}</button>
								<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('Off')}>{$_('Off')}</button>
								<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm {scenesEnabled ? 'text-surface-800-200' : 'text-surface-200-800'}
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => selectScenes()}>{$_('Scenes')}</button>
							</div>
						</header>
						<Dialog.Description>
							<div class="relative flex flex-col items-center justify-center">
								<div class="flex flex-col w-full">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[10px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUpIcon size="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDownIcon size="30"/></div>
									{/if}
									<div class="flex flex-col space-y-2 overflow-y-auto h-[50%]" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
										{#each lightControls as control}
											<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
														{isSelected(control) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50'} px-2 py-2"
														onclick={() => selectLight(control)}>
												<div class="flex items-center truncate w-full">
													<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center h-[60px]">
														<div class="flex flex-col">
															<p class="leading-6 truncate text-lg {getStatusColor(control)}">{getControlName(control)}</p>
															<p class="truncate bg-transparent text-left text-xs dark:text-surface-300 text-surface-700">{getRoomName(control)}</p>
														</div>
														<p class="text-lg {getStatusColor(control)}">{getStatusName(control)}</p>
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
			<LbLightControllerV2 control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
