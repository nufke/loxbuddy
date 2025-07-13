<script lang="ts">
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { Control, ControlView, ListItem } from '$lib/types/models';
	import LbSwitch from '$lib/components/lb-switch.svelte';
	import LbDimmer from '$lib/components/lb-dimmer.svelte';
	import LbColorPickerV2 from '$lib/components/lb-colorpicker-v2.svelte';
	import { X, Lightbulb, SlidersHorizontal } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let selectedItem = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let subControls = $derived( controlView.control && controlView.control.subControls ? Object.values(controlView.control.subControls) : []);
	let subControlsColorPicker = $derived(subControls.filter( control => control.type === 'ColorPickerV2'));

	let selectedTab = $state(0);
	let isLightController = $derived(controlView.control?.type=='LightControllerV2' || controlView.control?.type=='LightController');
  let id = $state(0); // selected subControl, default is first

	function setItem(i: number) {
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({checked: i});
		}
	}

	function resetTab() {
    setTimeout(() => {
      selectedTab = 0;
    }, 500);
	}
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{ controlView.modal.action(false)}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={() => {controlView.modal.action(false); resetTab();}}></div> 
	<Info control={controlView.control}/>
	{#if selectedTab==0} <!-- scenes -->
	<header class="relative">
		<div class="flex justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/5 dark:bg-surface-950">
				<LbIcon class={controlView.iconColor} name={controlView.iconName} width="36" height="36"/>
			</div>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { controlView.modal.action(false); resetTab(); }}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center m-2">
		<div>
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="mt-4 mb-2 truncate">
			<p class="text-lg truncate {controlView.statusColor}">{controlView.statusName}</p>
		</div>
		<div class="container mt-2">
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
	<header class="relative">
		<div class="flex justify-center mb-3">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { controlView.modal.action(false); resetTab(); }}>
				<X/>
			</button>
		</div>
	</header>
	<div class="overflow-y-scroll" style="max-height: 500px;">
		{#each subControls as subControl,index}
			{#if index > 0}
				<div class="mt-2"></div>
			{/if}
			{#if subControl.type=='Switch'}
				<LbSwitch control={subControl} controlOptions={{isSubControl: true}}/>
			{/if}
			{#if subControl.type=='Dimmer'}
				<LbDimmer control={subControl} controlOptions={{isSubControl: true}}/>
			{/if}
			{#if subControl.type=='ColorPickerV2'}
				<LbDimmer control={subControl} controlOptions={{isSubControl: true, action: ()=>{id=index; selectedTab=2}}}/>
			{/if}
		{/each}
	</div>
	{/if}
	{#if selectedTab==2 && subControlsColorPicker.length } <!-- colors -->
	<header class="relative">
		<div class="flex justify-center mb-3">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => { controlView.modal.action(false); resetTab(); }}>
				<X/>
			</button>
		</div>
	</header>
	<div class="overflow-y-scroll" style="max-height: 500px;">
	{#if subControls[id].type === "Dimmer" || subControls[id].type === "ColorPickerV2" }
		<LbDimmer control={subControls[id]} controlOptions={{isSubControl: true}}/>
		<LbColorPickerV2 control={subControls[id]}/>
	{/if}
	</div>
	{/if}
	{#if isLightController}
	<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
		<div class="grid h-full max-w-lg {subControlsColorPicker.length ? 'grid-cols-3' : 'grid-cols-2'}  mx-auto">
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
	{/snippet}
</Modal>
