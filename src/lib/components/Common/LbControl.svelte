<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import type { ControlView, Control, ControlOptions, Category, Room } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbIcon from '$lib/components/Common/LbIconByName.svelte';
	import LbJalousieIcon from '$lib/components/Jalousie/LbJalousieIcon.svelte';
	import { store } from '$lib/stores/Store.svelte';
	import { _ } from 'svelte-i18n';
	import { page } from '$app/state';
	import { GripVerticalIcon } from '@lucide/svelte';

	let { controlView = $bindable(), controlOptions = DEFAULT_CONTROLOPTIONS } : { controlView: ControlView, controlOptions: ControlOptions } = $props();
	let isCategory = page.url.pathname.includes('/category');

	function getT() {
		let temp = controlView.iconText?.split('.') || '';
		return {
			num: temp[0] && temp[1]? (temp[0] + '.') : temp[0],
			frac: temp[1] ? temp[1] : ''
		}
	}

	function getStatusColorHex(hexColor: string | undefined) {
		return (hexColor && hexColor[0] == '#') ? 'color: ' + hexColor : '';
	}

	function getIconColorHex(hexColor: string | undefined) {
		return (hexColor && hexColor[0] == '#') ? 'fill: ' + hexColor : '';
	}

	function openDialog() {
		if (!controlView.iconName.length && !controlView.iconText?.length) return; // no dialog if we are at subcontrol level (we have no icon at this level)
		controlView.dialog.action(true);
	}
	function label(control: Control) {
		let label : Category | Room | undefined;
		if (isCategory) {
			label = store.roomList.find((room) => room.uuid === control.room);
		} else {
			label = store.categoryList.find((cat) => cat.uuid === control.cat);
		}
		if (label && label.name) {
		 return label.name;
		}
		return '';
	}
</script>

{#if controlView.isFavorite} <!-- Widget style for favorite -->
<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={openDialog}
	class="card m-0 flex justify-start rounded-lg shadow-sm border border-white/5
					bg-surface-100-900 min-h-[150px] px-2 py-2 hover:border-white/10 relative">
	<div class="flex w-full flex-col">
		{#if store.dnd.isEnabled}
			<div class="absolute right-1 text-surface-500 top-[40%]">
				<GripVerticalIcon/>
			</div>
		{/if}
		<div class="relative flex w-full justify-between">
			{#if controlView.iconName.length}
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
					{#if controlView.control.type =='Jalousie'}
						<LbJalousieIcon control={controlView.control} width="28" height="28"/>
					{:else}
					<LbIcon class={controlView.iconColor} name={controlView.iconName} width="24" height="24"
						style={getIconColorHex(controlView.iconColor)}/>
					{/if}
					{#if controlView.badgeIconName?.length}
						<div class="absolute top-[4px] left-[6px] inline-flex items-center justify-center w-[14px] h-[14px] {controlView.badgeIconColor} rounded-full
												border border-1 dark:border-surface-950 border-surface-50">
							<LbIcon class='dark:text-surface-950 text-surface-50' name={controlView.badgeIconName} size="8"/>
						</div>
					{/if}
				</div>
			{/if}
			{#if controlView.iconText?.length} 
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
					<svg width="32" height="32">
						<text class={controlView.iconColor} text-anchor="middle" x="16" y="22" font-size="18">{getT().num}<tspan font-size="14">{getT().frac}</tspan>
						</text>
					</svg>
				</div>
			{/if}
			<div class="flex flex-row items-top justify-center">
				{#if controlView.buttons.length}
					{#each controlView.buttons as button, index}
						{#if index > 0}
							<div class="ml-2"></div>
						{/if}
						{#if button.type === 'button' && button.iconName}
							<button type="button" class="btn-icon p-3 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50" 
											onclick={(e) => { e.stopPropagation(); e.preventDefault(); button.click(e)}}>
								<span style="font-size:26px ">
									<LbIcon class={button.iconColor} name={button.iconName} />
								</span>
							</button>
						{/if}
						{#if button.type == 'switch'}
							<button class="mt-2" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
								<Switch checked={controlView.buttonState} onCheckedChange={button.click}>
									<Switch.Control class="w-12 h-8 mr-1 data-[state=checked]:preset-filled-primary-500">
										<Switch.Thumb />
									</Switch.Control>
									<Switch.HiddenInput />
								</Switch>
							</button>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
		<div class="pl-1 pt-2 truncate">
			<p class="truncate text-xs dark:text-surface-300 text-surface-700">{label(controlView.control)}</p>
			<p class="truncate text-lg {controlView.textColor}">{controlView.textName}</p>
			<p class="text-md truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>{controlView.statusName}</p>
		</div>
	</div>
</div>
{/if}

{#if controlView.showControl && !controlView.isFavorite} <!-- Regular style used in control list -->
<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={openDialog}
			class="card m-0 flex items-center justify-start rounded-lg shadow-sm border border-white/5 relative
						{ controlView.isSubControl ? 'bg-surface-200-800 min-h-[64px]' :
						( controlOptions.isLink ? 'bg-surface-200-800 min-h-[76px]' : 'bg-surface-100-900 min-h-[76px]') }  px-2 py-2 hover:border-white/10">
	<div class="flex w-full justify-between">
		{#if store.dnd.isEnabled}
			<div class="absolute right-1 text-surface-500 top-[35%]">
				<GripVerticalIcon/>
			</div>
		{/if}
		<div class="relative flex items-center truncate">
			{#if controlView.iconName.length && !controlView.isSubControl} <!-- only show icon if name is given -->
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
					{#if controlView.control.type =='Jalousie'}
						<LbJalousieIcon control={controlView.control} width="28" height="28"/>
					{:else}
					<LbIcon class={controlView.iconColor} name={controlView.iconName} width="24" height="24"
						style={getIconColorHex(controlView.iconColor)}/>
					{/if}
					{#if controlView.badgeIconName?.length}
						<div class="absolute top-[4px] left-[6px] inline-flex items-center justify-center w-[14px] h-[14px] {controlView.badgeIconColor} rounded-full
												 border border-1 dark:border-surface-950 border-surface-50">
							<LbIcon class='dark:text-surface-950 text-surface-50' name={controlView.badgeIconName} size="8"/>
						</div>
					{/if}
				</div>
			{/if}
			{#if controlView.iconText?.length} <!-- IRC -->
				<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
					<svg width="32" height="32">
						<text class={controlView.iconColor} text-anchor="middle" x="16" y="22" font-size="18">{getT().num}<tspan font-size="14">{getT().frac}</tspan>
						</text>
					</svg>
				</div>
			{/if}
			<div class="m-0 ml-2 truncate">
				<p class="truncate text-lg {controlView.textColor}">{controlView.textName}</p>
				{#if controlView.statusName}
					<p class="text-md truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>{controlView.statusName}</p>
				{/if}
			</div>
		</div>
		<div class="flex flex-row items-center justify-center {store.dnd.isEnabled ? 'pr-5' : 'pr-0'}">
			{#if controlView.buttons.length}
				{#each controlView.buttons as button, index}
					{#if index > 0}
						<div class="ml-2"></div>
					{/if}
					{#if button.type === 'button' && button.iconName}
						<button type="button" class="btn-icon p-3 dark:bg-surface-950 bg-surface-50 rounded-lg border border-white/15 hover:border-white/50" 
										onclick={(e) => { e.stopPropagation(); e.preventDefault(); button.click(e)}}>
							<span style="font-size:26px">
								<LbIcon class={button.iconColor} name={button.iconName} />
							</span>
						</button>
					{/if}
					{#if button.type == 'switch'}
						<button class="mt-1" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
							<Switch checked={controlView.buttonState} onCheckedChange={button.click}>
								<Switch.Control class="w-12 h-8 mr-1 preset-filled-surface-400-600 data-[state=checked]:preset-filled-primary-500">
									<Switch.Thumb />
								</Switch.Control>
								<Switch.HiddenInput />
							</Switch>
						</button>
					{/if}
				{/each}
			{/if}
		</div>
	</div>
</div>
{/if}
