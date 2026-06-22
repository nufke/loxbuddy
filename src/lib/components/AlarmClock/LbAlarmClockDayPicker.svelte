<script lang="ts">
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { _ } from 'svelte-i18n';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { tick } from 'svelte';

	let { entry, onValueChange, label, disabled } = $props();

	let daysFull = $_('DaysFull').toLowerCase().split('|');

	// use temprary entry object till OK is pressed
	let setEntry = $state({
		modes: entry.modes,
		daily: entry.daily,
		nightLight: entry.nightLight
	});

	let openDialog = $state(false);
	let weekDayNrs = $derived(controlStore.operatingModeList.filter( (key) => daysFull.includes(getMode(key))));
	let filteredWeekDayNrs = $derived(weekDayNrs.filter( (key) => entry.modes.includes(Number(key))));

	function getMode(mode: string): string {
		const name = controlStore.operatingModes.get(mode);
		return name ? name.toLowerCase() : '';
	}

	function setValue(i: number): void {
		if (setEntry.modes.includes(i)) {
			setEntry.modes = setEntry.modes.filter( (n: number) => n != i); // remove item
		} else {
			setEntry.modes = [...setEntry.modes, i].sort(); // add item and sort
		}
	}

	async function close(): Promise<void> {
		openDialog = false;
		await tick();
		setEntry.modes = entry.modes; // restore latest accepted modes
		setEntry.daily = entry.daily; // restore latest accepted daily setting
	}
</script>

<button disabled={disabled} onclick={() => (openDialog = true)}>
	<div class="flex flex-row gap-1">
		{#if entry.nightLight}
			<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
				{entry.daily ? $_("Daily").toLowerCase() : $_("Once").toLowerCase()}
			</div>
		{:else}
			{#if filteredWeekDayNrs.length} 
				{#each filteredWeekDayNrs as i}
					<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
						{controlStore.operatingModes.get(i)?.slice(0,2).toLowerCase()}
					</div>
				{/each}
			{:else}
				<p class="text-sm dark:text-surface-700 text-surface-300'}">{$_("No entries")}</p>
			{/if}
		{/if}
	</div>
</button>

<LbDialog open={openDialog} onClose={close} title={label} width="w-[340px]" zIndex="z-10">
	{#snippet description()}
		<div class="flex flex-col items-center justify-center">
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
						<p>{controlStore.operatingModes.get(i)}</p>
					</label>
					{/each}
				</form>
			{/if}
		</div>
		<div class="mt-6 grid grid-cols-2 gap-2">
			<button type="button"
				class="btn btn-lg bg-surface-50-950 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={close}>
				<span class="text-lg">{$_('Cancel')}</span>
			</button>
			<button type="button"
				class="btn btn-lg bg-surface-50-950 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={() => {onValueChange({value: entry.nightLight ? setEntry.daily : setEntry.modes}); close();}}>
				<span class="text-lg">{$_('OK')}</span>
			</button>
		</div>
	{/snippet}
</LbDialog>
