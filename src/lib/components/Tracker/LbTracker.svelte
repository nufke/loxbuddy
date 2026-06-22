<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { format } from 'date-fns';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	type Entry = {
		time: number;
		description: string;
	}

	type Entries = {
		[key: string]: Entry[];
	}

	let controlOpen = $state(false);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let entries = $derived(controlStore.getState(control.states?.entries)) as String;
	let entryList = $derived(entries ? entries.split('|') : []);
	let entryMap = $derived(updateEntries(entryList));
	let lastEntryDate = $derived(Object.keys(entryMap)[0]);
	let statusName = $derived(lastEntryDate && entryMap[lastEntryDate][0] ? 
		format(new Date(Number(lastEntryDate)), "PPP ") + format(new Date(Number(entryMap[lastEntryDate][0].time)), "p") 
		: '');

	/**
	 * Sorts an Entries map so that the most recent date keys appear first,
	 * and sorts the entries within each day from latest to earliest time.
	 *
	 * @param entries - unsorted map of day-epoch strings to their entry arrays.
	 * @returns a new Entries object with keys and inner arrays sorted descending.
	 */
	function sortEntries(entries: Entries): Entries {
		return Object.keys(entries)
			.sort( (a, b) => Number(b) - Number(a))
			.reduce( (newEntries: Entries, key: string) => {
				newEntries[key] = entries[key].sort( (a, b) => b.time - a.time);
				return newEntries;
			}, {});
	}

	/**
	 * Parses the raw pipe-separated tracker entry strings into a sorted `Entries`
	 * map grouped by day.
	 *
	 * Each entry string is expected to match the pattern
	 * YYYY-MM-DD ... HH:MM:SS description. Entries that do not match are silently
	 * skipped. Matching entries are grouped by the midnight epoch of their date,
	 * with the time converted to an absolute epoch.
	 *
	 * @param list - array of raw entry strings from the pipe-split state value.
	 * @returns sorted Entries map (day epoch → Entry[]), newest day first.
	 */
	function updateEntries(list: string[]): Entries {
		let entries: Entries = {};
		list.forEach((item) => {
			const regex = new RegExp('([0-9]{4}-[0-9]{2}-[0-9]{2}).*([0-9]{2}:[0-9]{2}:[0-9]{2}).(.*)');
			const found = item.match(regex);
			if (found && found[1] && found[2] && found[3]) {
				let epoch: number = new Date(found[1]).valueOf();
				if (!entries[epoch]) { entries[epoch] = [] }
				entries[epoch].push({ time: utils.time2epoch(epoch, found[2]), description: found[3]})
			}
		});
		return sortEntries(entries)
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/**
	 * Closes the control dialog.
	 */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} {statusName}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-3 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon name={iconName} width="36" height="36"/>
				</div>
			</div>
			<div class="flex flex-col w-full pl-2 pr-2 overflow-y-auto max-h-[calc(90vh-180px)]">
				{#each Object.keys(entryMap) as key}
					<p class="text-lg dark:text-surface-50 text-surface-950">{format(new Date(Number(key)), "PPP")}</p>
					<hr class="hr" />
					<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
						{#each entryMap[key] as item}
							<p class="text-md dark:text-surface-300 text-surface-700">{format(new Date(Number(item.time)), "p")}</p>
							<p class="text-md col-span-4">{item.description}</p>
						{/each}
					</div>
				{/each}
			</div>
		{/snippet}
	</LbDialog>
{/if}
