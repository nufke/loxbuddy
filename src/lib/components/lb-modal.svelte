<script lang="ts">
	import type { Control, ControlView, ControlOptions } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { getComponent } from '$lib/helpers/components';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import { fade } from 'svelte/transition'
	import Info from '$lib/components/lb-info.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

  let value = $derived(controlView.slider && controlView.slider.position? [controlView.slider.position] : [0]);
	let min = $derived(controlView.slider ? controlView.slider.min : 0);
	let max = $derived(controlView.slider ? controlView.slider.max : 100);
	let step = $derived(controlView.slider ? controlView.slider.step : 1);

	function setPostion(pos: number[]) {
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({sliderPosition: pos[0]});
		}
	}

	function getStatusColorHex(hexColor: string|undefined) {
		return (hexColor && hexColor[0] == '#') ? 'color: ' + hexColor : '';
	}

	function getIconColorHex(hexColor: string | undefined) {
		return (hexColor && hexColor[0] == '#') ? 'fill: ' + hexColor : '';
	}
	
	let linkedControls: Control[] = $derived(
		store.controlList.filter((control) => controlView.links ? controlView.links.includes(control.uuidAction) : null)
			.sort((a, b) => a.name.localeCompare(b.name)));

	let controlOptions: ControlOptions = $derived({...DEFAULT_CONTROLOPTIONS, isLink: true});

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
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[380px] {linkedControls.length ? 'lg:w-[760px]': ''}"
	backdropClasses={ controlView.modal.noBlur ? "" : "backdrop-blur-sm"}
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75"></div>
	<Info control={controlView.control}/>
	<header class="relative">
		<div class="flex justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
				<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"
								style={getIconColorHex(controlView.iconColor)}/>
			</div>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>controlView.modal.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center mt-2">
		<div>
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="m-2 truncate">
			{#if controlView.statusName}
				<p class="text-lg truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>{$_(controlView.statusName)}</p>
			{/if}
		</div>
		{#if controlView.buttons.length && !controlView.slider && !controlView.modal.buttons}
		<div class="container flex m-2">
			{#each controlView.buttons as button, index}
				{#if index > 0}
					<div class="ml-2"></div>
				{/if}
				{#if button.type === 'button' && button.click}
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
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
		{#if controlView && controlView.slider && controlView.slider.position}
		<div class="container flex m-2 p-0">
	 	 <Slider classes="mt-6 ml-2 mr-2 mb-2" thumbSize="size-5" name="example" {value} {min} {max} {step} onValueChange={(e) => setPostion(e.value)} markers={[min, max]}
				markText="size-8" markersClasses="-mt-11 ml-2 -mr-2"/>
		</div>
		{/if}
		{#if controlView && controlView.modal && controlView.modal.buttons}
		<div class="container grid grid-cols-1 gap-2 m-2">
			{#each controlView.modal.buttons as button, index}
				{#if button.type === 'button' && button.click}
					<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
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
							<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-primary-500" checked={controlView.buttonState} onCheckedChange={button.click} />
						</div>
					</button>
				{/if}
			{/each}
		</div>
		{/if}
		{#if linkedControls}
		<div class="container relative w-full">
			{#if showScrollTop}
				<div class="absolute z-10 left-[50%] lb-center top-3 text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
			{/if}
			{#if showScrollBottom}
				<div class="absolute z-10 left-[50%] lb-center -mb-4 bottom-0 text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
			{/if}
			<div bind:this={viewport} onscroll={parseScroll} class="relative grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-[415px] overflow-y-auto">
				{#each linkedControls as control}
					{@const Component = getComponent(control.type)}
					<Component {control} controlOptions={controlOptions}/>
				{/each}
			</div>
		</div>
		{/if}
	</div>
	{/snippet}
</Modal>

<style>
	.lb-center {
		transform: translate(-50%, -50%);
	}
</style>
