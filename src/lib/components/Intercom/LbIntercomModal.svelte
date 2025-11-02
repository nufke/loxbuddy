<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, type SecuredDetails, type SecuredDetailsValue } from '$lib/types/models';
	import { X, Video, Camera, History } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import { fetchUrl } from '$lib/communication/fetchUrl.svelte';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { loxWsClient } from '$lib/communication/LoxWsClient';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let uuid = controlView.control.uuidAction; // no updates of uuidAction

	let imageIdx = 0; // image cache index
	let img: any = $state();
	let events = $derived(String(store.getState(controlView.control.states.lastBellEvents)));
	let lastBellEvents = $derived((events.includes('|') ? events.split('|').reverse(): []));
	let selectedTab = $state(1);
	let lastEvent = $derived(lastBellEvents[0]); // select latest (first) event
	let dialogHeight = $state(500);
	let imageHeight = $state(200);
	let history = $derived(lastBellEvents.length);
	let resource = $derived(fetchUrl<string>(`jdev/sps/io/${uuid}/securedDetails`));
	let	securedDetails = $derived(resource.value ? JSON.parse(resource.value) : {});
	let bellImages = $derived(new SvelteMap<string, string>());
	let isJpgVideo = $derived(securedDetails?.videoInfo?.streamUrl.match(/.cgi$/) ? 1 : 0);

	$effect( () => {
		if (isJpgVideo) {
			setInterval( () => {
				securedDetails = resource.value ? JSON.parse(resource.value) : {};
			}, 1000); // refresh resource every second
		}
	});

	function arrayBufferToBase64(buffer: ArrayBuffer) {
		return btoa(String.fromCharCode(...new Uint8Array(buffer)));
	}

	function getImages() {
		if (lastBellEvents.length) {
			// Miniserver Gen1 needs time to fetch these images, therefore we introduce a serious delay (300ms)
			setInterval( async () => { 
				if (imageIdx < lastBellEvents.length) {
					const event = lastBellEvents[imageIdx++];
					console.info('get intercom image', event);
					const file = await loxWsClient.getFile(`camimage/${controlView.control.uuidAction}/${event}`);
  				const url = `data:image/jpeg;base64,${arrayBufferToBase64(file.data)}`;
					bellImages.set(event, url);
				}
			}, 300);
	 	}
		return true;
	}

	function handleImageLoad() {
		imageHeight = img?.height || 400;
  }

	function formatDate(event: string) {
		let s = event;
		return s.slice(6,8) + '-' + s.slice(4,6) + '-' + s.slice(0,4) + '  ' + s.slice(8,10) + ":" + s.slice(10,12);
	}

	async function close() {
		controlView.modal.action(false);
		await tick();
		selectedTab = 1;
		lastEvent = lastBellEvents[0];
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
	contentBase="card bg-surface-100-900 pt-4 space-y-4 shadow-sm rounded-lg border border-white/5
							md:max-w-9/10 md:max-h-9/10 w-[680px] lg:w-[800px]"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop? -->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={close}></div> 
	<Info control={controlView.control}/>
	<header class="relative flex">
		<div class="flex justify-center m-auto w-[80%]">
			<p class="h5 truncate">{controlView.textName}</p>
		</div>
		<div class="absolute top-0 right-3">
			<button type="button" aria-label="close" class="btn-icon w-auto" onclick={close}>
				<X/>
			</button>
		</div>
	</header>
	<div class="relative w-full">
		{#if selectedTab==1 && getImages()}
			<div class="relative" style="height: {imageHeight}px;">
				<img class="absolute z-2" style="max-height: 560px;" bind:this={img} height={imageHeight}
					src={securedDetails?.videoInfo?.streamUrl} width="100%" onload={handleImageLoad} alt=""/>
			</div>
		{/if}
		{#if selectedTab==2}
			<div class="relative" style="height: {dialogHeight}px">
				<img class="w-full" style="max-height: 560px;" height={imageHeight} src={bellImages.get(lastEvent)||''} alt=""/>
				<div class="absolute bottom-4 left-4">
					<p class="text-surface-50 text-xl">{formatDate(lastEvent)}</p>
				</div>
			</div>
		{/if}
		{#if selectedTab==3}
			<div class="overflow-auto pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {dialogHeight}px">
					{#each lastBellEvents as event}
						{#if bellImages.get(event)}
						<button class="relative" onclick={() => {lastEvent=event; selectedTab=2;}}>
							<img class="w-full" style="max-height: 560px;" height={imageHeight} src={bellImages.get(event)||''} alt=""/>
							<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
					 		<div class="absolute bottom-2 left-2">
								<p class="text-surface-50 text-xm">{formatDate(event)}</p>
							</div>
						</button>
						{/if}
					{/each}
			</div>
		{/if}
	</div>
	<div class="sticky bottom-0 left-0 w-full h-16 pb-2">
		<div class="grid h-full max-w-lg lg:max-w-xl { history ? 'grid-cols-3' : 'grid-cols-2'} mx-auto">
			<button type="button" class="inline-flex flex-col items-center justify-center px-5
							group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=1}>
				<Video/>
				<span class="mt-1 text-xs">{$_("Video")}</span>
			</button>
			{#if history}
				<button type="button" class="inline-flex flex-col items-center justify-center px-5
								group {selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=2}>
					<Camera/>
					<span class="mt-1 text-xs">{$_("Image")}</span>
				</button>
				<button type="button" class="inline-flex flex-col items-center justify-center px-5
								group {selectedTab==3 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=3}>
					<History/>
					<span class="mt-1 text-xs">{$_("History")}</span>
				</button>
			{/if}
		</div>
	</div>
	{/snippet}
</Modal>
