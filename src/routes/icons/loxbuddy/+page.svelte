<script lang="ts">
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { listIcons } from '@iconify/svelte';
	import { registerCustomIcons } from '$lib/helpers/registerIcons';

	registerCustomIcons();

	const allIcons = listIcons('', 'loxbuddy').map((n) => n.replace('loxbuddy:', '')).sort();

	let search = $state('');
	let icons = $derived(search ? allIcons.filter((n) => n.includes(search.toLowerCase())) : allIcons);
</script>

<div class="container max-w-[1280px] p-4">
	<div class="mb-4">
		<input class="input p-2 w-full max-w-[400px]" type="text" bind:value={search} placeholder="Search icon name..." />
		<p class="mt-1 text-xs dark:text-surface-400 text-surface-600">{icons.length} icons</p>
	</div>
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
		{#each icons as name}
			<div class="flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 hover:border-white/30">
				<LbIcon class="dark:text-surface-50 text-surface-950" name={`loxbuddy:${name}`} width="32" height="32" />
				<p class="text-xs truncate w-full text-center" title={name}>{name}</p>
				<p class="text-xs dark:text-surface-500 text-surface-500 truncate w-full text-center" title={`/icons/loxbuddy/${name}.svg`}>{name}.svg</p>
			</div>
		{/each}
	</div>
</div>
