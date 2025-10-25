<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView } from '$lib/types/models';
	import { X, Video, Camera, History } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import Info from '$lib/components/lb-info.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { tick } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let events = $derived(String(store.getState(controlView.control.states.lastBellEvents)));
	let lastBellEvents = $derived((events.includes('|') ? events.split('|'): []));
	let selectedTab = $state(1);
	let lastEvent = $derived(lastBellEvents[lastBellEvents.length-1]); // number represents date
	let dialogHeight = $state(500);
	let imageHeight = $state(200);
	let history = $derived(lastBellEvents.length);
	let video = $derived(fetchVideo(store.hostUrl, store.credentials)); // note: returns Promise
	let stream = $state('');

	async function fetchVideo(hostUrl: string, credentials: string) {
		if (stream) return; // only call when no stream is available
		const resp = await fetch(`http://${hostUrl}/jdev/sps/io/${controlView.control.uuidAction}/securedDetails`,
		{ method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + credentials
			}
		});
		const data = await resp.json();
		const s = JSON.parse(data.LL.value); // TODO add check
		if (resp.ok) {
			stream = s.videoInfo.streamUrl;
			return stream;
		} else {
			throw new Error(data);
		}
	}

	function formatDate(event: string) {
		let s = event;
		return s.slice(6,8) + '-' + s.slice(4,6) + '-' + s.slice(0,4) + '  ' + s.slice(8,10) + ":" + s.slice(10,12);
	}

	async function close() {
		controlView.modal.action(false);
		await tick();
		selectedTab = 1;
		lastEvent = lastBellEvents[lastBellEvents.length-1];
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
		{#if selectedTab==1}
			<div class="relative" style="height: {dialogHeight}px;">
				{#await video then data}
					<img class="absolute z-2" style="max-height: 560px;" height={imageHeight} src={stream} width="100%" alt={data}/>
				{/await}
			</div>
		{/if}
		{#if selectedTab==2}
			<div class="relative" style="height: {dialogHeight}px">
				<img class="w-full" style="max-height: 560px;" height={imageHeight} src={`http://${store.hostUrl}/camimage/${controlView.control.uuidAction}/${lastEvent}`} alt=""/>
				<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
  			<div class="absolute bottom-4 left-4">
					<p class="text-surface-50 text-xl">{formatDate(lastEvent)}</p>
				</div>
			</div>
		{/if}
		{#if selectedTab==3}
			<div class="overflow-auto pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {dialogHeight}px">
				{#each lastBellEvents as event}
					<button class="relative" onclick={() => {lastEvent=event; selectedTab=2;}}>
						<img class="w-full" fetchpriority="high" src={`http://${store.hostUrl}/camimage/${controlView.control.uuidAction}/${event}`} alt=""/>
						<div class="absolute inset-0 bg-gray-700 opacity-20"></div>
   			 		<div class="absolute bottom-2 left-2">
							<p class="text-surface-50 text-xm">{formatDate(event)}</p>
						</div>
					</button>
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
