<script lang="ts">
	import type { ControlView } from '$lib/types/models';
	import LucideIcon from './icon-by-name.svelte';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { X } from '@lucide/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';

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
</script>

<Modal
	open={controlView.modal.state}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full dark:bg-surface-950">
				<svg class={controlView.iconColor} use:inlineSvg={'/loxicons/' + controlView.iconName} width="36" height="36"></svg>
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
			<p class="text-lg truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>{controlView.statusName}</p>
		</div>
		{#if controlView.buttons.length && !controlView.slider && !controlView.modal.buttons}
		<div class="container flex m-2">
			{#each controlView.buttons as button, index}
				{#if index > 0}
					<div class="ml-2"></div>
				{/if}
				{#if button.type === 'button' && button.click}
					<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
							onclick={(e) => {e.stopPropagation(); e.preventDefault(); button.click}}>
							{#if button.name}
								<span>{$_(button.name)}</span>
							{:else}
								<span>
									<LucideIcon name={button.iconName}/>
								</span>
							{/if}
					</button>
				{/if}
				{#if button.type == 'switch' && button.name }
					<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
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
					<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
							onclick={button.click}>
							{#if button.name}
								<span class="text-lg">{$_(button.name)}</span>
							{:else}
								<LucideIcon name={button.iconName}/>
							{/if}
					</button>
				{/if}
				{#if button.type == 'switch'}
					<button class="btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
						<div class="flex w-full justify-between">
							<h1 class="truncate text-lg">{button.name}</h1>
							<Switch controlClasses="w-12 h-8" name="slide" controlActive="bg-green-500" checked={controlView.buttonState} onCheckedChange={button.click} />
						</div>
					</button>
				{/if}
			{/each}
		</div>
		{/if}
	</div>
	{/snippet}
</Modal>
