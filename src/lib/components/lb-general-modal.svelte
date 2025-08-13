<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';

	let { view = $bindable() } = $props();

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
								md:max-w-9/10 md:max-h-9/10 w-[320px]"
	backdropClasses="backdrop-blur-sm"
	backdropBackground="">
	{#snippet content()}
	<!-- TODO better method to create multiple modal overlays with backdrop?-->
	<div class="fixed w-full h-full top-0 left-0 right-0 bottom-0 -z-10 bg-surface-50/75 dark:bg-surface-950/75" onclick={()=>{view.openModal=false}}></div> 
		<div class="flex flex-col items-center justify-center">
			<p class="m-2 text-lg text-center">{view.label}</p>
			<div class="flex grid grid-cols-2 gap-2 mt-2">
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => {view.openModal=false; view.cancel(e)}}>
					<p class="truncate text-lg">{$_("Cancel")}</p>
				</button>
				<button class="w-full btn btn-lg dark:bg-surface-950 bg-surface-50 shadow-sm rounded-lg border border-white/15 hover:border-white/50"
								onclick={(e) => {view.openModal=false; view.ok(e)}}>
					<p class="truncate text-lg">{$_("OK")}</p>
				</button>
			</div>
		</div>
	 {/snippet}
</Modal>
