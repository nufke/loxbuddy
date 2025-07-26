<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { ControlView } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import LbJalousieIcon from '$lib/components/lb-jalousie-icon.svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';
	import { store } from '$lib/stores/store.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let autoActive = $derived(Number(store.getState(controlView.control.states.autoActive)));
	let shadePosition = $derived(store.getState(controlView.control.states.shadePosition));
	let type = controlView.control.details.animation;

	/* blinds type
		0: Venetian blinds (jaloezie/lamellen)
		1: Roller blinds (rolluik/dakrolgordijn/screen)
		2: Curtains opening to both sides
		3: Schlotterer Retrolux
		4: Curtain left
		5: Curtain right
		6: Awning (zonneluifel)
		*/

	let statusText = $derived(controlView.statusName + 
									((shadePosition == 0 && type == 0 ) ? ', ' + $_('Slats are horizontal').toLocaleLowerCase() : 
									((shadePosition == 1 && type == 0 ) ? ', ' + $_('Slats are vertical').toLocaleLowerCase() :
									((shadePosition > 0 && shadePosition < 1 && type == 0 ) ? ', ' + $_('Slats at').toLocaleLowerCase() + ' %' : ''))));

	function getColSpan(i: number, j: number) {
		return (i==4 && j!=0)  ? 'col-span-2' : '';
	}
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
							max-w-9/10 max-h-9/10 overflow-auto w-[450px]"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>controlView.modal.action(false)}></div> 
	<Info control={controlView.control}/>
	<header class="relative">
		<div class="flex justify-center">
			<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 dark:bg-surface-950">
				<LbJalousieIcon position={controlView.modal.details.position} shadePosition={controlView.modal.details.shadePosition} width="36" height="36"/>
				{#if controlView.badgeIconName?.length}
					<div class="absolute top-[9px] left-[10px] inline-flex items-center justify-center w-[18px] h-[18px] {controlView.badgeIconColor} rounded-full
											border border-1 dark:border-surface-950 border-surface-50">
						<LbIcon class='dark:text-surface-950 text-surface-50' name={controlView.badgeIconName} size="10"/>
					</div>
				{/if}
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
		<div class="mt-2 truncate">
			<p class="text-lg truncate {autoActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">
				{ autoActive ? $_("Sun position detection enabled") : $_("Sun position detection disabled")}</p>
		</div>
		<div class="mt-2 truncate">
			<p class="text-lg truncate {controlView.statusColor}">{statusText}</p>
		</div>
		<div class="container flex grid grid-cols-2 gap-2 mt-6 m-2">
		{#if controlView.modal && controlView.modal.buttons}
			{#each controlView.modal.buttons as button, index}
				{#if button.type === 'button'}
					<button type="button" class="w-full {getColSpan(index, controlView.modal.buttons.length)} btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); button.click()}}
							onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); button.mousedown()}}
							onmouseup={(e) => { e.stopPropagation(); e.preventDefault(); button.mouseup()}}>
							{#if button.name}
								<span class="text-lg">{$_(button.name)}</span>
							{:else}
								<LbIcon name={button.iconName}/>
							{/if}
					</button>
				{/if}
			{/each}
		{/if}
		</div>
	</div>
	{/snippet}
</Modal>
