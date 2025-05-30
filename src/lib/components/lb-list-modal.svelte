<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { ControlView, ListItem } from '$lib/types/models';
	import { EMPTY_CONTROL } from '$lib/types/models';
	import LbSwitch from '$lib/components/lb-switch.svelte';
	import LbDimmer from '$lib/components/lb-dimmer.svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import LucideIcon from './icon-by-name.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let control = controlView.control ? controlView.control : EMPTY_CONTROL; // if no control, then use empty control

	let index = $derived(controlView.list ? controlView.list.findIndex( (item: ListItem) => { return item.name === controlView.statusName }) : 0);
	let subControls = $derived( controlView.control && controlView.control.subControls ? Object.values(controlView.control.subControls) : []);
	let selectedTab = $state(0);
	let isLightController = $derived(controlView.control?.type=='LightControllerV2' || controlView.control?.type=='LightController');

	function setColor(i: number) {
		if (i==index) {
			return 'preset-tonal'
		} else {
			return 'preset-tonal-primary' 
		}
	}

	function setItem(i: number) {
		if (controlView && controlView.buttons && controlView.buttons[0]) {
			controlView.buttons[0].click({checked: i});
		}
	}
</script>

<Modal
	open={controlView.modal.state}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}

	{#if selectedTab==0}

	<header class="relative">
		<div class="flex justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full dark:bg-surface-950">
				<svg use:inlineSvg={'/loxicons/' + controlView.iconName} fill={controlView.iconColor} width="36" height="36"></svg>
			</div>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>controlView.modal.action(false)}>
				<X/>
			</button>
		</div>
	</header>

	<div class="flex flex-col items-center justify-center m-2">
		<div>
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
			<div class="mt-4 mb-2 truncate">
			<p class="text-lg truncate" style="color: {controlView.statusColor}">{controlView.statusName}</p>
		</div>
		<div class="container mt-2">
		{#if controlView.list}
			{#each controlView.list as listItem, index}
				<button type="button" class="w-full mt-2 btn btn-lg {setColor(index)} shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); setItem(index)}}>
						<span>{$_(listItem.name)}</span>
				</button>
				{/each}
		{/if}
		</div>
	</div>
	{/if}

	{#if selectedTab==1} 
	<header class="relative">
		<div class="flex justify-center mb-3">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>controlView.modal.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="overflow-y-scroll" style="max-height: 500px; scrollbar-width: none;">
		{#each subControls as subControl,index}
			{#if index > 0}
				<div class="mt-3"></div>
			{/if}
			{#if subControl.type=='Switch'}
				<LbSwitch control={subControl} isSubControl={true}/>
			{/if}
			{#if subControl.type=='Dimmer' || subControl.type=='ColorPickerV2' }
				<LbDimmer control={subControl} isSubControl={true}/>
			{/if}
			{/each}
	</div>
	{/if}

	{#if isLightController}
	<div class="sticky bottom-0 left-0 w-full h-16 pt-2">
		<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-green-500' : ''} " onclick={() => selectedTab=0}>
					<LucideIcon name='Lightbulb'/>
					<span class="mt-1 text-xs">Scenes</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-green-500' : ''} " onclick={() => selectedTab=1}>
					<LucideIcon name='SlidersHorizontal'/>
					<span class="mt-1 text-xs">Control</span>
				</button>
		</div>
	</div>
	{/if}
	{/snippet}
</Modal>
