<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import type { Control, ControlView, ModalView, LightItem, MoodList } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { store } from '$lib/stores/store.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { publishTopic } from '$lib/helpers/mqttclient';
	import fmt from 'sprintf-js';

	let { control, isSubControl = false }: { control: Control; isSubControl: boolean } = $props();

	let lightList = control.details.controls as LightItem[];
  lightList.forEach( item => item.selected = false); // default all lights unselected

	let lightsUuid = control.details.controls.map((item: LightItem) => item.uuid);
	let lightControls = store.controlList.filter(
		(controls: Control) => lightsUuid.indexOf(controls.uuidAction) > -1
	);

	let lightsOff = $derived(
		lightControls.filter((control: Control) => store.getState(control.states.activeMoodsNum) == 778)
	);

	let lightsOn =  $derived(lightList.length - lightsOff.length);

	function getActiveLights() {
		let status;
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
		},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		iconName: store.getCategoryIcon(control, isSubControl),
		iconColor: lightsOn ? '#69C350' : 'white',
		textName: control.name,
		statusName: getActiveLights(),
		statusColor: lightsOn ? '#69C350' : 'white',
		modal: modal
	});

	function getControlName(control: Control) {
		return control.name === $_('LightcontrollerV2') ? store.rooms[control.room].name : control.name;
	}

	function getStatusName(control: Control) {
		let moodList = $derived(store.getState(control.states.moodList)) as MoodList[];
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
		return (activeMoodsNum < 0) ? $_('Manual') : moodList.find((item:MoodList) => item.id == activeMoodsNum)?.name;
	}

	function getStatusColor(control: Control) {
		let activeMoodsNum = Number(store.getState(control.states.activeMoodsNum));
		return activeMoodsNum == 778 ? 'white' : '#69C350'; //TODO add color map
	}

	function selectLight(i: number) {
		lightList[i].selected = !lightList[i].selected;
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

	function scenes(){} // TODO
</script>

<LbControl bind:controlView />

<Modal
	open={controlView.modal.state}
	onOpenChange={() => controlView.modal.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
		<header class="relative">
			<div class="mb-2 flex justify-center">
				<h2 class="h4 text-center ">{controlView.textName}</h2>
			</div>
			<h2 class="text-md text-center" style="color: {lightsOn ? '#69C350' : 'white'}">{getActiveLights()}</h2>
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => controlView.modal.action(false)}>
					<X />
				</button>
			</div>
			<div class="container grid grid-cols-3 gap-2 mt-3">
				<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('On')}>{$_('On')}</button>
				<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl
																			rounded-lg border border-white/15 hover:border-white/50" onclick={() => changeLight('Off')}>{$_('Off')}</button>
				<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl
																			rounded-lg border border-white/15 hover:border-white/50"onclick={scenes}>{$_('Scenes')}</button>
			</div>
		</header>
		<div class="overflow-y-scroll" style="max-height: 575px"> <!--TODO define flex height-->
			{#each lightControls as control, index}
				{#if index > 0}
					<div class="mt-2"></div>
				{/if}
				<button class="w-full m-0 flex min-h-[50px] items-center justify-start rounded-lg border border-white/5
											{lightList[index].selected ? 'preset-tonal' : 'preset-tonal-primary'}
											bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10" onclick={() => selectLight(index)}>
					<div class="w-full">
						<div class="flex items-center truncate">
							<div class="mt-0 ml-2 mr-2 flex w-full justify-between truncate">
								<div class="flex truncate text-lg" style="color: {getStatusColor(control)}">
									<p>{getControlName(control)}</p>
								</div>
									<div class="truncate text-lg" style="color: {getStatusColor(control)}">{getStatusName(control)}</div>
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/snippet}
</Modal>
