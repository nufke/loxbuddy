<script lang="ts">
	import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { tick } from 'svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';

	let { entry, onValueChange, label } = $props();

	// use temprary entry object till OK is pressed
	let setEntry = $state({
		modes: entry.modes,
		daily: entry.daily,
		nightLight: entry.nightLight
	});

	let opModes = $derived(controlStore.operatingModes);
	let opModesKeys = $derived(Array.from(opModes.keys()));
	let openDialog = $state(false);
	let daysFull = $_('DaysFull').toLowerCase().split('|');
	let weekDayNrs = $derived(opModesKeys.filter( (key) => daysFull.includes(getMode(key))));
	let filteredWeekDayNrs = $derived(weekDayNrs.filter( (key) => entry.modes.includes(Number(key))));

	function getMode(mode: string) {
		const name = opModes.get(mode);
		return name ? name.toLowerCase() : '';
	}

	function setValue(i: number) {
		if (setEntry.modes.includes(i)) {
			setEntry.modes = setEntry.modes.filter( (n: number) => n != i); // remove item
		} else {
			setEntry.modes = [...setEntry.modes, i].sort(); // add item and sort
		}
	}

	async function close() {
		openDialog = false;
		await tick();
		setEntry.modes = entry.modes; // restore latest accepted modes
		setEntry.daily = entry.daily; // restore latest accepted daily setting
	}
</script>

<button onclick={() => (openDialog = true)}>
	<div class="flex flex-row gap-1">
		{#if entry.nightLight}
			<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
				{entry.daily ? $_("Daily").toLowerCase() : $_("Once").toLowerCase()}
			</div>
		{:else}
			{#if filteredWeekDayNrs.length} 
				{#each filteredWeekDayNrs as i}
					<div class="text-sm {entry.isActive ? 'dark:text-surface-50 text-surface-950' : 'dark:text-surface-700 text-surface-300'}">
						{opModes.get(i)?.slice(0,2).toLowerCase()}
					</div>
				{/each}
			{:else}
				<p class="text-sm dark:text-surface-700 text-surface-300'}">{$_("No entries")}</p>
			{/if}
		{/if}
	</div>
</button>


<Dialog
	open={openDialog}
	onInteractOutside={close}>
	<Portal>
		<Dialog.Backdrop class="fixed inset-0 z-10 bg-surface-50-950/75 backdrop-blur-sm"/>
		<Dialog.Positioner class="fixed inset-0 z-10 flex justify-center items-center p-4">
			<Dialog.Content class="card bg-surface-100-900 p-4 pt-3 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 overflow-auto w-[340px]">
				<header class="grid grid-cols-[5%_90%_5%]">
					<div class="flex justify-center items-center"></div><!-- placeholder for menu -->
					<div>
						<Dialog.Title class="h5 flex justify-center items-center">{label}</Dialog.Title>
					</div>
					<div class="flex justify-center items-center">
						<button type="button" class="btn-icon hover:preset-tonal" onclick={close}>
							<LbIcon name="x" height="16" width="16"/>
						</button>
					</div>
				</header>
				<Dialog.Description>
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
									<p>{opModes.get(i)}</p>
								</label>
								{/each}
							</form>
						{/if}
					</div>
					<div class="mt-6 flex grid grid-cols-2 gap-2">
						<button type="button"
							class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
							onclick={close}>
							<span class="text-lg">{$_('Cancel')}</span>
						</button>
						<button type="button"
							class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
							onclick={() => {onValueChange({value: entry.nightLight ? setEntry.daily : setEntry.modes}); close();}}>
							<span class="text-lg">{$_('OK')}</span>
						</button>
					</div>
				</Dialog.Description>
			</Dialog.Content>
		</Dialog.Positioner>
	</Portal>
</Dialog>
