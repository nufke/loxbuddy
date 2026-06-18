<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { Control, ControlOptions, ControlView, DialogView, SingleButtonView, GeneralView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS, DEFAULT_GENERALVIEW } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbGeneralDialog from '$lib/components/Common/LbGeneralDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { _ } from 'svelte-i18n';
	import { fadeInOut } from '$lib/helpers/styles';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import LbInfo from '$lib/components/Common/LbInfo.svelte';
	import { tick } from 'svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS}: { control: Control, controlOptions: ControlOptions } = $props();

	let passwordView: GeneralView = $state(DEFAULT_GENERALVIEW);
	let statusName = $state('');
	let statusColor = $state('');
	let selectedTab = $state(1);
	let serviceTime = $state(1);
	let hours = $state(0);
	let minutes = $state(0);
	let duration = $state('');

	let dialog: DialogView = $state({
		action: (state: boolean) => {dialog.state = state},
		state: false,
	});

	let timeServiceMode = $derived(Number(controlStore.getState(control.states?.timeServiceMode)));
	let level = $derived((timeServiceMode > 0) ? 99 : Number(controlStore.getState(control.states?.level)));

	let serviceButton: SingleButtonView = $derived(
		{
			name: (timeServiceMode > 0) ? 'Stop alarm suppression' : 'Start alarm suppression',
			type: 'button',
			color: '',
			click: () => {
				(timeServiceMode > 0) ? stopService() : startService()
			}
		}
	);

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: controlStore.getIcon(control, controlOptions.isSubControl),
		iconColor: statusColor,
		textName: control.name,
		statusName: statusName,
		statusColor: statusColor,
		dialog: dialog
	});

	function setControl(cmd: string): void {
		const cachedVisuPw = appStore.getVisuPw(control.uuidAction);
		if (control.isSecured && cachedVisuPw) {
			controlStore.setControl(control, cmd, cachedVisuPw);
			return;
		}
		if (control.isSecured) {
			passwordView.label = $_('Secured control');
			passwordView.ok = (visuPw: string) => {
				controlStore.setControl(control, cmd, visuPw);
				appStore.setVisuPw(control.uuidAction, visuPw);
			};
			passwordView.openDialog = true;
			return;
		}
		controlStore.setControl(control, cmd);
	}

	function updateStatus(level: number): void {
		switch (level) {
			case 0: 
				statusName = 'Everything OK'; 
				statusColor = 'dark:text-primary-500 text-primary-700';
				break;
			case 1: 
				statusName = 'Pre-alarm active'; 
				statusColor = 'text-red-500 fill-red-500';
				break;
			case 2: 
				statusName = 'Main alarm active'; 
				statusColor = 'text-red-500 fill-red-500';
				break;
			case 99: // service
				statusName = 'Alarm suppression enabled'
				duration = ' (' + ((timeServiceMode>60) ? 
												(Math.floor(timeServiceMode/60) + ' min)') : 
												(timeServiceMode + ' sec)'));
				statusColor = 'text-blue-500 fill-blue-500';
				break;
			default: 
				statusName = '';
				statusColor = '';
		}
	}

	function stopService(): void {
		if (timeServiceMode > 0) { // only stop if servicemode is running
			setControl('servicemode/0');
		}
		duration = '';
	}

	function startService(): void {
		if (serviceTime > 0) { // TODO minimal time for service
			setControl('servicemode/' + String(serviceTime));
		}
	}

	function setTimer(h: number, m: number): void {
		hours += h;
		hours = (hours>23) ? (hours = 0) : (hours<0) ? (hours = 23) : hours;
		minutes += m;
		minutes = (minutes>59) ? (minutes = 0) : (minutes<0) ? (minutes = 59) : minutes;
		serviceTime= hours * 3600 + minutes * 60;
	}

	async function close(): Promise<void> {
		controlView.dialog.action(false);
		await tick();
		selectedTab = 1;
	}

	$effect( () => {
		updateStatus(level);
		if (timeServiceMode==1) duration = '';
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	{#if controlView.dialog.state}
		<Dialog
			open={controlView.dialog.state}
			onInteractOutside={close}>
			<Portal>
				<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
				<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
					<Dialog.Content class="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
										max-w-full max-h-full overflow-auto w-[380px] {fadeInOut}">
						<LbInfo control={controlView.control}/>
						<header class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<LbIcon name="x" height="16" width="16"/>
								</button>
							</div>
						</header>
						<Dialog.Description>
							{#if selectedTab==1}
							<div class="truncate justify-center text-center mb-2">
								{#if controlView.statusName}
									<p class="text-lg truncate {controlView.statusColor}">{$_(controlView.statusName)} {duration}</p>
								{/if}
							</div>
							{/if}
							{#if selectedTab==2}
							<div class="justify-center text-center">
								<p class="h5 text-lg dark:text-surface-300 text-surface-700">{$_("Duration servicemode")} ({$_("Hours").toLocaleLowerCase()} : {$_("Minutes").toLocaleLowerCase()})</p>
							</div>
							<div class="w-[100px] m-auto justify-center text-center">
								<div class="grid grid-cols-3">
									<div class="-mb-1"><button class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(1,0)}><LbIcon name="chevron-up"/></button></div>
									<div class="-mb-1"></div>
									<div class="-mb-1"><button class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" type="button" onclick={() => setTimer(0,1)}><LbIcon name="chevron-up"/></button></div>
									<div>{hours}</div>
									<div>:</div>
									<div>{minutes}</div>
									<div><button type="button" class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(-1,0)}><LbIcon name="chevron-down"/></button></div>
									<div></div>
									<div><button type="button" class="btn-icon p-1 bg-surface-50-950 rounded-lg border border-black hover:border-white/50" onclick={() => setTimer(0,-1)}><LbIcon name="chevron-down"/></button></div>
								</div>
							</div>
							<div class="m-3">
								<button type="button" class="w-full btn btn-lg bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
												onclick={(e) => {e.stopPropagation(); e.preventDefault(); serviceButton.click();}}>
									{#if serviceButton.name}
										<span class="text-lg">{$_(serviceButton.name)}</span>
									{/if}
								</button>
							</div>
							{/if}
							<div class="sticky bottom-0 left-0 w-full h-16 pt-4">
								<div class="grid h-full max-w-lg grid-cols-2 mx-auto">
									<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
										{selectedTab==1 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectedTab=1;}}>
										<LbIcon name="info"/>
										<span class="mt-1 text-xs">{$_("Status")}</span>
									</button>
									<button type="button" class="inline-flex flex-col items-center justify-center px-5 group
										{selectedTab==2 ? 'dark:text-primary-500 text-primary-700' : ''} " onclick={() => {selectedTab=2;}}>
										<LbIcon name="wrench"/>
										<span class="mt-1 text-xs">{$_("Service mode")}</span>
									</button>
								</div>
							</div>
						</Dialog.Description>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog>
	{/if}
	<LbGeneralDialog bind:view={passwordView}/>
</div>
