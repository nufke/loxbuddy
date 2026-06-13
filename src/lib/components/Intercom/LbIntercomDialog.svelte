<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { type ControlView, type SecuredDetails } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { _ } from 'svelte-i18n';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { sipClient } from '$lib/communication/SipClient';
	import { fadeInOut } from '$lib/helpers/styles';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { onMount } from 'svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let uuid = controlView.control.uuidAction; // no updates of uuidAction
	let imageIdx = 0; // image cache index

	let viewPort: any = $state();
	let securedDetails: SecuredDetails | undefined = $state();
	let dialogHeight = $state(500);
	let imageHeight = $state(200);
	let selectedTab = $state(1);
	let isValidUrl = $state(false);
	let remoteVideo: HTMLVideoElement = $state() as HTMLVideoElement;
	let videoReady = $state(false);
	let openAlert = $state(false);
	let alertMessage = $state('');

	let events = $derived(String(controlStore.getState(controlView.control.states?.lastBellEvents)));
	let lastBellEvents = $derived((events.includes('|') ? events.split('|').reverse(): []));
	let lastEvent = $derived(lastBellEvents[0]); // select latest (first) event
	let history = $derived(lastBellEvents.length);
	let bellImages = $derived(new SvelteMap<string, string>());
	let streamUrl = $derived(securedDetails?.videoInfo?.streamUrl ?? '');
	let isJpgImage = $derived(streamUrl.match(/.cgi$/) ? 1 : 0);
	let sipIconName = $derived(videoReady ? "majesticons:phone-hangup-line" : "majesticons:phone-line");
	let sipDescription = $derived(videoReady ? $_("Disconnect") : $_("Connect"));

	let calleeUri = $derived(
		securedDetails?.audioInfo?.user && securedDetails?.audioInfo?.host
			? `sip:${securedDetails.audioInfo.user}@${securedDetails.audioInfo.host}`
			: null
	);

	// load secured details at mount
	onMount(async () => {
		securedDetails = await controlStore.fetchSecuredDetails(controlView.control);
		checkUrl(streamUrl);
		getBellImages();
	});

	function checkUrl(url: string): void {
		if (!url) { isValidUrl = false; return; }
		const img = new Image();
		img.onload = () => { isValidUrl = true; };
		img.onerror = () => { isValidUrl = false; };
		img.src = url;
	}

	function arrayBufferToBase64(buffer: ArrayBuffer): string {
		return btoa(String.fromCharCode(...new Uint8Array(buffer)));
	}

	function getBellImages(): boolean {
		if (lastBellEvents.length) {
			// Miniserver Gen1 needs time to fetch these images, therefore we introduce a delay (300ms)
			setInterval( async () => { 
				if (imageIdx < lastBellEvents.length) {
					const event = lastBellEvents[imageIdx++];
					console.info('[LbIntercomDialog] get intercom image', event);
					const file = await controlStore.getFile(uuid, `camimage/${controlView.control.uuidAction}/${event}`);
					if (file && file.data) {
						const url = `data:image/jpeg;base64,${arrayBufferToBase64(file.data)}`;
						bellImages.set(event, url);
					}
				}
			}, 300);
	 	}
		return true;
	}

	function handleImageLoad(): void {
		imageHeight = viewPort?.height || 400;
		if (isJpgImage && viewPort) {
			setTimeout(() => {
				if (viewPort) {
					viewPort.src = ''; // force viewPort to reload
					viewPort.src = streamUrl;
				}
			}, 1000);
		}
	}

	function formatDate(event: string): string {
		let s = event;
		return s.slice(6,8) + '-' + s.slice(4,6) + '-' + s.slice(0,4) + '  ' + s.slice(8,10) + ":" + s.slice(10,12);
	}

	async function close(): Promise<void> {
		controlView.dialog.action(false);
		await tick();
		selectedTab = 1; // when selecting live video befor exit, also an open SIP call will be ended
		lastEvent = lastBellEvents[0];
	}
	
	async function connect() {
		if (!calleeUri) {
			alertMessage = $_('Intercom settings are missing.\nCheck your Lox Config.');
			openAlert = true;
			selectedTab = 1;
			return;
		}
		if (!appStore.sipStatus) {
			alertMessage = $_('SIP server not registered.\nConfigure VoIP in Settings.');
			openAlert = true;
			selectedTab = 1;
			return;
		}
		videoReady = false;
		selectedTab = 2;
		await tick();
		sipClient.setRemoteMedia(remoteVideo);
		void sipClient.call(calleeUri);
	}

	function disconnect() {
		sipClient?.hangup();
		videoReady = false;
		selectedTab = 1;
	}

	// make sure we end the SIP call when we toggle to another tab item
	$effect( () => {
		if (selectedTab != 2) {
			sipClient?.hangup();
			videoReady = false;
		}
	});
</script>

{#if controlView.dialog.state} <!-- only construct dialog when opened, important to get current clientHeight -->
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4" >
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									max-w-full max-h-full w-[680px] lg:w-[800px] {fadeInOut}">
					<LbInfo control={controlView.control}/>
					<header>
						<div class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<p class="h5 flex justify-center items-center">{controlView.textName}</p>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<LbIcon name="x" height="16" width="16"/>
								</button>
							</div>
						</div>
					</header>
					<Dialog.Description>
						<div class="m-2 mb-4">
							{#if selectedTab==1 || selectedTab==2}
								{#if selectedTab==2}
									<video bind:this={remoteVideo} style="height: {imageHeight}px;" autoplay playsinline
										oncanplay={() => { videoReady = true; }}
										class="w-full h-full object-cover" class:hidden={!videoReady}></video>
									{#if !videoReady}
										<div class="flex flex-col justify-center items-center bg-surface-200-800" style="height: {imageHeight}px;">
											<p>{$_('Connecting to intercom...')}</p>
											<button class="btn bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 mt-2"
												onclick={disconnect}>
												{$_('Cancel')}
											</button>
										</div>
									{/if}
									{:else if isValidUrl}
										<div class="relative" style="height: {imageHeight}px;">
											<img class="absolute z-2" style="max-height: 560px;" bind:this={viewPort} height={imageHeight}
												src={streamUrl} width="100%" onload={handleImageLoad} alt=""/>
										</div>
										{:else}
										<div class="flex justify-center items-center bg-surface-200-800" style="height: {imageHeight}px;">
											<p class="text-center p-3 whitespace-pre-line">{$_('Invalid video stream.\nCheck secured settings of intercom.')}</p>
										</div>
									{/if}
								{/if}
							{#if selectedTab==3}
								<div>
									{#if bellImages.size}
										<img class="w-full" style="max-height: 560px;" height={imageHeight} src={bellImages.get(lastEvent)||''} alt=""/>
										<div class="absolute bottom-4 left-4">
											<p class="text-surface-50 text-xl">{formatDate(lastEvent)}</p>
										</div>
									{:else}
										<div class="flex justify-center items-center bg-surface-200-800" style="height: {imageHeight}px;">
											<p>{$_('No bell image found')}</p>
										</div>
									{/if}
								</div>
							{/if}
							{#if selectedTab==4}
							<div>
								{#if lastBellEvents.length}
									<div class="overlow-auto pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {dialogHeight}px">
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
								{:else}
									<div class="flex justify-center items-center bg-surface-200-800" style="height: {imageHeight}px;">
										<p>{$_('No history found')}</p>
									</div>
								{/if}
								</div>
							{/if}
						</div>
						<div class="sticky bottom-0 left-0 w-full h-16 pb-2"> <!-- icon block -->
							<div class="w-full flex flex-row h-full mx-auto">
								<button type="button" class="flex-1 inline-flex flex-col items-center justify-center
											group {selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=1}>
									<LbIcon name="video"/>
									<span class="mt-1 text-xs">{$_("Live stream")}</span>
								</button>
								{#if sipClient}
									<button type="button" class="flex-1 inline-flex flex-col items-center justify-center
												group {selectedTab==2 && !videoReady ? 'dark:text-primary-300 text-primary-700' : selectedTab==2 && videoReady ? 'dark:text-red-500 text-red-700' : ''}"
												onclick={() => { selectedTab=2; videoReady ? disconnect() : connect()}}>
										<LbIcon name={sipIconName}/>
										<span class="mt-1 text-xs">{sipDescription}</span>
									</button>
								{/if}
								<button type="button" class="flex-1 inline-flex flex-col items-center justify-center
												group {selectedTab==3 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=3}>
									<LbIcon name="camera"/>
									<span class="mt-1 text-xs">{$_("Last image")}</span>
								</button>
								<button type="button" class="flex-1 inline-flex flex-col items-center justify-center
												group {selectedTab==4 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => selectedTab=4}>
									<LbIcon name="history"/>
									<span class="mt-1 text-xs">{$_("History")}</span>
								</button>
							</div>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}

<Dialog open={openAlert} onInteractOutside={() => openAlert = false}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-20 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
		<Dialog.Positioner class="fixed inset-0 z-20 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 w-[320px] {fadeInOut}">
				<Dialog.Description>
					<p class="text-center p-3 whitespace-pre-line">{alertMessage}</p>
					<button class="w-full btn bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 mt-2"
						onclick={() => openAlert = false}>
						{$_('OK')}
					</button>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
