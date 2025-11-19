<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import type { ControlView } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbJalousieIcon from '$lib/components/Jalousie/LbJalousieIcon.svelte';
	import { XIcon } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';
	import Info from '$lib/components/Common/LbInfo.svelte';
	import { store } from '$lib/stores/Store.svelte';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

	let autoActive = $derived(Number(store.getState(controlView.control.states.autoActive)));

	function close() {
		controlView.dialog.action(false);
	}
</script>

{#if controlView.dialog.state}
	<Dialog
		open={controlView.dialog.state}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
			<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 overflow-auto w-[450px]">
					<Dialog.Description>
						<!--<Info control={controlView.control}/>-->
						<header class="grid grid-cols-[5%_90%_5%]">
							<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
							<div>
								<Dialog.Title class="h5 flex justify-center items-center">{controlView.textName}</Dialog.Title>
							</div>
							<div class="flex justify-center items-center">
								<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
									<XIcon class="size-4"/>
								</button>
							</div>
						</header>
						<div class="flex flex-col items-center justify-center mt-2">
							<div class="flex justify-center">
								<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 dark:bg-surface-950">
									<LbJalousieIcon control={controlView.control} width="36" height="36"/>
									{#if controlView.badgeIconName?.length}
										<div class="absolute top-[9px] left-[10px] inline-flex items-center justify-center w-[18px] h-[18px] {controlView.badgeIconColor} rounded-full
																border border-1 dark:border-surface-950 border-surface-50">
											<LbIcon class='dark:text-surface-950 text-surface-50' name={controlView.badgeIconName} size="10"/>
										</div>
									{/if}
								</div>
							</div>
							<div class="mt-2 truncate">
								<p class="text-lg truncate {autoActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">
									{ autoActive ? $_("Sun position detection enabled") : $_("Sun position detection disabled")}</p>
							</div>
							<div class="mt-2 truncate">
								<p class="text-lg truncate {controlView.statusColor}">{controlView.statusName}</p>
							</div>
							<div class="container flex grid grid-cols-2 gap-2 mt-6">
							{#if controlView.dialog && controlView.dialog.buttons}
								{#each controlView.dialog.buttons as button}
									{#if button.type === 'button'}
										<button type="button" class="w-full {button.class} btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
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
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
