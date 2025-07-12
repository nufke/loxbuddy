<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import LbTimePicker from '$lib/components/lb-time-picker.svelte';
	import LbDatePicker from '$lib/components/lb-date-picker.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';

	let { date, onValueChange, view = $bindable() } = $props();

	let setDate = $derived(new SvelteDate(date));

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
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[340px]"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
		<div class="flex flex-col items-center justify-center m-2">
			<div>
				{#if view.isDateView}
					<LbDatePicker bind:date={setDate} bind:view={view}/>
				{:else}
					<LbTimePicker bind:date={setDate} bind:view={view}/>
				{/if}
			</div>
		</div>
		<div class="flex grid grid-cols-2 gap-2 mt-4">
			<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={() => view.openModal = false}>
				<span class="text-lg">{$_("Cancel")}</span>
			</button>
			<button type="button" class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50" 
							onclick={ () => { valueChanged() ? onValueChange(valueChanged()) : null}}>
				<span class="text-lg">{$_("OK")}</span>
			</button>
		</div>
	{/snippet}
</Modal>
