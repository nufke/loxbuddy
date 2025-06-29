<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { SvelteDate } from 'svelte/reactivity';
	import LbTimePicker from '$lib/components/lb-time-picker.svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { Utils } from '$lib/helpers/utils';

	let { alarmTime = $bindable() }= $props();

	let date = $derived(new SvelteDate(Utils.time2epoch(Date.now(), Utils.dec2hours(alarmTime))));

	let openModal = $state(false);

	let dateTimeView = $state({
		isDateView: true,
		isMinuteView: false,
		label: false
	});
</script>

<button onclick={()=>openModal=true}>
	{Utils.epoch2TimeStr(date?.valueOf()/1000)}
</button>

<Modal
	open={openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={() => openModal = false}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
		<div class="flex flex-col items-center justify-center m-2">
			<div>
				<LbTimePicker bind:date={date} bind:view={dateTimeView}/>
			</div>
		</div>
	{/snippet}
</Modal>
