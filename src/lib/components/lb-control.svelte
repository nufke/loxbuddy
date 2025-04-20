<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import type { IconView, TextView, ButtonView, StateView } from '$lib/types/models';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import { type Icon as IconType } from '@lucide/svelte';
	import LucideIcon from './icon-by-name.svelte';

	export let iconView: IconView;
	export let textView: TextView;
	export let stateView: StateView;
	export let buttonView: ButtonView = { buttons: [] };
</script>

<div class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
            bg-linear-to-r from-white/[0.095] to-white/5 px-3 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		<div class="flex items-center truncate">
			<div class="placeholder-circle flex h-10 w-10 items-center justify-center">
				<svg use:inlineSvg={iconView.name} fill={iconView.color} width="24" height="24"></svg>
			</div>
			<div class="mt-0 ml-3 truncate">
				<h1 class="truncate text-lg">{textView.name}</h1>
				<p class="text-md truncate" style="color: {stateView.color}">{stateView.name}</p>
			</div>
		</div>
		<div class="mr-1 flex items-center">
			{#each buttonView.buttons as button, index}
				{#if index > 0}
					<div class="ml-3"></div>
				{/if}
				{#if button.type === 'button' && button.name}
					<button type="button" class="btn-icon btn-icon-sm" on:click|preventDefault={button.action}>
						<span style="font-size:26px">
							<LucideIcon name={button.name} />
						</span>
					</button>
				{/if}
				{#if button.type == 'switch'}
					<Switch name="slide" controlActive="bg-green-500" checked={button.state} onCheckedChange={button.action} />
				{/if}
			{/each}
		</div>
	</div>
</div>
