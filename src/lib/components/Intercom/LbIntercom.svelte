<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import type { Control, ControlOptions, SecuredDetails } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { sipClient } from '$lib/communication/SipClient';
	import { SvelteMap } from 'svelte/reactivity';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';

	type View = 'live' | 'call' | 'snapshot' | 'history';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const uuid = control.uuidAction;
	let imageIdx = 0;

	let controlOpen = $state(false);
	let openAlert = $state(false);
	let alertMessage = $state('');
	let viewPort: any = $state();
	let securedDetails: SecuredDetails | undefined = $state();
	let dialogHeight = $state(500);
	let imageHeight = $state(200);
	let selectedView = $state<View>('live');
	let isValidUrl = $state(false);
	let remoteVideo: HTMLVideoElement = $state() as HTMLVideoElement;
	let videoReady = $state(false);
	let lastEvent = $state('');

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let statusName = $derived(fmt.sprintf(control.details?.format, controlStore.getState(control.states?.text)));
	let events = $derived(String(controlStore.getState(control.states?.lastBellEvents)));
	let lastBellEvents = $derived(events.includes('|') ? events.split('|').reverse() : []);
	let bellImages = $derived(new SvelteMap<string, string>());
	let streamUrl = $derived(securedDetails?.videoInfo?.streamUrl ?? '');
	let isJpgImage = $derived(streamUrl.match(/.cgi$/) ? 1 : 0);
	let sipIconName = $derived(videoReady ? 'majesticons:phone-hangup-line' : 'majesticons:phone-line');
	let sipDescription = $derived(videoReady ? $_('Disconnect') : $_('Connect'));
	let sipTabColor = $derived(
		selectedView === 'call'
			? (videoReady ? 'dark:text-red-500 text-red-700' : 'dark:text-primary-300 text-primary-700')
			: ''
	);
	let calleeUri = $derived(
		securedDetails?.audioInfo?.user && securedDetails?.audioInfo?.host
			? `sip:${securedDetails.audioInfo.user}@${securedDetails.audioInfo.host}`
			: null
	);

	// keep lastEvent in sync with the most recent bell event; can be overridden by user selection in history
	$effect(() => { lastEvent = lastBellEvents[0] || ''; });

	// end any active SIP call whenever the user navigates away from the call view
	$effect(() => {
		if (selectedView !== 'call') {
			sipClient?.hangup();
			videoReady = false;
		}
	});

	onMount(async () => {
		securedDetails = await controlStore.fetchSecuredDetails(control);
		checkUrl(streamUrl);
		getBellImages();
	});

	/** Returns the active colour class when the given view is selected. */
	function tabActive(view: View): string {
		return selectedView === view ? 'dark:text-primary-500 text-primary-700' : '';
	}

	/**
	 * Probes the stream URL with a throwaway Image element to determine whether
	 * it resolves to a valid resource before displaying it.
	 *
	 * @param url - the video stream URL to validate.
	 */
	function checkUrl(url: string): void {
		if (!url) { isValidUrl = false; return; }
		const img = new Image();
		img.onload = () => { isValidUrl = true; };
		img.onerror = () => { isValidUrl = false; };
		img.src = url;
	}

	/**
	 * Converts an ArrayBuffer to a base64-encoded string for use in data URIs.
	 *
	 * @param buffer - raw binary data received from the file fetch.
	 * @returns base64 string.
	 */
	function arrayBufferToBase64(buffer: ArrayBuffer): string {
		return btoa(String.fromCharCode(...new Uint8Array(buffer)));
	}

	/**
	 * Fetches bell snapshot images from the miniserver in 300 ms intervals
	 * to avoid overloading Gen1 hardware.
	 *
	 * @returns true when the fetch loop is started (or no events exist).
	 */
	function getBellImages(): boolean {
		if (lastBellEvents.length) {
			setInterval(async () => {
				if (imageIdx < lastBellEvents.length) {
					const event = lastBellEvents[imageIdx++];
					console.info('[LbIntercom] get intercom image', event);
					const file = await controlStore.getFile(uuid, `camimage/${control.uuidAction}/${event}`);
					if (file && file.data) {
						const url = `data:image/jpeg;base64,${arrayBufferToBase64(file.data)}`;
						bellImages.set(event, url);
					}
				}
			}, 300);
		}
		return true;
	}

	/**
	 * Updates imageHeight from the loaded image element's natural height and
	 * schedules a reload for MJPEG (.cgi) streams to keep them live.
	 */
	function handleImageLoad(): void {
		imageHeight = viewPort?.height || 400;
		if (isJpgImage && viewPort) {
			setTimeout(() => {
				if (viewPort) {
					viewPort.src = '';
					viewPort.src = streamUrl;
				}
			}, 1000);
		}
	}

	/**
	 * Formats a raw bell event timestamp string into a human-readable date/time.
	 *
	 * @param event - timestamp string in 'YYYYMMDDHHmm' format.
	 * @returns formatted string, e.g. "21-06-2026  14:32".
	 */
	function formatDate(event: string): string {
		return event.slice(6, 8) + '-' + event.slice(4, 6) + '-' + event.slice(0, 4) + '  ' + event.slice(8, 10) + ':' + event.slice(10, 12);
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/**
	 * Closes the control dialog, ends any active SIP call, and resets the view
	 * and last-event pointer back to their initial state.
	 */
	async function closeControl(): Promise<void> {
		controlOpen = false;
		await tick();
		selectedView = 'live';
		lastEvent = lastBellEvents[0] || '';
	}

	/**
	 * Initiates a SIP call to the intercom. Shows an alert and returns to the
	 * live view if the SIP URI is missing or the SIP server is not registered.
	 */
	async function connect(): Promise<void> {
		if (!calleeUri) {
			alertMessage = $_('Intercom settings are missing.\nCheck your Lox Config.');
			openAlert = true;
			selectedView = 'live';
			return;
		}
		if (!appStore.sipStatus) {
			alertMessage = $_('SIP server not registered.\nConfigure VoIP in Settings.');
			openAlert = true;
			selectedView = 'live';
			return;
		}
		videoReady = false;
		selectedView = 'call';
		await tick();
		sipClient.setRemoteMedia(remoteVideo);
		void sipClient.call(calleeUri);
	}

	/** Ends the active SIP call and returns to the live stream view. */
	function disconnect(): void {
		sipClient?.hangup();
		videoReady = false;
		selectedView = 'live';
	}
</script>

<LbControl {controlOptions} {iconName} {statusName}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name} width="w-[680px] lg:w-[800px]">
		{#snippet description()}
			<div class="m-2 mb-4">
				{#if selectedView === 'live'}
					{#if isValidUrl}
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
				{#if selectedView === 'call'}
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
				{/if}
				{#if selectedView === 'snapshot'}
					{#if bellImages.size}
						<img class="w-full" style="max-height: 560px;" height={imageHeight} src={bellImages.get(lastEvent) || ''} alt=""/>
						<div class="absolute bottom-4 left-4">
							<p class="text-surface-50 text-xl">{formatDate(lastEvent)}</p>
						</div>
					{:else}
						<div class="flex justify-center items-center bg-surface-200-800" style="height: {imageHeight}px;">
							<p>{$_('No bell image found')}</p>
						</div>
					{/if}
				{/if}
				{#if selectedView === 'history'}
					{#if lastBellEvents.length}
						<div class="overlow-auto pl-2 pr-2 grid gap-5 grid-cols-2" style="height: {dialogHeight}px">
							{#each lastBellEvents as event}
								{#if bellImages.get(event)}
									<button class="relative" onclick={() => { lastEvent = event; selectedView = 'snapshot'; }}>
										<img class="w-full" style="max-height: 560px;" height={imageHeight} src={bellImages.get(event) || ''} alt=""/>
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
				{/if}
			</div>
			<div class="sticky bottom-0 left-0 w-full h-16 pb-2">
				<div class="w-full flex flex-row h-full mx-auto">
					<button type="button" class="flex-1 inline-flex flex-col items-center justify-center group {tabActive('live')}"
							onclick={() => selectedView = 'live'}>
						<LbIcon name="video"/>
						<span class="mt-1 text-xs">{$_('Live stream')}</span>
					</button>
					{#if sipClient}
						<button type="button" class="flex-1 inline-flex flex-col items-center justify-center group {sipTabColor}"
								onclick={() => { selectedView = 'call'; videoReady ? disconnect() : connect(); }}>
							<LbIcon name={sipIconName}/>
							<span class="mt-1 text-xs">{sipDescription}</span>
						</button>
					{/if}
					<button type="button" class="flex-1 inline-flex flex-col items-center justify-center group {tabActive('snapshot')}"
							onclick={() => selectedView = 'snapshot'}>
						<LbIcon name="camera"/>
						<span class="mt-1 text-xs">{$_('Last image')}</span>
					</button>
					<button type="button" class="flex-1 inline-flex flex-col items-center justify-center group {tabActive('history')}"
							onclick={() => selectedView = 'history'}>
						<LbIcon name="history"/>
						<span class="mt-1 text-xs">{$_('History')}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}

<!-- Alert dialog for SIP configuration errors -->
<LbDialog open={openAlert} onClose={() => openAlert = false}
	title="" showClose={false} width="w-[320px]" zIndex="z-20">
	{#snippet description()}
		{#if alertMessage.length}
			<div class="w-full flex justify-center items-center p-3">
				<p>{alertMessage}</p>
			</div>
		{/if}
		<button class="w-full btn bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 mt-2"
			onclick={() => openAlert = false}>
			{$_('OK')}
		</button>
	{/snippet}
</LbDialog>
