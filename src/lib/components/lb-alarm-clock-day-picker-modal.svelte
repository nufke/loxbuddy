<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { store } from '$lib/stores/store.svelte';
	import { tick } from 'svelte';
	import { X } from '@lucide/svelte';

	let { entry, onValueChange, label } = $props();

	// use temprary entry object till OK is pressed
	let setEntry = $derived({
		modes: entry.modes,
		daily: entry.daily,
		nightLight: entry.nightLight
	});

	let opModes = store.structure.operatingModes;

	let openModal = $state(false);
	let daysFull = $_('DaysFull').split('|');
	let weekDayNrs = $derived(Object.keys(opModes).filter( (key) => daysFull.includes(opModes[key].toLowerCase())));
	let filteredWeekDayNrs = $derived(weekDayNrs.filter( (key) => entry.modes.includes(Number(key))));

	function setValue(i: number) {
		if (setEntry.modes.includes(i)) {
			setEntry.modes = setEntry.modes.filter( (n: number) => n != i); // remove item
		} else {
			setEntry.modes = [...setEntry.modes, i]; // add item
		}
	}

	async function cancel() {
		openModal = false;
		await tick();
		setEntry.modes = entry.modes; // restore latest accepted modes
		setEntry.daily = entry.daily; // restore latest accepted daily setting
	}
</script>

<button onclick={() => (openModal = true)}>
	<div class="flex flex-row gap-1">
		{#if entry.nightLight}
			<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
				{entry.daily ? $_("Daily").toLowerCase() : $_("Once").toLowerCase()}
			</div>
		{:else}
			{#if filteredWeekDayNrs.length} 
				{#each filteredWeekDayNrs as i}
					<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
						{opModes[i].slice(0,2).toLowerCase()}
					</div>
				{/each}
			{:else}
				<p class="text-sm dark:text-surface-700 text-surface-300'}">{$_("No entries")}</p>
			{/if}
		{/if}
	</div>
</button>

<Modal
	open={openModal}
	transitionsBackdropIn={fade200}
	transitionsBackdropOut={fade200}
	transitionsPositionerIn={fade200}
	transitionsPositionerOut={fade200}
	onOpenChange={cancel}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							md:max-w-9/10 md:max-h-9/10 overflow-auto w-[340px]"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={cancel}></div>
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={cancel}>
					<X />
				</button>
			</div>
		</header>
		<div class="flex flex-col items-center justify-center">
			<h2 class="h4 text-center items-center justify-center w-[80%]">{label}</h2>
			{#if setEntry.nightLight}
				<form class="mt-4 space-y-2">
				  <label class="flex items-center space-x-2">
						<input class="radio" type="radio" checked={setEntry.daily} name="daily" onclick={() => {setEntry.daily=true}}/>
						<p>{$_("Daily")}</p>
				  </label>
				  <label class="flex items-center space-x-2">
						<input class="radio" type="radio" checked={!setEntry.daily} name="once" onclick={() => {setEntry.daily=false}} />
						<p>{$_("Once")}</p>
				  </label>
				</form>
			{:else}
				<form class="mt-4 space-y-2">
					{#each weekDayNrs as i}
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" checked={setEntry.modes.includes(Number(i))} onclick={() => {setValue(Number(i))}}/>
						<p>{opModes[i]}</p>
					</label>
					{/each}
				</form>
			{/if}
		</div>
		<div class="mt-6 flex grid grid-cols-2 gap-2">
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={cancel}>
				<span class="text-lg">{$_('Cancel')}</span>
			</button>
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={() => { openModal = false; onValueChange({value: entry.nightLight ? setEntry.daily : setEntry.modes});}}>
				<span class="text-lg">{$_('OK')}</span>
			</button>
		</div>
	{/snippet}
</Modal>
