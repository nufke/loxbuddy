<script lang="ts">
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { appStore } from '$lib/stores/LbAppStore.svelte';
	import { lbControlSelector } from '$lib/helpers/LbControlSelector';
	import { page } from '$app/state';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);

	let textAndIcon = $derived(String(controlStore.getState(control.states?.textAndIcon)));
	let iconAndColor = $derived(controlStore.getState(control.states?.iconAndColor));
	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl, iconAndColor));
	let iconColor = $derived(iconAndColor?.color || 'dark:fill-surface-50 fill-surface-950');
	let statusColor = $derived(iconAndColor?.color || 'dark:text-surface-300 text-surface-700');
	
	let linkedControlOptions = $derived({...DEFAULT_CONTROLOPTIONS, isLink: true});

	let linkedControls = $derived(
		controlStore.controlList
			.filter((c) => control.links ? control.links.includes(c.uuidAction) : false)
			.sort((a, b) => a.name.localeCompare(b.name, appStore.locale))
	);

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

<LbControl {controlOptions} {iconName} {iconColor} statusName={textAndIcon} {statusColor}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon class={iconColor} name={iconName} width="36" height="36"/>
				</div>
				<p class="text-lg {statusColor}">{textAndIcon}</p>
			</div>
			{#if linkedControls.length}
				<div class="flex flex-col w-full mt-2 overflow-y-auto max-h-[calc(90vh-250px)]">
					<div class="grid grid-cols-1 gap-2
						{linkedControls.length > 1 ? 'lg:grid-cols-2' : ''}
						{linkedControls.length > 2 ? 'xl:grid-cols-3' : ''}">
						{#each linkedControls as linkedControl}
							{@const Component = lbControlSelector.getControl(linkedControl.type)}
							<Component control={linkedControl} controlOptions={linkedControlOptions}/>
						{/each}
					</div>
				</div>
			{/if}
		{/snippet}
	</LbDialog>
{/if}
