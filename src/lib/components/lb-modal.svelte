<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import LucideIcon from './icon-by-name.svelte';
	import { X } from '@lucide/svelte';
	import { Slider } from '@skeletonlabs/skeleton-svelte';

	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };

  function getButtonName(vm: any, name: string, state: boolean) {
		let s = name.split(',');
		return state ? s[0] : s[1];
	}

</script>

<Modal
	open={vm.modal?.state}
	onOpenChange={()=>vm.modal?.action(false)}
	triggerBase="btn preset-tonal"
	contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl rounded-lg border border-white/5
							from-white/[0.095] to-white/5 max-w-9/10 max-h-9/10 overflow-auto w-[380px]"
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
		<div class="container flex">
		{#if vm.buttons}
			{#each vm.buttons as button, index}
				{#if index > 0}
					<div class="ml-2"></div>
				{/if}
				{#if button.type === 'button' && button.action}
					<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
							on:click|stopPropagation|preventDefault={button.action}>
							{#if button.name}
								<span style="font-size:18px">{button.name}</span>
							{:else}
								<span style="font-size:26px">
									<LucideIcon name={button.iconName} />
								</span>
							{/if}
					</button>
				{/if}
				{#if button.type == 'switch' && button.name }
					<button type="button" class="w-full btn btn-lg preset-tonal-primary shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
							on:click|stopPropagation|preventDefault={() => button.action({checked: !button.state})}>
						<span style="font-size:18px">{getButtonName(vm, button.name, button.state ? true : false)}</span>
					</button>
				{/if}
				{/each}
		{/if}
		</div>
	</div>
	{/snippet}
</Modal>
