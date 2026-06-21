<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbJalousieIcon from '$lib/components/Jalousie/LbJalousieIcon.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { untrack } from 'svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { _ } from 'svelte-i18n';
	import fmt from 'sprintf-js';

	/* Jalousie types (animation detail):
	   0 = Venetian blinds (jaloezie/lamellen)
	   1 = Roller blinds (rolluik/dakrolgordijn/screen)
	   2 = Curtains opening to both sides
	   3 = Schlotterer Retrolux
	   4 = Curtain left
	   5 = Curtain right
	   6 = Awning (zonneluifel) */

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const type = control.details?.animation;

	let controlOpen = $state(untrack(() => controlOptions.showDialog ?? false));

	let position = $derived(Number(controlStore.getState(control.states?.position)) * 100);
	let shadePosition = $derived(Number(controlStore.getState(control.states?.shadePosition)) * 100);
	let autoActive = $derived(Number(controlStore.getState(control.states?.autoActive)));
	let isLocked = $derived(Number(controlStore.getState(control.states?.locked)));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let statusName = $derived(getPosition());
	let statusColor = $derived(isLocked ? 'text-warning-500' : position > 0 ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700');
	let badgeIconName = $derived(isLocked ? 'lucide:lock-keyhole' : 'bold_loxbuddy:letter-a');
	let badgeIconColor = $derived(isLocked ? 'text-warning-500' : autoActive ? 'dark:text-primary-500 text-primary-700' : 'text-surface-500');

	/**
	 * Builds a position string from the current position and
	 * shade (slat) position, accounting for jalousie type and lock state.
	 *
	 * @returns localised status string, e.g. "50% closed, lamellen 30%".
	 */
	function getPosition(): string {
		if (isLocked) return $_('Locked');
		if (position < 1 && (shadePosition < 1 || type != 0)) return $_('Opened');
		if (position > 99 && (shadePosition > 99 || type != 0)) return $_('Closed');

		let str = position < 1 ? $_('Opened')	: position > 99	? $_('Closed'): 
			fmt.sprintf('%1.0f%% ', position) + $_('Closed').toLowerCase();

		if (shadePosition < 1 && type == 0) return str + ', ' + $_('Slats are horizontal').toLocaleLowerCase();
		if (shadePosition > 99 && type == 0) return str + ', ' + $_('Slats are vertical').toLocaleLowerCase();
		if (type == 0) return str + fmt.sprintf(', lamellen %1.0f%%', shadePosition);
		return str;
	}

	/**
	 * Opens the control dialog. If controlOptions.action is set, that custom
	 * action is invoked instead. At subcontrol level (no icon) the dialog is
	 * suppressed.
	 */
	function openControl(): void {
		if (controlOptions.action) { controlOptions.action(); return; }
		if (!iconName.length) return;
		controlOpen = true;
	}

	/** Closes the control dialog. */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} {statusName} {statusColor}
	{badgeIconName} {badgeIconColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}>
	{#snippet icon()}
		<LbJalousieIcon {control} width="28" height="28"/>
	{/snippet}
	{#snippet actions()}
		<div class="flex flex-row items-center gap-2 mr-1">
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullDown'); }}>
				<LbIcon name="chevron-down"/>
			</button>
			<button type="button" class="btn-icon w-[18px] h-[18px] p-3 bg-surface-50-950 rounded-lg border border-white/15 hover:border-white/50 active:bg-primary-500"
					onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullUp'); }}>
				<LbIcon name="chevron-up"/>
			</button>
		</div>
	{/snippet}
</LbControl>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 dark:bg-surface-950">
					<LbJalousieIcon {control} width="36" height="36"/>
					<div class="absolute top-[7px] right-[10px] inline-flex items-center justify-center w-[24px] h-[24px] bg-surface-50-950 rounded-full">
						<LbIcon class={badgeIconColor} name={badgeIconName} height="14" width="14"/>
					</div>
				</div>
				<div class="mt-2 text-center">
					{#if isLocked}
						<p class="text-lg dark:text-surface-300 text-surface-700">{$_('Jalousie locked')}</p>
					{:else}
						<p class="text-lg {autoActive ? 'dark:text-primary-500 text-primary-700' : 'dark:text-surface-300 text-surface-700'}">
							{autoActive ? $_('Sun position detection enabled') : $_('Sun position detection disabled')}
						</p>
						<p class="text-lg truncate {statusColor}">{statusName}</p>
					{/if}
				</div>
				<div class="w-full grid grid-cols-2 gap-2 mt-6">
					<!-- slow down (press-and-hold for continuous movement, touch + mouse) -->
					<button type="button" disabled={!!isLocked}
							class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 {isLocked ? '' : 'active:bg-primary-500'}"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); }}
							onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'down'); }}
							onmouseup={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'DownOff'); }}
							ontouchstart={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'down'); }}
							ontouchend={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'DownOff'); }}>
						<LbIcon name="chevron-down"/>
					</button>
					<!-- slow up (press-and-hold for continuous movement, touch + mouse) -->
					<button type="button" disabled={!!isLocked}
							class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 {isLocked ? '' : 'active:bg-primary-500'}"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); }}
							onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'up'); }}
							onmouseup={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'UpOff'); }}
							ontouchstart={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'up'); }}
							ontouchend={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'UpOff'); }}>
						<LbIcon name="chevron-up"/>
					</button>
					<button type="button" disabled={!!isLocked}
							class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 {isLocked ? '' : 'active:bg-primary-500'}"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullDown'); }}>
						<LbIcon name="arrow-down-to-line"/>
					</button>
					<button type="button" disabled={!!isLocked}
							class="w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 {isLocked ? '' : 'active:bg-primary-500'}"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'FullUp'); }}>
						<LbIcon name="arrow-up-to-line"/>
					</button>
					<button type="button" disabled={!!isLocked}
							class="col-span-2 w-full btn btn-lg h-[48px] bg-surface-50-950 shadow-sm rounded-lg border border-white/15 hover:border-white/50 {isLocked ? '' : 'active:bg-primary-500'}"
							onclick={(e) => { e.stopPropagation(); e.preventDefault(); controlStore.setControl(control, 'shade'); }}>
						<span class="text-lg">{$_('Shade')}</span>
					</button>
				</div>
			</div>
		{/snippet}
	</LbDialog>
{/if}
