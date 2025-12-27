<script lang="ts">
	import type { Control, ControlView, ControlOptions } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbSimpleSlider from '$lib/components/Common/LbSimpleSlider.svelte';
	import LbStatusBar from '$lib/components/Common/LbStatusBar.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { lbControl } from '$lib/helpers/LbControl';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { XIcon, ChevronUpIcon, ChevronDownIcon } from '@lucide/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { format } from 'date-fns';
	import { innerHeight } from 'svelte/reactivity/window';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let viewport: any = $state(); // TODO make HTMLDivElement
	let hasScroll = $state(true);
	let showScrollTop = $state(false);
	let showScrollBottom = $state(true);

	let value = $derived(controlView.slider && controlView.slider.position? [controlView.slider.position] : [0]);
	let min = $derived(controlView.slider ? controlView.slider.min : 0);
	let max = $derived(controlView.slider ? controlView.slider.max : 100);
	let step = $derived(controlView.slider ? controlView.slider.step : 1);
	let orientation = $derived(controlView.slider ? controlView.slider.orientation : 'horizontal');
	let locked = $derived(controlView.slider ? controlView.slider.locked : false);
	let controlOptions: ControlOptions = $derived({...DEFAULT_CONTROLOPTIONS, isLink: true});

	let windowHeight = $derived(innerHeight.current || 0);
	let margin = $derived(getMargin(controlView.control));
	let size = $derived(windowHeight * 0.9 - viewport?.clientHeight - margin || 0);
	let style = $derived(size > 0 && viewport?.clientHeight == viewport?.scrollHeight ? 'height: 100%' : 'height: ' + (viewport?.clientHeight + size) + 'px');

	function setPostion(position: any) {
		let pos: number = position.length ? position[0] : position; // skeleton Slider returns array, select first one
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({sliderPosition: pos});
		}
	}

	function getStatusColorHex(hexColor: string|undefined) {
		return (hexColor && hexColor[0] == '#') ? 'color: ' + hexColor : '';
	}

	function getIconColorHex(hexColor: string | undefined) {
		return (hexColor && hexColor[0] == '#') ? 'fill: ' + hexColor : '';
	}

	function getPowerLevel(n: number) {
		return (n.toLocaleString(appStore.locale, { minimumFractionDigits: 1 })) + ' kW max.';
	}

	function getPowerStatus(mask: number) {
		const statusLoads = controlView.dialog.details.loadManager.statusLoads & (mask+1);
		const lockedLoads = controlView.dialog.details.loadManager.lockedLoads & (mask+1);
		return { 
			name: lockedLoads ? $_('Locked') : (statusLoads ? $_('On') : $_('Off')),
			color: lockedLoads ? 'dark:text-error-500 text-error-700' : (statusLoads ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700')
		}
	}

	let linkedControls: Control[] = $derived(
		controlStore.controlList.filter((control) => controlView.links ? controlView.links.includes(control.uuidAction) : null)
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale)));

	function getMargin(control: Control) {
		let margin: number = 200;
		switch(control.type) {
			case 'Switch': margin = 100; break;
			case 'Alarm': margin = 250; break;
			case 'TextState': margin = 250; break;
			case 'LoadManager': margin = 300; break;
			
			default: console.info(`[LbDialog] No margin specified for ${control.type}, default margin of ${margin}px used`);
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

	function close() {
		controlView.dialog.action(false);
	}
</script>

{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px]">
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
						<div class="mt-3">
							<div class="flex flex-col items-center justify-center">
								{#if !controlView.dialog.disableIcon}
								<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
									<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"
													style={getIconColorHex(controlView.iconColor)}/>
									{#if controlView.badgeIconName?.length}
										<div class="absolute top-[9px] left-[10px] inline-flex items-center justify-center w-[18px] h-[18px] {controlView.badgeIconColor} rounded-full
																border border-1 dark:border-surface-950 border-surface-50">
											<LbIcon class='dark:text-surface-950 text-surface-50' name={controlView.badgeIconName} size="10"/>
										</div>
									{/if}
								</div>
								{/if}
								<div class="flex flex-col justify-center items-center m-2 truncate">
									{#if controlView.statusName && !controlView.dialog.details?.tracker} <!-- remove status when we show a tracker -->
										<p class="text-lg truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>{$_(controlView.statusName)}</p>
									{/if}
								</div>
							</div>
							{#if controlView.buttons.length && !controlView.slider && !controlView.dialog.buttons}
							<div class="w-full grid grid-cols-1 {controlView.dialog.class} gap-2 overflow-y-auto" {style} bind:this={viewport} >
								{#each controlView.buttons as button, index}
									{#if button.type === 'button' && button.click}
										<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
												onclick={(e) => {e.stopPropagation(); e.preventDefault(); button.click();}}>
												{#if button.name}
													<span>{$_(button.name)}</span>
												{:else}
													<span>
														<LbIcon name={button.iconName}/>
													</span>
												{/if}
										</button>
									{/if}
									{#if button.type == 'switch' && button.name }
										<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
												onclick={(e) => {e.stopPropagation(); e.preventDefault(); button.click({checked: !controlView.buttonState})}}>
											<span style="font-size:18px">{$_(button.name)}</span>
										</button>
									{/if}
								{/each}
							</div>
							{/if}
							{#if controlView && controlView.slider && controlView.slider.position >= min}
								<div class="container flex justify-center items-center p-1 pb-3">
									{#if controlView.control?.type=='Dimmer'}
										<LbSimpleSlider classes='dimmer' {orientation} {min} {max} {step} {locked} {value} onValueChange={(e: any) => {setPostion(e.value)}}/>
									{:else}
										<Slider thumbSize={{ width: 20, height: 20}} {value} {min} {max} {step} onValueChange={(e: any) => setPostion(e.value)}> <!-- TODO thumbSize not working??-->
											<Slider.Control>
												<Slider.Track>
													<Slider.Range />
												</Slider.Track>
												<Slider.Thumb index={0}  >
													<Slider.HiddenInput />
												</Slider.Thumb>
											</Slider.Control>
											<Slider.MarkerGroup>
												<Slider.Marker value={min} />
												<Slider.Marker value={max} />
											</Slider.MarkerGroup>
										</Slider>
									{/if}
								</div>
							{/if}
							{#if controlView && controlView.dialog && controlView.dialog.buttons}
							<div class="container grid grid-cols-1 {controlView.dialog.class} gap-2 overflow-y-auto" {style} bind:this={viewport}>
								{#each controlView.dialog.buttons as button}
									{#if button.type === 'button' && button.click}
										<button type="button" class="w-full {button.class} btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
												onclick={button.click}>
												{#if button.name}
													<span class="text-lg">{$_(button.name)}</span>
												{:else}
													<LbIcon name={button.iconName}/>
												{/if}
										</button>
									{/if}
									{#if button.type == 'switch' && button.name}
										<button class="btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
											<div class="flex w-full justify-between">
												<h1 class="truncate text-lg">{$_(button.name)}</h1>
												<Switch checked={controlView.buttonState} onCheckedChange={button.click}>
													<Switch.Control class="w-12 h-8 data-[state=checked]:preset-filled-primary-500">
														<Switch.Thumb />
													</Switch.Control>
													<Switch.HiddenInput />
												</Switch>
											</div>
										</button>
									{/if}
								{/each}
							</div>
							{/if}
							{#if controlView.dialog && controlView.dialog.details && controlView.dialog.details.tracker} <!-- used for entries for tracker -->
							<div class="flex flex-col w-full mt-2 pl-2 pr-2 overflow-y-auto" {style} bind:this={viewport}>
								{#each Object.keys(controlView.dialog.details.tracker) as key}
									<p class="text-lg dark:text-surface-50 text-surface-950">{format(new Date(Number(key)), "PPP")}</p>
									<hr class="hr" />
									<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
										{#each controlView.dialog.details.tracker[key] as item}
											<p class="text-md dark:text-surface-300 text-surface-700">{format(new Date(Number(item.time)), "p")}</p>
											<p class="text-md col-span-4">{item.description}</p>
										{/each}
									</div>
								{/each}
							</div>
							{/if}
							{#if controlView.dialog && controlView.dialog.details && controlView.dialog.details.loadManager}
								<div class="w-full mb-2 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50">
									<LbStatusBar maxPower={controlView.dialog.details.loadManager.maxPower}
																currentPower={controlView.dialog.details.loadManager.currentPower}
																mode={controlView.dialog.details.loadManager.mode} />
								</div>
								<div class="relative flex flex-col w-full">
									{#if showScrollTop}
										<div class="absolute z-10 left-[50%] lb-center top-[11px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUpIcon size="30"/></div>
									{/if}
									{#if showScrollBottom}
										<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDownIcon size="30"/></div>
									{/if}
									<div class="grid gap-2 overflow-y-auto" {style} bind:this={viewport}>
										{#each controlView.dialog.details.loadManager.loads as load,i}
											<button class="w-full flex h-[60px] items-center justify-start rounded-lg border border-white/15 hover:border-white/50
																		dark:bg-surface-950 bg-surface-50 px-2 py-2">
												<div class="relative flex truncate w-full">
													<div class="mt-0 ml-2 mr-2 flex flex-row w-full justify-between truncate items-center h-[60px]">
														<div class="flex flex-col">
															<p class="leading-6 truncate text-lg text-left">{load.name}</p>
															<p class="truncate text-left text-xs dark:text-surface-300 text-surface-700">{getPowerLevel(load.power)}</p>
														</div>
														{#if load.hasStatus}
															<p class="text-left text-lg {getPowerStatus(i).color}">{getPowerStatus(i).name}</p>
														{/if}
													</div>
												</div>
											</button>
										{/each}
									</div>
								</div>
							{/if}
							{#if linkedControls.length}
							<div class="flex flex-col relative w-full mt-2">
								{#if showScrollTop}
									<div class="absolute z-10 left-[50%] lb-center top-[11px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUpIcon size="30"/></div>
								{/if}
								{#if showScrollBottom}
									<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDownIcon size="30"/></div>
								{/if}
								<div class="grid grid-cols-1 gap-2
									{linkedControls.length > 1 ? 'lg:grid-cols-2' : ''}
									{linkedControls.length > 2 ? 'xl:grid-cols-3' : ''}
									lg:flex-wrap overflow-y-auto" bind:this={viewport} onscroll={() => parseScroll(windowHeight, viewport)} {style}>
									{#each linkedControls as control}
										{@const Component = lbControl.getControl(control.type)}
										<Component {control} controlOptions={controlOptions}/>
									{/each}
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
