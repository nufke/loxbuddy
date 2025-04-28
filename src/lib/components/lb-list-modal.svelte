<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { type ControlView, DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { X } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';

	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };

	$: index = (vm.modal && vm.modal.list) ? vm.modal.list.findIndex(item => { return item.name === vm.statusName }) : 0;

	function setColor(i: number) {
		if (i==index) {
			return 'preset-tonal'
		} else {
			return 'preset-tonal-primary' 
		}
	}

	function setItem(i: number) {
		if (vm && vm.buttons && vm.buttons[0]) {
			vm.buttons[0].action({checked: i});
		}
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
			<button type="button" aria-label="close" class="btn-icon w-auto" on:click={()=>vm.modal?.action(false)}>
				<X/>
			</button>
		</div>
	</header>
	<div class="flex flex-col items-center justify-center m-2">
		<div>
			<h2 class="h4 text-center">{vm.textName}</h2>
		</div>
			<div class="mt-4 truncate">
			<p class="text-lg truncate">{vm.statusName}</p>
		</div>
		<div class="container mt-2">
		{#if vm.modal?.list}
			{#each vm.modal?.list as listItem, index}
				<button type="button" class="w-full mt-2 btn btn-lg {setColor(index)} shadow-xl rounded-lg border border-white/15 hover:border-white/50" 
					on:click|stopPropagation|preventDefault={() => {setItem(index)}}>
						<span>{$_(listItem.name)}</span>
				</button>
				{/each}
		{/if}
		</div>
	</div>
	{/snippet}
</Modal>
