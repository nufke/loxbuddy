<script lang="ts">
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { Dialog, Portal  } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlView, ListItem } from '$lib/types/models';
	import { fade } from 'svelte/transition';
	import LbSwitch from '$lib/components/Switch/LbSwitch.svelte';
	import LbLightDimmer from '$lib/components/LightController/LbLightDimmer.svelte';
	import LbColorPickerV2 from '$lib/components/LightController/LbColorpickerV2.svelte';
	import { _ } from 'svelte-i18n';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let viewport: any = $state(); // TODO make HTMLDivElement
	let selectedTab = $state(1); // default first tab
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(false);

	let selectedItem = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let subControls = $derived( controlView.control && controlView.control.subControls ? Object.values(controlView.control.subControls) : []);
	let subControlsColorPicker = $derived(subControls.filter( control => control.type === 'ColorPickerV2'));
	let isLightController = $derived(controlView.control?.type=='LightControllerV2' || controlView.control?.type=='LightController');
	let id = $derived(subControls.findIndex( subControl => subControl.type === 'ColorPickerV2')); // select first color subControl
	let windowHeight = $derived(innerHeight.current || 0);
	let margin = $derived(getMargin(controlView.control, selectedTab));
	let size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin || 0);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	function setItem(i: number) {
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({checked: i});
		}
	}

	function getMargin(control: Control, tab: number) {
		let margin: number = 180;
		switch(control.type) {
			case 'LightControllerV2': const lc = [300,200]; margin = lc[tab-1]; break;
			case 'LightController': const lcv2 = [300,200]; margin = lcv2[tab-1]; break;
			case 'Radio': margin = 180; break;
			default: console.debug(`[LbListDialog] no marin specified for ${control.type}, default 200 used`);
		}
		return margin;
	}

	$effect( () => { // check scroll status and window change and viewwport construction
		parseScroll(windowHeight, viewport);
	});

	function parseScroll(height: number, view: any = undefined) {
		if (!view) return;
		hasScroll = view.scrollHeight > view.clientHeight;
		showScrollTop = height > 0 && hasScroll && (view?.scrollTop > 10);
		showScrollBottom = height > 0 && hasScroll && (view.scrollTop + view.clientHeight < (view.scrollHeight - 10));
	}

	async function close() {
		controlView.dialog.action(false);
		await tick();
		selectedTab = 1;
	}
</script>

{#if controlView.dialog.state} <!-- only construct dialog when needed, important to get current clientHeight -->
	<Dialog 
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal >
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 {controlView.dialog.size?.width || 'w-[450px]'}">
					<LbInfo control={controlView.control}/>
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
					<Dialog.Description>
						<div class="mt-3">
							{#if selectedTab==1} <!-- scenes -->
								<div class="flex flex-col items-center justify-center">
									<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
										<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"/>
									</div>
									<div class="flex items-center justify-center mt-2">
										<p class="text-lg truncate {controlView.statusColor}">{controlView.statusName}</p>
									</div>
								</div>
								<div class="flex flex-col relative w-full mt-2">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[10px] text-surface-500" transition:fade={{ duration: 300 }}><LbIcon name="chevron-up" height="30" width="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><LbIcon name="chevron-down" height="30" width="30"/></div>
									{/if}
									<div class="flex flex-col overflow-y-auto w-full" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
										{#if controlView.list}
											<div class="grid gap-2">
												{#each controlView.list as listItem, index}
												<button type="button" class="w-full gap-2 btn btn-lg {(index==selectedItem) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
															shadow-sm rounded-lg border border-white/15 hover:border-white/50"
																onclick={(e) => { e.stopPropagation(); e.preventDefault(); setItem(index)}}>
															<span class="text-lg">{$_(listItem.name)}</span>
												</button>
												{/each}
											</div>
										{/if}
									</div>
								</div>
							{/if}
							{#if selectedTab==2} <!-- control -->
								<div class="flex flex-col relative w-full">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[10px] text-surface-500" transition:fade={{ duration: 300 }}><LbIcon name="chevron-up" height="30" width="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><LbIcon name="chevron-down" height="30" width="30"/></div>
									{/if}
									<div class="overflow-y-auto" {style} bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)}>
										{#each subControls as subControl,index}
											{#if index > 0}
												<div class="mt-2"></div>
											{/if}
											{#if subControl.type=='Switch'}
												<LbSwitch control={subControl} controlOptions={{isSubControl: true}}/>
											{/if}
											{#if subControl.type=='Dimmer'}
												<LbLightDimmer control={subControl} controlOptions={{isSubControl: true}}/>
											{/if}
											{#if subControl.type=='ColorPickerV2'}
												<LbLightDimmer control={subControl} controlOptions={{isSubControl: true, action: ()=>{id=index; selectedTab=3}}}/>
											{/if}
										{/each}
									</div>
								</div>
							{/if}
							{#if selectedTab==3 && subControlsColorPicker.length} <!-- colors -->
							<div class="relative w-full">
								<div class="container">
									{#if subControls[id].type === "Dimmer" || subControls[id].type === "ColorPickerV2" }
										<LbLightDimmer control={subControls[id]} controlOptions={{isSubControl: true}}/>
										<LbColorPickerV2 control={subControls[id]}/>
									{/if}
								</div>
							</div>
							{/if}
							{#if isLightController}
								<div class="relative w-full mt-6 mb-2">
									<div class="grid max-w-lg {subControlsColorPicker.length ? 'grid-cols-3' : 'grid-cols-2'}">
										<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => { viewport = undefined; selectedTab=1;} }>
											<LbIcon name="lightbulb"/>
											<span class="mt-1 text-xs">{$_("Scenes")}</span>
										</button>
										<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => { viewport = undefined; selectedTab=2;} }>
											<LbIcon name="sliders-horizontal"/>
											<span class="mt-1 text-xs">{$_("Controls")}</span>
										</button>
										{#if subControlsColorPicker.length}
											<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==3 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => { viewport = undefined; selectedTab=3;}}>
												<LbIcon name="color-palette" fill="white" width="24" height="24"/>
												<span class="mt-1 text-xs">{$_("Colors")}</span>
											</button>
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
