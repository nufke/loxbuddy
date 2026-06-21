<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let {
		controlOptions = DEFAULT_CONTROLOPTIONS,
		iconName = '',
		iconColor = 'dark:text-surface-50 text-surface-950',
		iconText = '',
		badgeIconName = '',
		badgeIconColor = '',
		textName,
		statusName = '',
		statusColor = 'dark:text-surface-300 text-surface-700',
		label = '',
		onclick,
		icon,		// optional custom icon content (e.g. LbJalousieIcon); falls back to LbIcon with iconName
		actions,	// control-specific buttons/toggle, receives isFavorite as param
	}: {
		controlOptions?: ControlOptions;
		iconName?: string;
		iconColor?: string;
		iconText?: string;		// IRC temperature / value shown as SVG text instead of an icon
		badgeIconName?: string;
		badgeIconColor?: string;
		textName: string;
		statusName?: string;
		statusColor?: string;
		label?: string;
		onclick: () => void;
		icon?: Snippet;
		actions?: Snippet<[boolean]>;
	} = $props();

	function getIconText(): { num: string; frac: string } {
		const parts = iconText.split('.');
		return {
			num: parts[0] && parts[1] ? parts[0] + '.' : parts[0],
			frac: parts[1] ?? '',
		};
	}

	function getColor(hexColor: string | undefined): string {
		return hexColor && hexColor[0] == '#' ? 'color: ' + hexColor : '';
	}
</script>

<!-- Shared icon circle content (used in both card modes) -->
{#snippet iconCircle(compact: boolean)}
	<div class="relative mr-1 {compact ? 'inline-flex' : 'flex'} items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
		{#if icon}
			{@render icon()}
		{:else}
			<LbIcon class={iconColor} name={iconName} width="32" height="32"/>
		{/if}
		{#if badgeIconName?.length}
			<div class="absolute top-[0px] right-[2px] inline-flex items-center justify-center w-[22px] h-[22px] bg-surface-50-950 rounded-full">
				<LbIcon class={badgeIconColor} name={badgeIconName} height="12" width="12"/>
			</div>
		{/if}
	</div>
{/snippet}

<!-- Drag handle shown when sorting is active -->
{#snippet dragHandle()}
	{#if controlStore.sorting}
		<div class="absolute -right-[3px] -bottom-[3px] text-surface-500" data-drag-handle>
			<LbIcon name="clarity:drag-handle-corner-line"/>
		</div>
	{/if}
{/snippet}

<!-- Widget style for favorites -->
{#if controlOptions.isFavorite}
<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" {onclick}
	class="card m-0 flex justify-start rounded-lg shadow-sm border border-white/5
					bg-surface-100-900 min-h-[150px] px-2 py-2 hover:border-white/10 relative">
	<div class="flex w-full flex-col">
		{@render dragHandle()}
		<div class="flex w-full justify-between">
			<div class="relative flex items-center truncate">
				{#if iconName.length}
					{@render iconCircle(false)}
				{/if}
				{#if iconText?.length} <!-- IRC: show value as text instead of icon -->
					<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
						<svg width="32" height="32">
							<text class={iconColor} text-anchor="middle" x="16" y="22" font-size="18">{getIconText().num}<tspan font-size="14">{getIconText().frac}</tspan></text>
						</svg>
					</div>
				{/if}
			</div>
			<div class="flex flex-row items-top justify-right">
				{#if actions}{@render actions(true)}{/if}
			</div>
		</div>
		<div class="pl-1 pt-2 truncate">
			{#if label}<p class="truncate text-xs dark:text-surface-300 text-surface-700">{label}</p>{/if}
			<p class="truncate text-lg">{textName}</p>
			{#if statusName}<p class="truncate text-md {statusColor}" style={getColor(statusColor)}>{statusName}</p>{/if}
		</div>
	</div>
</div>
{/if}

<!-- Regular style used in control list -->
{#if controlOptions.showControl && !controlOptions.isFavorite}
<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" {onclick}
			class="card m-0 flex items-center justify-start rounded-lg shadow-sm border border-white/5 relative
						{ controlOptions.isSubControl ? 'bg-surface-200-800 min-h-[64px]' :
						( controlOptions.isLink ? 'bg-surface-200-800' : 'bg-surface-100-900') } px-2 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		{@render dragHandle()}
		<div class="relative flex items-center truncate">
			{#if iconName.length && !controlOptions.isSubControl} <!-- only show icon if not a subcontrol -->
				{@render iconCircle(true)}
			{/if}
			{#if iconText?.length} <!-- IRC: show value as text instead of icon -->
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<svg width="32" height="32">
						<text class={iconColor} text-anchor="middle" x="16" y="22" font-size="18">{getIconText().num}<tspan font-size="14">{getIconText().frac}</tspan></text>
					</svg>
				</div>
			{/if}
			<div class="m-0 ml-2 truncate">
				<p class="truncate text-lg">{textName}</p>
				{#if statusName}<p class="text-md truncate {statusColor}" style={getColor(statusColor)}>{statusName}</p>{/if}
			</div>
		</div>
		<div class="flex flex-row items-center justify-center {controlStore.sorting ? 'pr-[3px]' : 'pr-0'}">
			{#if actions}{@render actions(false)}{/if}
		</div>
	</div>
</div>
{/if}
