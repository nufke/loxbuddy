<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';

	let { modes, isActive, onValueChange } = $props();

	let setModes = modes; // use temprary modes till OK is pressed
	let opModes = store.structure.operatingModes;

	let openModal = $state(false);
	let daysFull = $_('DaysFull').split('|');
	let weekDayNrs = $derived(Object.keys(opModes).filter( (key) => daysFull.includes(opModes[key].toLowerCase())));
	let filteredWeekDayNrs = $derived(weekDayNrs.filter( (key) => modes.includes(Number(key))));

	function setValue(i: number) {
		if (setModes.includes(i)) {
			setModes = setModes.filter( (n: number) => n != i); // remove item
		} else {
			setModes = [...setModes, i]; // add item
		}
	}
</script>

<button onclick={() => (openModal = true)}>
	<div class="flex flex-row gap-1">
		{#if filteredWeekDayNrs.length} 
			{#each filteredWeekDayNrs as i}
				<div class="text-sm {isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
					{opModes[i].slice(0,2).toLowerCase()}
				</div>
			{/each}
		{:else}
			<p class="text-sm dark:text-surface-700 text-surface-300'}">No entries</p>
		{/if}
	</div>
</button>

<Modal
	open={openModal}
	transitionsBackdropIn={fade200}
	transitionsBackdropOut={fade200}
	transitionsPositionerIn={fade200}
	transitionsPositionerOut={fade200}
	onOpenChange={() => {openModal = false}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							max-w-9/10 max-h-9/10 overflow-auto w-[340px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
		<div class="m-2 flex flex-col items-center justify-center">
			<form class="space-y-2">
				{#each weekDayNrs as i}
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" checked={modes.includes(Number(i))} onclick={() => {setValue(Number(i))}}/>
					<p>{opModes[i]}</p>
				</label>
				{/each}
			</form>
		</div>
		<div class="mt-4 flex grid grid-cols-2 gap-2">
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={() => openModal = false}>
				<span class="text-lg">{$_('Cancel')}</span>
			</button>
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={() => { openModal = false; modes = setModes; onValueChange({value: setModes});}}>
				<span class="text-lg">{$_('OK')}</span>
			</button>
		</div>
	{/snippet}
</Modal>
