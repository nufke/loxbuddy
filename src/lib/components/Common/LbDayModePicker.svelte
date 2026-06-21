<script lang="ts">
	import { _ } from 'svelte-i18n';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { open = $bindable(false), title = '', modes, dayModes, onValueChange } = $props();

	let newDayModes = $derived(modes);
	let hideEntries = $state(true);
	let entries = $derived(reorderEntries(dayModes));

	type Mode = {
		mode: string;
		name: string;
		show: boolean;
	}

	function reorderEntries(modes: any, hideEntries: boolean = true): Mode[] {
		let items: Mode[] = [];
		let opModes = controlStore.operatingModes;
		let opModesKeys = Array.from(opModes.keys());
		opModesKeys.forEach((key) => { 
			items.push({
				mode: key,
				name: opModes.get(key) ?? '',
				show: modes[key] ? true : !hideEntries
			});
		});
		return items;
	}

	function expandList(): void {
		hideEntries = !hideEntries;
	}

	function close(): void {
		open = false;
	}

	function setDayMode(m: string): void {
		if (newDayModes.includes(m)) {
			newDayModes = newDayModes.filter( (s: string) => s != m); // remove item
		} else {
			newDayModes = [...newDayModes, m]; // add item
		}
	}
</script>

<LbDialog {open} onClose={close} {title} zIndex="z-30" width="w-[340px]">
	{#snippet description()}
		<div class="flex flex-col items-center justify-center h-full">
			<div class="mt-2 overflow-y-auto h-full">
				<form class="space-y-2 p-2 w-[220px]">
					{#each entries as item}
						{#if item.show}
						<label class="flex items-center justify-start space-x-2">
							<input class="checkbox" type="checkbox" checked={newDayModes.includes(item.mode)} onclick={() => setDayMode(item.mode)}/>
							<p>{item.name}</p>
						</label>
						{/if}
					{/each}
				</form>
			</div>
			<button type="button" class="mt-4 btn btn-md bg-surface-50-950 rounded-lg border border-white/15 shadow-sm hover:border-white/50 active:bg-primary-500"
							onclick={expandList}>
				<p class="text-xs flex items-center justify-end">{hideEntries ? $_("Show more") : $_("Show less")}</p>
			</button>
			<div class="mt-4 grid grid-cols-2 gap-2">
				<button type="button"
					class="btn btn-lg bg-surface-50-950 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50 active:bg-primary-500"
					onclick={close}>
					<span class="text-lg">{$_('Cancel')}</span>
				</button>
				<button type="button"
					class="btn btn-lg bg-surface-50-950 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50 active:bg-primary-500"
					onclick={() => { onValueChange({modes: newDayModes}); close(); }}>
					<span class="text-lg">{$_('OK')}</span>
				</button>
			</div>
		</div>
	{/snippet}
</LbDialog>
