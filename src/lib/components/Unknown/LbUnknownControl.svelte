<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));

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

	/**
	 * Closes the control dialog.
	 */
	function closeControl(): void {
		controlOpen = false;
	}
</script>

<LbControl {controlOptions} {iconName} statusName="(control unknown)"
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon name={iconName} width="36" height="36"/>
				</div>
				<p class="text-lg">(control unknown)</p>
			</div>
		{/snippet}
	</LbDialog>
{/if}
