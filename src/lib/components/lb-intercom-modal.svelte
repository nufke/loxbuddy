<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView } from '$lib/types/models';
	import { X, Video, Camera, History, Settings } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let img: any = $state();
	let selectedTab = $state(0);
	let img_height = $state(400);
	let image: number = $state(0);

	let dates = $derived(controlView.details.lastBellEvents);
	let history = $derived(controlView.details.hasLastBellEventImages && dates.length);
	let stream = $derived(controlView.securedDetails && controlView.securedDetails.videoInfo ? controlView.securedDetails.videoInfo.streamUrl : null);

	function handleImageLoad() {
		image = image ? image : dates[dates.length-1];
		img_height = img && img.height ? img.height : 400;
	}

	function sortDates(i: number[]) {
		return i.sort( (a, b) => b-a);
	}

	function formatDate(i: number) {
		let s = String(i);
		return s.slice(6,8) + '-' + s.slice(4,6) + '-' + s.slice(0,4) + '  ' + s.slice(8,10) + ":" + s.slice(10,12);
	}

	function getImage(image: number) {
		return  controlView.details.lastBellEventImages && 
						controlView.details.lastBellEventImages.hasOwnProperty(image) ? controlView.details.lastBellEventImages[image] : '';
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
	onOpenChange={()=>controlView.modal.action(false)}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 pt-4 space-y-4 shadow-xl rounded-lg border border-white/5
							max-w-9/10 max-h-9/10 w-[680px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{controlView.textName}</h2>
		</div>
		<div class="absolute right-4 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={()=>{ controlView.modal.action(false); resetTab();}}>
				<X/>
			</button>
		</div>
	</header>
	<div class="">
		{#if selectedTab==0} 
			<div class="relative" style="height: {img_height}px">
				<div class="absolute inset-0 flex items-center justify-center z-1">
					<p class="dark:text-surface-50 text-surface-950 text-xl">Loading video...</p>
				</div>
				<img class="absolute z-2 w-full" bind:this={img} src={stream} onload={handleImageLoad} alt=""/>
			</div>
		{/if}
		{#if selectedTab==1}
			<div class="relative" style="height: {img_height}px">
		 		<img class="w-full" src={'data:image/jpeg;charset=utf-8;base64,' + getImage(image)} alt="">
				<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
  			<div class="absolute bottom-4 left-4">
					<p class="text-surface-50 text-xl">{formatDate(image)}</p>
				</div>
			</div>
		{/if}
		{#if selectedTab==2}
			<div class="overflow-auto pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {img_height}px">
				{#each sortDates(dates) as item}
					<button class="relative" onclick={() => {image=item; selectedTab=1;}}>
		  	  	<img class="" src={'data:image/jpeg;charset=utf-8;base64,' + getImage(item)} alt="">
						<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
   			 		<div class="absolute bottom-2 left-2">
							<p class="text-surface-50 text-xm">{formatDate(item)}</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
		{#if selectedTab==3}
			<div class="" style="height: {img_height}px">
			</div>
		{/if}
	</div>
	<div class="sticky bottom-0 left-0 w-full h-16 pb-2">
		<div class="grid h-full max-w-lg { history ? 'grid-cols-4' : 'grid-cols-2'} mx-auto">
			<button type="button" class="inline-flex flex-col items-center justify-center px-5
							group {selectedTab==0 ? 'text-primary-500' : ''} " onclick={() => selectedTab=0}>
				<Video/>
				<span class="mt-1 text-xs">{$_("Video")}</span>
			</button>
			{#if history}
				<button type="button" class="inline-flex flex-col items-center justify-center px-5
								group {selectedTab==1 ? 'text-primary-500' : ''} " onclick={() => selectedTab=1}>
					<Camera/>
					<span class="mt-1 text-xs">{$_("Image")}</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5
								group {selectedTab==2 ? 'text-primary-500' : ''} " onclick={() => selectedTab=2}>
					<History/>
					<span class="mt-1 text-xs">{$_("History")}</span>
				</button>
			{/if}
			<button type="button" class="inline-flex flex-col items-center justify-center px-5
							group {selectedTab==3 ? 'text-primary-500' : ''} " onclick={() => selectedTab=3}>
				<Settings/>
				<span class="mt-1 text-xs">{$_("Settings")}</span>
			</button>
		</div>
	</div>
	{/snippet}
</Modal>
