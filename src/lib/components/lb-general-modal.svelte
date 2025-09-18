<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';
	import type { Button } from '$lib/types/models';

	let { view = $bindable() } = $props();

	let returnObj: any; // Modal can return any object
	let selectedButton: any = $derived(view.buttons ? view.buttons.find( (b: Button) => b.selected): null);

	function buttonSelect(id: number) {
		selectedButton = {};
		selectedButton.id = id;
		returnObj = id; // store selected button
	}
</script>

<Modal
	open={view.openModal}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
								md:max-w-9/10 md:max-h-9/10 w-[350px]"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop?-->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>{view.openModal=false}}></div> 
		<p class="h5 flex w-full items-center justify-center mb-2">{view.title}</p>
		<div class="flex flex-col items-center justify-center">
			{#if view.label}
				<p class="m-2 text-lg text-center">{view.label}</p>
			{/if}
			<div class="w-full mt-2 mb-2 grid gap-2">
					{#if view.buttons && view.buttons.length}
					{#each view.buttons as button}
					<button type="button" class="w-full h-[48px] btn btn-lg { selectedButton.id == button.id ? 'dark:bg-surface-800 bg-surface-200' : 'dark:bg-surface-950 bg-surface-50' }
								 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
									onclick={(e) => { e.stopPropagation(); e.preventDefault(); buttonSelect(button.id)}}>
								<span class="text-lg">{$_(button.name)}</span>
					</button>
					{/each}
				{/if}
			</div>
			<div class="flex grid grid-cols-2 gap-2 mt-2 w-full">
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={() => {view.openModal=false; view.cancel()}}>
					<p class="truncate text-lg">{$_("Cancel")}</p>
				</button>
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={() => {view.openModal=false; view.ok(returnObj)}}>
					<p class="truncate text-lg">{$_("OK")}</p>
				</button>
			</div>
		</div>
	 {/snippet}
</Modal>
