<script lang="ts">
	import { inlineSvg } from '@svelte-put/inline-svg';
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import type { ControlView } from '$lib/types/models';
	import LucideIcon from './icon-by-name.svelte';
	import { _ } from 'svelte-i18n';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();
	
	function getT() {
		let temp = controlView.iconText?.split('.') || '';
		return {
			num: temp[0] && temp[1]? (temp[0] + '.') : temp[0],
			frac: temp[1] ? temp[1] : ''
		}
	}
</script>

<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={() => {controlView.modal.action(true)}}
     class="card m-0 flex min-h-[70px] items-center justify-start rounded-lg border border-white/5
						bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		<div class="flex items-center truncate">
			{#if controlView.iconName.length}
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full dark:bg-surface-950">
					<svg class={controlView.iconColor} use:inlineSvg={'/loxicons/' + controlView.iconName} width="24" height="24"></svg>
				</div>
			{/if}
			{#if controlView.iconText?.length} <!-- IRC -->
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full dark:bg-surface-950">
					<svg class="{controlView.iconColor}" width="32" height="32">
						<text text-anchor="middle" x="16" y="22" fill="white" font-size="18">{getT().num}<tspan font-size="14">{getT().frac}</tspan>
						</text>
					</svg>
				</div>
			{/if}
			<div class="mt-0 ml-2 truncate">
				<h1 class="truncate text-lg">{controlView.textName}</h1>
				{#if controlView.statusName}
				<p class="text-md truncate {controlView.statusColor}">{$_(controlView.statusName)}</p>
				{/if}
			</div>
		</div>
		<div class="flex flex-row items-center justify-center">
			{#if controlView.buttons.length}
				{#each controlView.buttons as button, index}
					{#if index > 0}
						<div class="ml-2"></div>
					{/if}
					{#if button.type === 'button' && button.iconName}
						<button type="button" class="btn-icon p-3 preset-tonal-surface rounded-lg border border-black hover:border-white/50" 
										onclick={(e) => { e.stopPropagation(); e.preventDefault(); button.click(e)}}> <!--|stopPropagation|preventDefault-->
							<span style="font-size:26px ">
								<LucideIcon name={button.iconName} />
							</span>
						</button>
					{/if}
					{#if button.type == 'switch'}
						<button class="mt-2" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
							<Switch controlClasses="w-12 h-8 mr-1" name="slide" controlActive="bg-green-500" checked={controlView.buttonState} onCheckedChange={button.click} />
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</div>
