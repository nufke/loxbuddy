<script lang="ts">
	import { page } from '$app/state';
	import type { Control, ControlOptions } from '$lib/types/models';
	import { DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/Common/LbControl.svelte';
	import LbDialog from '$lib/components/Common/LbDialog.svelte';
	import LbIcon from '$lib/components/Common/LbIcon.svelte';
	import { controlStore } from '$lib/stores/LbControlStore.svelte';
	import { utils } from '$lib/helpers/Utils';
	import { format } from 'date-fns';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let controlOpen = $state(false);

	let iconName = $derived(controlStore.getIcon(control, controlOptions.isSubControl));
	let statusName = $derived(getFormattedString(String(controlStore.getState(control.states?.value))));

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

	function getFormattedString(input: string): string {
		let s: string = input;
		const value = Number(s);
		if (control.details?.format) {
			switch (control.details?.format) {
				case '<v.u>': // date + time, e.g. 6 maart 2025 22:56
					let date = new Date(value * 1000 + utils.loxTimeRef);
					if (date && value) {
						date = utils.isDST(date) ? new Date(value * 1000 + utils.loxTimeRef - 3600000) : date;
						s = format(date, 'PPP p');
					}
					break;
				case '<v.t>': // duration/time
					const du = value / 60;
					const days = Math.floor(du / 1440);
					const hours = Math.floor((du % 1440) / 60);
					const minutes = Math.floor((du % 1440) % 60);
					s = days + 'd ' + hours + 'h ' + minutes + 'm';
					break;
				case '<v.d>': // EIS4, dd:mm:yyyy
					const d = new Date(value * 1000 + utils.loxTimeRef);
					s = format(d, 'dd:MM:yyyy');
					break;
				case '<v.x>': // digital value
					s = value ? '1' : '0'; // TODO check
					break;
				case '<v.j>': // combined value
					control.details.format = '%f'; // TODO: check
				case '<v.i>': // combined Pushbutton
					control.details.format = '%f'; // TODO: check
				case '<v.c>': // color
					control.details.format = '#%6h'; // TODO: check
				case '<v.m>': // EIS3, hh:mm:ss
					control.details.format = '%d'; // TODO: check
				case '<v>': // integer
					control.details.format = '%d';
				case '<v.1>': // float in x.y notation
					control.details.format = '%.1f';
				case '<v.2>': // float in x.yy notation
					control.details.format = '%.2f';
				case '<v.3>': // float in x.yy notation
					control.details.format = '%.3f';
				default:
					s = fmt.sprintf(control.details?.format, value);
					break;
			}
		}
		return s;
	}
</script>

<LbControl {controlOptions} {iconName} {statusName}
	textName={control.name} label={controlStore.getLabel(page, control)} onclick={openControl}/>

{#if !controlOptions.action}
	<LbDialog open={controlOpen} onClose={closeControl} {control} title={control.name}>
		{#snippet description()}
			<div class="flex flex-col items-center justify-center">
				<div class="mb-2 relative inline-flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-50-950">
					<LbIcon name={iconName} width="36" height="36"/>
				</div>
				<p class="text-lg dark:text-surface-300 text-surface-700">{statusName}</p>
			</div>
		{/snippet}
	</LbDialog>
{/if}
