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
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
	backdropClasses="backdrop-blur-sm">
	{#snippet content()}
	<header class="relative">
		<div class="flex justify-center">
			<div class="placeholder-circle flex h-18 w-18 items-center justify-center">
				<svg use:inlineSvg={'/loxicons/' + vm.iconName} fill={vm.iconColor} width="36" height="36"></svg>
			</div>
		</div>
		<div class="absolute right-0 top-0">
			<button type="button" class="btn-icon" on:click={()=>vm.modal?.action(false)}><X/></button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center m-2">
		<div>
			<h2 class="h4 text-center">{vm.textName}</h2>
		</div>
			<div class="mt-4 truncate">
			<p class="text-md truncate">{vm.statusName}</p>
		</div>
		{#if vm.buttons}
			{#each vm.buttons as button, index}
				{#if index > 0}
					<div class="ml-2"></div>
				{/if}
				{#if button.type === 'button' && button.name}
					<button type="button" class="w-[250px] btn btn-lg preset-tonal-primary shadow-xl" 
							on:click|stopPropagation|preventDefault={button.action}>
						<span style="font-size:18px">Push</span>
					</button>
				{/if}
				{#if button.type == 'switch'}
					<!--<Switch name="slide" controlActive="bg-green-500" checked={button.state} onCheckedChange={button.action} />-->
				{/if}
			{/each}
		{/if}
	</div>
	{/snippet}
</Modal>
