<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import type { Button } from '$lib/types/models';
	import { fadeInOut } from '$lib/helpers/styles';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';

	let { view = $bindable() } = $props();

	let returnObj: any; // Dialog can return any object
	let selectedButton: any = $derived(view.buttons ? view.buttons.find( (b: Button) => b.selected): null);

	function buttonSelect(id: number): void {
		selectedButton = {};
		selectedButton.id = id;
		returnObj = id; // store selected button
	}

	function cancel(): void {
		view.openDialog = false;
		view.cancel()
	}

	function ok(): void {
		view.openDialog = false;
		view.ok(returnObj);
	}
</script>

{#if view.openDialog}
	<Dialog
		open={view.openDialog}
		onInteractOutside={cancel}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-40 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									max-w-full max-h-full w-[450px] {fadeInOut}">
					{#if view.label}
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={cancel}>
								<LbIcon name="x" height="16" width="16"/>
							</button>
						</div>
					</header>
					{/if}
					<Dialog.Description>
						<div class="w-full mt-3 mb-2 grid gap-2">
							{#if view.buttons && view.buttons.length}
								{#each view.buttons as button}
								<button type="button" class="w-full h-[48px] btn btn-lg { selectedButton.id == button.id ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
											shadow-sm rounded-lg border border-white/15 hover:border-white/50"
												onclick={(e) => { e.stopPropagation(); e.preventDefault(); buttonSelect(button.id)}}>
											<span class="text-lg">{$_(button.name)}</span>
								</button>
								{/each}
							{/if}
						</div>
						<div class="flex grid grid-cols-2 gap-2 mt-4 w-full">
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={cancel}>
								<p class="truncate text-lg">{$_("Cancel")}</p>
							</button>
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={ok}>
								<p class="truncate text-lg">{$_("OK")}</p>
							</button>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
