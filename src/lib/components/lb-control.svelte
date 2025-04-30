<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { type ControlView, DEFAULT_CONTROLVIEW } from '$lib/types/models';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import LucideIcon from './icon-by-name.svelte';

	export let controlView: ControlView;
	$: vm = { ...DEFAULT_CONTROLVIEW, ...controlView };
</script>

<div role="button" tabindex="0" on:keydown={()=>{}} aria-label="card" on:click={()=>vm.modal?.action(true)}
     class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
						bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		<div class="flex items-center truncate">
			<div class="relative inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden bg-white rounded-full dark:bg-black">
				<svg use:inlineSvg={'/loxicons/' + vm.iconName} fill={vm.iconColor} width="24" height="24"></svg>
			</div>
			<div class="mt-0 ml-3 truncate">
				<h1 class="truncate text-lg">{vm.textName}</h1>
				<p class="text-md truncate" style="color: {vm.statusColor}">{vm.statusName}</p>
			</div>
		</div>
		<div class="flex flex-row items-center justify-center">
			{#if vm.buttons}
				{#each vm.buttons as button, index}
					{#if index > 0}
						<div class="ml-2"></div>
					{/if}
					{#if button.type === 'button' && button.iconName}
						<button type="button" class="btn-icon p-3 preset-tonal-surface rounded-lg border border-black hover:border-white/50" 
								on:click|stopPropagation|preventDefault={button.action}>
							<span style="font-size:26px ">
								<LucideIcon name={button.iconName} />
							</span>
						</button>
					{/if}
					{#if button.type == 'switch'}
					<a class="mt-2" href='http:/' on:click={(e) => { e.stopPropagation(); }}> <!-- workaround wrapper to stop propagation for switch -->
						<Switch controlClasses="w-12 h-8 mr-1" name="slide" controlActive="bg-green-500" checked={button.state} onCheckedChange={button.action} />
					</a>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</div>
