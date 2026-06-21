<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import LbTimePicker from '$lib/components/Common/LbTimePicker.svelte';
	import LbDatePicker from '$lib/components/Common/LbDatePicker.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { _ } from 'svelte-i18n';
	import { innerWidth } from 'svelte/reactivity/window';

	let { date, onValueChange, open = $bindable(false), title = '', isDateView = false, isMinuteView = false } = $props();

	let localDate = $derived(new SvelteDate(date));
	let width = $derived((innerWidth.current && innerWidth.current < 900) || !isDateView ? 'w-[420px]' : 'w-[660px]');
	let flexCol = $derived(innerWidth.current && innerWidth.current < 900 ? 'flex-col' : 'flex-row space-x-4');

	function valueChanged(): boolean {
		open = false;
		return (localDate != date)
	}

	function close(): void {
		open = false;
	}
</script>

<LbDialog {open} onClose={close} {title} zIndex="z-30" {width}>
	{#snippet description()}
		<div class="flex flex-row items-center justify-center">
			<div class="flex {flexCol} items-center justify-center">
				{#if isDateView}
					<LbDatePicker bind:date={localDate}/>
				{/if}
				<LbTimePicker bind:date={localDate} {isMinuteView}/>
			</div>
		</div>
		<div class="flex justify-center items-center w-full">
			<div class="grid grid-cols-2 gap-2 mt-1 mb-1">
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={close}>
					<span class="text-lg">{$_("Cancel")}</span>
				</button>
				<button type="button" class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
								onclick={() => { valueChanged() ? onValueChange({value: localDate}) : null }}>
					<span class="text-lg">{$_("OK")}</span>
				</button>
			</div>
		</div>
	{/snippet}
</LbDialog>
