<script lang="ts">
	import { Switch } from '@skeletonlabs/skeleton-svelte';
	import type { ControlView, Control, Category, Room } from '$lib/types/models';
	import LbIcon from '$lib/components/lb-icon-by-name.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { _ } from 'svelte-i18n';

	let { controlView = $bindable() }: { controlView: ControlView } = $props();

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

	function openModal() {
		if (!controlView.iconName.length && !controlView.iconText?.length) return; // no modal if we are at subcontrol level (we have no icon at this level)
		controlView.modal.action(true);
	}

	function label(control: Control) {
		let label : Category | Room | undefined = store.categoryList.find((cat) => cat.uuid === control.cat);
		if (!label) {
			label = store.roomList.find((room) => room.uuid === control.room);
		}
		if (label && label.name) {
		 return label.name;
		}
	}
</script>

{#if controlView.isFavorite}
<div role="button" tabindex="0" onkeydown={()=>{}} aria-label="card" onclick={openModal}
     class="card m-0 flex items-center justify-start rounded-lg shadow-sm border border-white/5
						bg-surface-100-900 min-h-[76px] px-2 py-2 hover:border-white/10">
	<div class="flex w-full flex-col">
		<div class="flex w-full justify-between">
			{#if controlView.iconName.length}
			<div class="relative mr-1 inline-flex items-center justify-center w-12 h-12 min-w-12 overflow-hidden rounded-full border border-white/10 dark:bg-surface-950 bg-surface-50">
				<LbIcon class={controlView.iconColor} name={controlView.iconName} width="24" height="24"/>
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
											onclick={(e) => { e.stopPropagation(); e.preventDefault(); button.click(e)}}> <!--|stopPropagation|preventDefault-->
								<span style="font-size:26px ">
									<LbIcon name={button.iconName} />
								</span>
							</button>
						{/if}
						{#if button.type == 'switch'}
							<button class="mt-2" onclick={(e) => { e.stopPropagation()}}> <!-- workaround wrapper to stop propagation for switch -->
								<Switch controlClasses="w-12 h-8 mr-1" name="slide" controlActive="bg-primary-500" checked={controlView.buttonState} onCheckedChange={button.click} />
							</button>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
		<div class="pl-1 pt-2 truncate">
			<p class="truncate text-xs text-surface-500">{label(controlView.control)}</p>
			<p class="truncate text-lg {controlView.textColor}">{controlView.textName}</p>
			<p class="text-md truncate {controlView.statusColor}" style={getStatusColorHex(controlView.statusColor)}>
					{controlView.statusName ? $_(controlView.statusName) : String.fromCharCode(160)}</p>
		</div>
	</div>
</div>
{/if}