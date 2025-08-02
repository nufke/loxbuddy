<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { _ } from 'svelte-i18n';
	import { fade200 } from '$lib/helpers/transition';

	let { open = $bindable() } = $props();

</script>

<Modal
	open={open}
	transitionsBackdropIn = {fade200}
	transitionsBackdropOut = {fade200}
	transitionsPositionerIn = {fade200}
	transitionsPositionerOut = {fade200}
	onOpenChange={()=>{}}
	triggerBase="btn bg-surface-600"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-sm rounded-lg border border-white/5 hover:border-white/10
							md:max-w-9/10 md:max-h-9/10 h-full"
	backdropClasses=""
	backdropBackground="">
	{#snippet content()}
	<div class="flex flex-col h-full">
		<div>
			<h2 class="h4 text-center">Name</h2>
		</div>
		<div class="m-2 truncate">
		</div>
		<div class="flex-auto h-[0px] overflow-y-auto">
				<p class="text-lg dark:text-surface-50 text-surface-950">DATE</p>
				<hr class="hr" />
				<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
				</div>
				<p class="text-lg dark:text-surface-50 text-surface-950">DATE</p>
				<hr class="hr" />
				<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
				</div>
				<p class="text-lg dark:text-surface-50 text-surface-950">DATE</p>
				<hr class="hr" />
				<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
				</div>
				<p class="text-lg dark:text-surface-50 text-surface-950">DATE</p>
				<hr class="hr" />
				<div class="grid grid-cols-5 gap-2 mt-2 mb-2">
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
						<p class="text-md dark:text-surface-300 text-surface-700">time</p>
						<p class="text-md col-span-4">description</p>
				</div>
			</div>
	</div>
	{/snippet}
</Modal>
