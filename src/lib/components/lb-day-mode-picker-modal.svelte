<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { X } from '@lucide/svelte';

	let { view = $bindable(), modes, dayModes, onValueChange } = $props();

	let newDayModes = $derived(modes);
	let dayModeEntries = $derived(Object.entries(dayModes));

	async function cancel() {
		view.openModal = false;
	}

	function setDayMode(m: string) {
		if (newDayModes.includes(m)) {
			newDayModes = newDayModes.filter( (s: string) => s != m); // remove item
		} else {
			newDayModes = [...newDayModes, m]; // add item
		}
	}
</script>

<Modal
	open={view.openModal}
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
			<h2 class="h4 text-center items-center justify-center w-[80%]">{view.label}</h2>
			<form class="mt-4 space-y-2">
				{#each dayModeEntries as entry}
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" checked={newDayModes.includes(entry[0])} onclick={() => {setDayMode(entry[0])}}/>
					<p>{entry[1]}</p>
				</label>
				{/each}
			</form>
		</div>
		<div class="mt-6 flex grid grid-cols-2 gap-2">
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={cancel}>
				<span class="text-lg">{$_('Cancel')}</span>
			</button>
			<button type="button"
				class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
				onclick={() => { view.openModal = false; onValueChange({modes: newDayModes});}}>
				<span class="text-lg">{$_('OK')}</span>
			</button>
		</div>
	{/snippet}
</Modal>
