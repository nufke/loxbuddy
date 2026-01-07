<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import type { Button } from '$lib/types/models';
	import { fadeInOut } from '$lib/helpers/styles';

	let { view = $bindable() } = $props();

	let returnObj: any; // Dialog can return any object
	let selectedButton: any = $derived(view.buttons ? view.buttons.find( (b: Button) => b.selected): null);

	function buttonSelect(id: number) {
		selectedButton = {};
		selectedButton.id = id;
		returnObj = id; // store selected button
	}
</script>

{#if view.openDialog}
	<Dialog
		open={view.openDialog}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-40 bg-surface-50-950/75 backdrop-blur-sm {fadeInOut}"/>
			<Dialog.Positioner class="fixed inset-0 z-40 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[450px] {fadeInOut}">
					{#if view.label}
						<header>
							<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
						</header>
					{/if}
					<Dialog.Description>
						<div class="w-full mt-2 mb-2 grid gap-2">
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
						<div class="flex grid grid-cols-2 gap-2 mt-2 w-full">
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={() => {view.openDialog=false; view.cancel()}}>
								<p class="truncate text-lg">{$_("Cancel")}</p>
							</button>
							<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
											onclick={() => {view.openDialog=false; view.ok(returnObj)}}>
								<p class="truncate text-lg">{$_("OK")}</p>
							</button>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
