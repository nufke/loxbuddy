<script lang="ts">
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { Utils } from '$lib/helpers/utils';
	import { format } from 'date-fns';
	import fmt from 'sprintf-js';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	const loxTimeRef = 1230764400000; // correction to epoch, Loxone calculates from 1-1-2009

	function getFormattedString(input: string) {
		let s: string = input;
		const value = Number(s);
		if (control.details.format) {
			switch (control.details.format) {
				case '<v.u>': // date + time, e.g. 6 maart 2025 22:56
					let date = new Date(value * 1000 + loxTimeRef);
					if (date && value) {
						date = Utils.isDST(date) ? new Date(value * 1000 + loxTimeRef - 3600000) : date;
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
					const d = new Date(value * 1000 + loxTimeRef);
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
					s = fmt.sprintf(control.details.format, value);
					break;
			}
		}
		return s;
	}

	let modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false
	});

	let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		iconName: store.getCategoryIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: getFormattedString(String(store.getState(control.states.value))),
		modal: modal
	});
</script>

<div>
	<LbControl bind:controlView={controlView}/>
	<LbModal bind:controlView={controlView}/>
</div>
