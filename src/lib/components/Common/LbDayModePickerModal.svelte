<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { XIcon } from '@lucide/svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { view = $bindable(), modes, dayModes, onValueChange } = $props();

	let newDayModes = $derived(modes);
	let hideEntries = $state(true);
	let entries = $derived(reorderEntries(dayModes));

	function reorderEntries(modes: any, hideEntries: boolean = true) {
		let items: any[] = [];
		let opModes = store.structure.operatingModes;
		Object.keys(opModes).forEach( key => { 
			items.push({
				mode: key,
				name: opModes[key],
				show: modes[key] ? true : !hideEntries
			});
		});
		return items;
	}

	function expandList() {
		hideEntries = !hideEntries;
	}

	function close() {
		view.openModal = false;
	}

	function setDayMode(m: string) {
		if (newDayModes.includes(m)) {
			newDayModes = newDayModes.filter( (s: string) => s != m); // remove item
		} else {
			newDayModes = [...newDayModes, m]; // add item
		}
	}
</script>

{#if view.openModal}
	<Dialog
		open={view.openModal}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-30 bg-surface-50-950/75 backdrop-blur-sm" />
			<Dialog.Positioner class="fixed inset-0 z-30 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 w-[340px]">
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
								<XIcon class="size-4" />
							</button>
						</div>
					</header>
					<Dialog.Description>
						<div class="flex flex-col items-center justify-center h-full">
							<div class="mt-2 overflow-y-auto h-full">
								<form class="space-y-2 p-2 w-[220px]">
									{#each entries as item}
										{#if item.show}
										<label class="flex items-center justify-start space-x-2">
											<input class="checkbox" type="checkbox" checked={newDayModes.includes(item.mode)} onclick={() => {setDayMode(item.mode)}}/>
											<p>{item.name}</p>
										</label>
										{/if}
									{/each}
								</form>
							</div>
							<button type="button" class="mt-4 btn btn-md dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 shadow-sm hover:border-white/50"
											onclick={expandList}>
								<p class="text-xs flex items-center justify-end">{hideEntries ? $_("Show more") : $_("Show less")}</p>
							</button>
							<div class="mt-4 flex grid grid-cols-2 gap-2">
								<button type="button"
									class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
									onclick={close}>
									<span class="text-lg">{$_('Cancel')}</span>
								</button>
								<button type="button"
									class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
									onclick={() => { onValueChange({modes: newDayModes}); close();}}>
									<span class="text-lg">{$_('OK')}</span>
								</button>
							</div>
						</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
