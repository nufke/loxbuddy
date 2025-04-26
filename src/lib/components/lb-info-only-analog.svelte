<script lang="ts">
	import type { Control } from '$lib/types/models';
	import { state, categories } from '$lib/stores/stores';
	import LbControl from '$lib/components/lb-control.svelte';
	import { format } from 'date-fns';
	import { nl } from 'date-fns/locale';
	import fmt from 'sprintf-js';
	import LbTextModal from '$lib/components/lb-text-modal.svelte';
	
	export let control: Control;

	const loxTimeRef = 1230764400000; // correction to epoch, Loxone calculates from 1-1-2009

	function getFormattedString() {
		let s: string = $state[control.states.value];
		const value = Number(s);
		if (control.details.format) {
			switch (control.details.format) {
				case '<v.u>': // date + time, e.g. 6 maart 2025 22:56
					const date = new Date(value * 1000 + loxTimeRef);
					s = format(date, 'PPP p', { locale: nl });
					break;
				case '<v.t>': // duration/time
					let du = value / 60;
					let days = Math.floor(du / 1440);
					let hours = Math.floor((du % 1440) / 60);
					let minutes = Math.floor((du % 1440) % 60);
					s = days + 'd ' + hours + 'h ' + minutes + 'm';
					break;
				case '<v.d>': // EIS4, dd:mm:yyyy
					const d = new Date(value * 1000 + loxTimeRef);
					s = format(d, 'dd:MM:yyyy', { locale: nl });
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

	let openModal: boolean;

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: getFormattedString(),
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbTextModal {controlView} />
</div>
