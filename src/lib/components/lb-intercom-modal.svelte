<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LucideIcon from './icon-by-name.svelte';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';

	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };

	let img: any;
	let selectedTab = 0;
	let img_height = 0;
	let image = 0;
	
	$: history = vm.modal?.details.lastBellEventImages;
	$: stream = vm.modal?.details.video && vm.modal?.details.video.videoInfo ? vm.modal?.details.video.videoInfo.streamUrl : null;
	$: dates = vm.modal?.details.lastBellEvents;

	function handleImageLoad() {
		image = image ? image : dates[dates.length-1];
		img_height = img.height;
	}

	function sortDates(i: number[]) {
		return i.sort( (a, b) => b-a);
	}

	function formatDate(i: number) {
		let s = String(i);
		return s.slice(6,8) + '-' + s.slice(4,6) + '-' + s.slice(0,4) + '  ' + s.slice(8,10) + ":" + s.slice(10,12);
	}
</script>

<Modal
	open={vm.modal?.state}
	onOpenChange={()=>vm.modal?.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 pt-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[680px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<h2 class="h4 text-center">{vm.textName}</h2>
		</div>
		<div class="absolute right-4 top-0">
			<button type="button" aria-label="close" class="btn-icon w-auto" on:click={()=>{ selectedTab = 0; vm.modal?.action(false);}}>
				<X/>
			</button>
		</div>
	</header>
	<div class="overflow-auto" style="min-height: {img_height ? img_height:0}px">

	{#if selectedTab==0} 
		<img class="w-full" bind:this={img} src={stream} on:load={handleImageLoad} alt=""/>
	{/if}

	{#if selectedTab==1}
	<div class="relative">
	 	<img class="" src={'data:image/jpeg;charset=utf-8;base64,' + vm.modal?.details.lastBellImages[image]} alt="">
		<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
  	<div class="absolute bottom-4 left-4">
			<p class="text-white text-xl">{formatDate(image)}</p>
		</div>
	</div>
	{/if}

	{#if selectedTab==2}
	<div class="pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {img_height}px">
		{#each sortDates(dates) as item}
			<button class="relative" on:click={() => {image=item; selectedTab=1;}}>
  	  	<img class="" src={'data:image/jpeg;charset=utf-8;base64,' + vm.modal?.details.lastBellImages[item]} alt="">
				<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
    		<div class="absolute bottom-2 left-2">
					<p class="text-white text-xm">{formatDate(item)}</p>
				</div>
			</button>
		{/each}
	</div>
	{/if}

	{#if selectedTab==3}
	{/if}

	</div>
	<div class="sticky bottom-0 left-0 w-full h-16 pb-2">
		<div class="grid h-full max-w-lg { history ? 'grid-cols-4' : 'grid-cols-2'} mx-auto">
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==0 ? 'text-green-500' : ''} " on:click={() => selectedTab=0}>
					<LucideIcon name='Video'/>
					<span class="mt-1 text-xs">Video</span>
				</button>
				{#if history}
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==1 ? 'text-green-500' : ''} " on:click={() => selectedTab=1}>
					<LucideIcon name='Camera'/>
					<span class="mt-1 text-xs">Image</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==2 ? 'text-green-500' : ''} " on:click={() => selectedTab=2}>
					<LucideIcon name='History'/>
					<span class="mt-1 text-xs">History</span>
				</button>
				{/if}
				<button type="button" class="inline-flex flex-col items-center justify-center px-5 group {selectedTab==3 ? 'text-green-500' : ''} " on:click={() => selectedTab=3}>
					<LucideIcon name='Settings'/>
					<span class="mt-1 text-xs">Settings</span>
				</button>
		</div>
	</div>
	{/snippet}
</Modal>
