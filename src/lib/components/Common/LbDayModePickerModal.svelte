<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { fade200 } from '$lib/helpers/transition';
	import { _ } from 'svelte-i18n';
	import { X } from '@lucide/svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { innerHeight } from 'svelte/reactivity/window';
	import { tick } from 'svelte';

	let { view = $bindable(), modes, dayModes, onValueChange } = $props();

	let newDayModes = $derived(modes);
	let hideEntries = $state(true);
	let entries = $derived(reorderEntries(dayModes));

	let modalViewport: any = $state(); // TODO make HTMLDivElement
	let windowHeight = $derived(innerHeight.current || 0);
	let limitHeight = $state(true); 

	$effect( () => {
		entries = reorderEntries(dayModes, hideEntries);
		if (windowHeight && modalViewport) { /* trigger on windowHeight change or hideEntries */
			limitHeight = false;
			tick().then( () => {
				limitHeight = (windowHeight * 0.9 - modalViewport.getBoundingClientRect().bottom - 7) < 0;
			});
		}
	});

	function reorderEntries(modes: any, hideEntries: boolean = true) {
		let items: any[] = [];
		let opModes = store.structure.operatingModes;
		Object.keys(opModes).forEach( key => { 
			items.push({
				mode: key,
				name: opModes[key],
				show: modes[key] ? true : !hideEntries
			});
		});
		return items;
	}

	function expandList() {
		hideEntries = !hideEntries;
	}

	function close() {
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
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							md:max-w-9/10 md:max-h-9/10 w-[340px] { limitHeight ? 'h-full': '' }"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
		<!-- TODO better method to create multiple modal overlays with backdrop? -->
		<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={close}></div>
		<header class="relative">
			<div class="absolute top-0 right-0">
				<button type="button" aria-label="close" class="btn-icon w-auto" onclick={close}>
					<X />
				</button>
			</div>
		</header>
		<div bind:this={modalViewport} class="flex flex-col items-center justify-center h-full">
			<p class="h5 text-center items-center justify-center w-[80%]">{view.label}</p>
			<div class="mt-4 overflow-y-auto h-full">
				<form class="space-y-2 p-2 w-[220px]">
					{#each entries as item}
					{#if item.show}
					<label class="flex items-center justify-start space-x-2">
						<input class="checkbox" type="checkbox" checked={newDayModes.includes(item.mode)} onclick={() => {setDayMode(item.mode)}}/>
						<p>{item.name}</p>
					</label>
					{/if}
					{/each}
				</form>
			</div>
			<button type="button" class="mt-4 btn btn-md dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 shadow-sm hover:border-white/50"
							onclick={expandList}>
				<p class="text-xs flex items-center justify-end">{hideEntries ? $_("Show more") : $_("Show less")}</p>
			</button>
			<div class="mt-4 flex grid grid-cols-2 gap-2">
				<button type="button"
					class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
					onclick={close}>
					<span class="text-lg">{$_('Cancel')}</span>
				</button>
				<button type="button"
					class="btn btn-lg dark:bg-surface-950 bg-surface-50 w-full rounded-lg border border-white/15 shadow-sm hover:border-white/50"
					onclick={() => { onValueChange({modes: newDayModes}); close();}}>
					<span class="text-lg">{$_('OK')}</span>
				</button>
			</div>
		</div>
	{/snippet}
</Modal>
