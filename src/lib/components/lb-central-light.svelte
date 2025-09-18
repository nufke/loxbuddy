<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import LbLightControllerV2 from '$lib/components/lb-lightcontroller-v2.svelte'
	import type { Control, ControlOptions, ControlView, ModalView, LightItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { publishTopic } from '$lib/communication/mqttclient';
	import fmt from 'sprintf-js';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let selectedControl: Control | undefined= $state();
	let selectedControlOptions: ControlOptions | undefined = $state();

	let lightList = control.details.controls as LightItem[];
	lightList.forEach( item => item.selected = false ); // default all lights unselected

	let lightsUuid = control.details.controls.map((item: LightItem) => item.uuid);
	let lightControls = $derived(store.controlList.filter(
		(controls: Control) => lightsUuid.indexOf(controls.uuidAction) > -1
	));

	let lightsOff = $derived(
		lightControls.filter((control: Control) => store.getState(control.states.activeMoodsNum) == 778)
	);

	let lightsOn =  $derived(lightList.length - lightsOff.length);
	let selectedLightCount = $derived(lightList.filter( item => item.selected == true).length);

	let scenesEnabled = $state(false);

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
  let showScrollTop = $state(false);
	let showScrollBottom = $state(true);

	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(false); 

	function parseScroll() {
		hasScroll = viewport?.scrollHeight > viewport?.clientHeight;
    showScrollTop = limitHeight && hasScroll && (viewport?.scrollTop > 10);
		showScrollBottom = limitHeight && hasScroll && (viewport.scrollTop + viewport?.clientHeight < (viewport?.scrollHeight - 10));
  }

	$effect( () => {
		parseScroll();
	});

	$effect( () => {
		if (windowHeight && modalViewport) { /* trigger on windowHeight change */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 10) < 0;
			});
		}
	});

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

	function resetState() {
		lightList.forEach( item => item.selected = false ); // empty selected lights
		selectedControl = undefined;
		selectedControlOptions = undefined;
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {
			modal.state = state;
			if (!state) resetState()
		},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		iconColor: lightsOn ? 'dark:fill-primary-500 fill-primary-700' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getActiveLights(),
		statusColor: lightsOn ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700', 
		modal: modal
	});

	function getControlName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? store.rooms[control.room].name : control.name;
	}

	function getRoomName(control: Control) {
		return $_('LightControllerV2').split(',').includes(control.name) ? '' : store.rooms[control.room].name;
	}

	function getStatusName(control: Control) {
		let moodList = store.getState(control.states.moodList) as MoodList[];
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
		return (activeMoodsNum < 0) ? $_('Manual') : moodList?.find((item:MoodList) => item.id == activeMoodsNum)?.name;
	}

	function getStatusColor(control: Control) {
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
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
				let control: Control | undefined = store.controlList.find( (control: Control) => control.uuidAction == light.uuid);
				let moodList = store.getState(control?.states.moodList) as MoodList[];
				let moodCmd;
				switch (mood) {
					case 'On':  moodCmd = String(moodList[0].id); break;
					case 'Off':  moodCmd = '778'; break; // TODO check if Off is always nr 778
					default: /* none */
				}
				if (control && moodList && moodCmd) {
					publishTopic(control.uuidAction, 'changeTo/' + moodCmd);
				}
			}
		});
	}

	function selectScenes() {
		if (!scenesEnabled) return; // more than one scene selected
		let light = lightList.find( item => item.selected);
		let control: Control | undefined = store.controlList.find( (control: Control) => control.uuidAction == light?.uuid);
		if (control) {
			//controlView.modal.action(false); // TODO should we close the central overview or not?
			selectedControl = control;
			selectedControlOptions = {...DEFAULT_CONTROLOPTIONS, showModal: true, showControl: false};
		}
	}
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
		contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px] { limitHeight ? 'h-full': '' }"
		backdropClasses="backdrop-blur-sm"
		backdropBackground="">
		{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
		<Info control={controlView.control}/>
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {scenesEnabled=false; controlView.modal.action(false)}}>
					<X />
				</button>
			</div>
		</header>
		<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
			<h2 class="mt-2 mb-4 text-lg text-center {lightsOn ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">{getActiveLights()}</h2>
			<div class="container grid grid-cols-3 gap-2 mb-2">
				<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('On')}>{$_('On')}</button>
				<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('Off')}>{$_('Off')}</button>
				<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm {scenesEnabled ? 'text-surface-800-200' : 'text-surface-200-800'}
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => selectScenes()}>{$_('Scenes')}</button>
			</div>
			<div class="relative flex flex-col overflow-y-auto w-full h-full">
				{#if showScrollTop}
					<div class="absolute z-10 left-[50%] lb-center top-[10px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
				{/if}
				{#if showScrollBottom}
					<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
				{/if}
				<div class="flex flex-col space-y-2 overflow-y-auto" bind:this={viewport} onscroll={parseScroll}>
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
		{/snippet}
	</Modal>

	{#if selectedControl && selectedControlOptions }
		{#key selectedControlOptions}  <!-- reinit component -->
			<LbLightControllerV2 control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
