<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbLightControllerV2 from '$lib/components/lb-lightcontroller-v2.svelte'
	import type { Control, ControlOptions, ControlView, ModalView, LightItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/communication/mqttclient';
	import fmt from 'sprintf-js';
	import { fade200 } from '$lib/helpers/transition';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let selectedControl: Control | undefined= $state();
	let selectedControlOptions: ControlOptions | undefined = $state();

	let lightList = control.details.controls as LightItem[];
	lightList.forEach( item => item.selected = false ); // default all lights unselected

	let lightsUuid = control.details.controls.map((item: LightItem) => item.uuid);
	let lightControls = store.controlList.filter(
		(controls: Control) => lightsUuid.indexOf(controls.uuidAction) > -1
	);

	let lightsOff = $derived(
		lightControls.filter((control: Control) => store.getState(control.states.activeMoodsNum) == 778)
	);

	let lightsOn =  $derived(lightList.length - lightsOff.length);
	let selectedLightCount = $derived(lightList.filter( item => item.selected == true).length);

	let scenesEnabled = $state(false);

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

	let modal: ModalView = $state({
		action: (state: boolean) => {
			modal.state = state;
			if (!state) resetState()
		},
		state: false
	});

	function resetState() {
		lightList.forEach( item => item.selected = false ); // empty selected lights
		selectedControl = undefined;
		selectedControlOptions = undefined;
	}

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		iconColor: lightsOn ? 'fill-primary-500' : 'fill-surface-950 dark:fill-surface-50',
		textName: control.name,
		statusName: getActiveLights(),
		statusColor: lightsOn ? 'text-primary-500' : 'text-surface-500',
		modal: modal
	});

	function getControlName(control: Control) {
		return control.name === $_('LightControllerV2') ? store.rooms[control.room].name : control.name;
	}

	function getStatusName(control: Control) {
		let moodList = store.getState(control.states.moodList) as MoodList[];
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
		return (activeMoodsNum < 0) ? $_('Manual') : moodList?.find((item:MoodList) => item.id == activeMoodsNum)?.name;
	}

	function getStatusColor(control: Control) {
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
		return activeMoodsNum == 778 ? 'text-surface-950 dark:text-surface-50' : 'text-primary-500';
	}

	function selectLight(i: number) {
		lightList[i].selected = !lightList[i].selected;
		scenesEnabled = selectedLightCount == 1;
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
			controlView.modal.action(false);
			selectedControl = control;
			selectedControlOptions = {...DEFAULT_CONTROLOPTIONS, showModal: true, showControl: false};
		}
	}
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
				<h2 class="text-lg text-center {lightsOn ? 'text-primary-500' : 'text-surface-500'}">{getActiveLights()}</h2>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
						<X />
					</button>
				</div>
				<div class="container grid grid-cols-3 gap-2 mt-4">
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('On')}>{$_('On')}</button>
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm text-surface-950-50
																				rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('Off')}>{$_('Off')}</button>
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm {scenesEnabled ? 'text-surface-800-200' : 'text-surface-200-800'}
																				rounded-lg border border-white/15 hover:border-white/50" onclick={() => selectScenes()}>{$_('Scenes')}</button>
				</div>
			</header>
			<div class="overflow-y-scroll" style="max-height: 575px">
				{#each lightControls as control, index}
					{#if index > 0}
						<div class="mt-2"></div>
					{/if}
					<button class="w-full m-0 flex min-h-[50px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
												{lightList[index].selected ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50'} px-2 py-2"
												onclick={() => selectLight(index)}>
						<div class="w-full">
							<div class="flex items-center truncate">
								<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
									<p class="truncate text-lg {getStatusColor(control)}">{getControlName(control)}</p>
									<p class="text-lg {getStatusColor(control)}">{getStatusName(control)}</p>
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
			<LbLightControllerV2 control={selectedControl} controlOptions={selectedControlOptions}/>
		{/key}
	{/if}
</div>
