<script lang="ts">
	import type { Control, DateMap } from '$lib/types/models';
	import LbControl from '$lib/components/lb-control.svelte';
	import { state, categories, securedDetails } from '$lib/stores/stores';
	import LbIntercomModal from '$lib/components/lb-intercom-modal.svelte';
	import fmt from 'sprintf-js';

	export let control: Control;

	function convertDate(s: string[]) {
		let dateMap: DateMap = {};
		s.forEach( item => {
			const regex = new RegExp('(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})'); // format YYYYMMDDhhmmss
			const i = item.match(regex);
			if (i) {
				const date = new Date( Number(i[1]), Number(i[2])-1, Number(i[3])).valueOf();
				const time = String(i[4]) + ":" + String(i[5]) + ":" + String(i[6]);
				if (!dateMap[date]) dateMap[date] = [];
				dateMap[date].unshift(time); // push at start of array
			}
		});
		return dateMap;
	}

	let openModal: boolean;

	$: details = $securedDetails ? $securedDetails[control.uuidAction] : null;
	
	$: lastBellEvents = $state[control.states.lastBellEvents].split('|');

	$: events = convertDate(lastBellEvents);

	$: controlView = {
		iconName: control.defaultIcon || $categories[control.cat].image,
		textName: control.name,
		statusName: fmt.sprintf(control.details.format, $state[control.states.text]),
		modal: {
			action: (state: boolean) => {openModal = state},
			state: openModal,
			details: {
				video: details,
				showHistory: control.details.lastBellEventImages,
				lastBellEvents: events
			}
		}
	};
</script>

<div>
	<LbControl {controlView} />
	<LbIntercomModal {controlView} />
</div>
