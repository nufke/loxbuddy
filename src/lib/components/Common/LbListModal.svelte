<script lang="ts">
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { Control, ControlView, ListItem } from '$lib/types/models';
	import { fade } from 'svelte/transition';
	import LbSwitch from '$lib/components/Switch/LbSwitch.svelte';
	import LbLightDimmer from '$lib/components/LightController/LbLightDimmer.svelte';
	import LbColorPickerV2 from '$lib/components/LightController/LbColorpickerV2.svelte';
	import { X, Lightbulb, SlidersHorizontal, ChevronUp, ChevronDown } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let selectedItem = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let subControls = $derived( controlView.control && controlView.control.subControls ? Object.values(controlView.control.subControls) : []);
	let subControlsColorPicker = $derived(subControls.filter( control => control.type === 'ColorPickerV2'));

	let selectedTab = $state(0);
	let isLightController = $derived(controlView.control?.type=='LightControllerV2' || controlView.control?.type=='LightController');
  let id = $derived(subControls.findIndex( subControl => subControl.type === 'ColorPickerV2')); // select first color subControl

	let viewportTab0: any = $state(); // TODO make HTMLDivElement
	let hasScrollTab0 = $state(true);
  let showScrollTopTab0 = $state(false);
	let showScrollBottomTab0 = $state(true);

	let viewportTab1: any = $state(); // TODO make HTMLDivElement
	let hasScrollTab1 = $state(true);
  let showScrollTopTab1 = $state(false);
	let showScrollBottomTab1 = $state(true);

	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(false);

	function setItem(i: number) {
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({checked: i});
		}
	}

	function parseScrollTab0() {
		hasScrollTab0 = viewportTab0?.scrollHeight > viewportTab0?.clientHeight;
    showScrollTopTab0 = limitHeight && hasScrollTab0 && (viewportTab0?.scrollTop > 10);
		showScrollBottomTab0 = limitHeight && hasScrollTab0 && (viewportTab0.scrollTop + viewportTab0?.clientHeight < (viewportTab0?.scrollHeight - 10));
  }

		function parseScrollTab1() {
		hasScrollTab1 = viewportTab1?.scrollHeight > viewportTab1?.clientHeight;
    showScrollTopTab1 = limitHeight && hasScrollTab1 && (viewportTab1?.scrollTop > 10);
		showScrollBottomTab1 = limitHeight && hasScrollTab1 && (viewportTab1.scrollTop + viewportTab1?.clientHeight < (viewportTab1?.scrollHeight - 10));
  }
	$effect( () => {
		parseScrollTab0();
	});

	$effect( () => {
		parseScrollTab1();
	});

	$effect( () => {
		if (windowHeight && modalViewport) { /* trigger on windowHeight change */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 3) < 0;
			});
		}
	});

	async function close() {
		controlView.modal.action(false);
		await tick();
		selectedTab = 0;
	}
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
							md:max-w-9/10 md:max-h-9/10 {controlView.modal.size?.width || 'w-[450px]'} { limitHeight ? 'h-full' : ''}"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={close}></div> 
	<Info control={controlView.control}/>
	<header class="relative">
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={close}>
				<X/>
			</button>
		</div>
	</header>
	<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
		<p class="h5 flex mb-4 text-center items-center justify-center w-[80%]">{controlView.textName}</p>
		{#if selectedTab==0} <!-- scenes -->
		<div class="flex flex-col items-center justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
				<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"/>
			</div>
			<div class="flex items-center justify-center mt-2">
				<p class="text-lg truncate {controlView.statusColor}">{controlView.statusName}</p>
			</div>
		</div>
		<div class="flex flex-col relative w-full overflow-y-auto h-full mt-2">
				{#if showScrollTopTab0}
					<div class="absolute z-10 left-[50%] lb-center top-[17px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
				{/if}
				{#if showScrollBottomTab0}
					<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
				{/if}
			<div class="flex flex-col overflow-y-auto w-full h-full" bind:this={viewportTab0} onscroll={parseScrollTab0}>
				{#if controlView.list}
					{#each controlView.list as listItem, index}
					<button type="button" class="w-full mt-2 btn btn-lg {(index==selectedItem) ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
								 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); setItem(index)}}>
								<span class="text-lg">{$_(listItem.name)}</span>
					</button>
					{/each}
				{/if}
			</div>
		</div>
		{/if}
		{#if selectedTab==1} <!-- control -->
		<div class="flex flex-col relative w-full overflow-y-auto h-full">
			{#if showScrollTopTab1}
				<div class="absolute z-10 left-[50%] lb-center top-[17px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronUp size="30"/></div>
			{/if}
			{#if showScrollBottomTab1}
				<div class="absolute z-10 left-[50%] lb-center -bottom-[19px] text-surface-500" transition:fade={{ duration: 300 }}><ChevronDown size="30"/></div>
			{/if}
		<div class="flex flex-col overflow-y-auto h-full" bind:this={viewportTab1} onscroll={parseScrollTab1}>
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
					<LbLightDimmer control={subControl} controlOptions={{isSubControl: true, action: ()=>{id=index; selectedTab=2}}}/>
				{/if}
			{/each}
		</div>
		</div>
		{/if}
		{#if selectedTab==2 && subControlsColorPicker.length } <!-- colors -->
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
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=0}>
					<Lightbulb/>
					<span class="mt-1 text-xs">{$_("Scenes")}</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=1}>
					<SlidersHorizontal/>
					<span class="mt-1 text-xs">{$_("Controls")}</span>
				</button>
				{#if subControlsColorPicker.length}
					<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=2}>
						<LbIcon name={"/icons/svg/streamline--color-palette.svg"} fill="white" width="24" height="24"/>
						<span class="mt-1 text-xs">{$_("Colors")}</span>
					</button>
				{/if}
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
