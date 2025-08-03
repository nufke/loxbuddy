<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import LbTimePicker from '$lib/components/lb-time-picker.svelte';
	import LbDatePicker from '$lib/components/lb-date-picker.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { innerWidth } from 'svelte/reactivity/window';
	import { X } from '@lucide/svelte';

	let { date, onValueChange, view = $bindable() } = $props();

	let setDate = $derived(new SvelteDate(date));
	let width = $derived((innerWidth.current && innerWidth.current < 900) || !view.isDateView ? 'w-[420px]' : 'w-[660px]');
	let flexCol = $derived(innerWidth.current && innerWidth.current < 900 ? 'flex-col' : 'flex-row space-x-4');

	function valueChanged() {
		view.openModal = false;
		if (setDate != date) {
			date = setDate;
			return {value: date};
		}
	}
</script>

<Modal
	open={view.openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={() => view.openModal = false}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-2 space-y-2 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-[95%] max-h-[95%] {width}"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>{view.openModal = false}}></div> 
			<header class="relative flex">
				<div class="flex justify-center text-center m-auto">
					<h2 class="h4 truncate">{view.label}</h2>
				</div>
				<div class="absolute top-0 right-0">
					<button type="button" aria-label="close" class="btn-icon w-auto" onclick={() => {view.openModal = false;}}>
						<X/>
					</button>
				</div>
			</header>
		<div class="flex flex-row items-center justify-center">
			<div class="flex {flexCol} items-center justify-center">
				{#if view.isDateView}
					<LbDatePicker bind:date={setDate} bind:view={view}/>
				{/if}
				<LbTimePicker bind:date={setDate} bind:view={view}/>
			</div>
		</div>
		<div class="flex justify-center items-center w-full">
		<div class="flex grid grid-cols-2 gap-2 mt-1 mb-1">
			<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={() => view.openModal = false}>
				<span class="text-lg">{$_("Cancel")}</span>
			</button>
			<button type="button" class="w-full btn btn-lg h-[48px] dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={ () => { valueChanged() ? onValueChange(valueChanged()) : null}}>
				<span class="text-lg">{$_("OK")}</span>
			</button>
		</div>
		</div>
	{/snippet}
</Modal>
