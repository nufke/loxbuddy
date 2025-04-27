<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { X } from '@lucide/svelte';

	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };
</script>

<Modal
	open={vm.modal?.state}
	onOpenChange={()=>vm.modal?.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<div>
				<h2 class="h4">{vm.textName}</h2>
			</div>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" class="btn-icon w-auto" on:click={()=>vm.modal?.action(false)}><X/></button>
		</div>
	</header>

	<select class="border-0 select h-[380px]" size="4" value="1">
		<option value="1">Option 1</option>
		<option value="2">Option 2</option>
		<option value="3">Option 3</option>
		<option value="4">Option 4</option>
		<option value="5">Option 5</option>
	</select>

	{/snippet}
</Modal>
