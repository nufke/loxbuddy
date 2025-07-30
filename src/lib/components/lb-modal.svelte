<script lang="ts">
	import type { Control, ControlView, ControlOptions } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbSimpleSlider from '$lib/components/lb-simple-slider.svelte';
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
	import { format } from 'date-fns';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

  let value = $derived(controlView.slider && controlView.slider.position? [controlView.slider.position] : [0]);
	let min = $derived(controlView.slider ? controlView.slider.min : 0);
	let max = $derived(controlView.slider ? controlView.slider.max : 100);
	let step = $derived(controlView.slider ? controlView.slider.step : 1);
	let orientation = $derived(controlView.slider ? controlView.slider.orientation : '');

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
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 {controlView.modal.size?.width || 'w-[450px]'} {controlView.modal.size?.height || ''}
							 {linkedControls.length > 1 ? 'lg:w-[760px]': ''}"
	backdropClasses={ controlView.modal.noBlur ? "" : "backdrop-blur-sm"}
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop?-->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
	<!--<Info control={controlView.control}/>-->
	<header class="relative">
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>controlView.modal.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center h-full">
		<h2 class="flex h4 text-center items-center justify-center w-[80%]">{controlView.textName}</h2>
		<div class="flex justify-center mt-4">
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
		</div>
		<div class="m-2 truncate">
			{#if controlView.statusName && !controlView.modal.details?.tracker} <!-- remove status when we show a tracker -->
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
		{#if controlView && controlView.slider && controlView.slider.position >= min}
		<div class="container flex justify-center items-center m-2 p-0">
		{#if controlView.slider.orientation?.length} <!-- use simple-slider for vertical orientation -->
			<LbSimpleSlider classes='dimmer' {orientation}
										{min} {max} {step} {value} onValueChange={(e: any) => {setPostion(e.value)}}/>
		{:else}
			<Slider classes="mt-6 ml-2 mr-2 mb-2" thumbSize="size-5" name="example" {value} {min} {max} {step} onValueChange={(e: any) => setPostion(e.value)} markers={[min, max]}
							markText="size-8" markersClasses="-mt-11 ml-2 -mr-2"/>
		{/if}
		</div>
		{/if}
		{#if controlView && controlView.modal && controlView.modal.buttons}
		<div class="container grid grid-cols-1 {controlView.modal.class} gap-2 m-2">
			{#each controlView.modal.buttons as button, index}
				{#if button.type === 'button' && button.click}
					<button type="button" class="w-full {button.class} btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
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
							<Switch controlClasses="w-12 h-8" name="slide" controlActive="dark:bg-primary-500 bg-primary-700" controlInactive="preset-filled-surface-300-700" thumbInactive="bg-white" checked={controlView.buttonState} onCheckedChange={button.click} />
						</div>
					</button>
				{/if}
			{/each}
		</div>
		{/if}
		{#if controlView.modal && controlView.modal.details && controlView.modal.details.tracker} <!-- used for entries for tracker-->
		<div class="flex flex-col w-full mt-2 pl-2 pr-2 h-full overflow-y-auto">
			{#each Object.keys(controlView.modal.details.tracker) as key}
				<p class="text-lg dark:text-surface-50 text-surface-950">{format(new Date(Number(key)), "PPP")}</p>
				<hr class="hr" />
				<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
					{#each controlView.modal.details.tracker[key] as item}
						<p class="text-md dark:text-surface-300 text-surface-700">{format(new Date(Number(item.time)), "p")}</p>
						<p class="text-md col-span-4">{item.description}</p>
					{/each}
				</div>
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
			<div bind:this={viewport} onscroll={parseScroll} class="relative grid grid-cols-1 { linkedControls.length > 1 ? 'lg:grid-cols-2' : ''} gap-2 max-h-[415px] overflow-y-auto">
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
