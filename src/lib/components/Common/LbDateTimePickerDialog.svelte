<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import LbTimePicker from '$lib/components/Common/LbTimePicker.svelte';
	import LbDatePicker from '$lib/components/Common/LbDatePicker.svelte';
	import { _ } from 'svelte-i18n';
	import { innerWidth } from 'svelte/reactivity/window';
	import { XIcon } from '@lucide/svelte';

	let { date, onValueChange, view = $bindable() } = $props();

	let localDate = $derived(new SvelteDate(date));
	let width = $derived((innerWidth.current && innerWidth.current < 900) || !view.isDateView ? 'w-[420px]' : 'w-[660px]');
	let flexCol = $derived(innerWidth.current && innerWidth.current < 900 ? 'flex-col' : 'flex-row space-x-4');

	function valueChanged() {
		view.openDialog = false;
		return (localDate != date)
	}

	function close() {
		view.openDialog = false;
	}
</script>

{#if view.openDialog}
	<Dialog
		open={view.openDialog}
		onInteractOutside={close}>
		<Portal>
			<Dialog.Backdrop class="fixed inset-0 z-30 bg-surface-50-950/75 backdrop-blur-sm"/>
			<Dialog.Positioner class="fixed inset-0 z-30 flex justify-center items-center p-4">
				<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
									md:max-w-9/10 md:max-h-9/10 {width}">
					<header class="grid grid-cols-[5%_90%_5%]">
						<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
						<div>
							<Dialog.Title class="h5 flex justify-center items-center">{view.label}</Dialog.Title>
						</div>
						<div class="flex justify-center items-center">
							<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
								<XIcon class="size-4"/>
							</button>
						</div>
					</header>
					<Dialog.Description>
						<div class="flex flex-row items-center justify-center">
							<div class="flex {flexCol} items-center justify-center">
									{#if view.isDateView}
										<LbDatePicker bind:date={localDate} {view}/>
									{/if}
										<LbTimePicker bind:date={localDate} {view}/>
							</div>
						</div>
						<div class="flex justify-center items-center w-full">
						<div class="flex grid grid-cols-2 gap-2 mt-1 mb-1">
							<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
											onclick={close}>
								<span class="text-lg">{$_("Cancel")}</span>
							</button>
							<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
										onclick={ () => { valueChanged() ? onValueChange({value: localDate}) : null}}>
								<span class="text-lg">{$_("OK")}</span>
							</button>
						</div>
					</div>
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Positioner>
		</Portal>
	</Dialog>
{/if}
