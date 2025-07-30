<script lang="ts">
	import LbControl from '$lib/components/lb-control.svelte';
	import LbWidget from '$lib/components/lb-widget.svelte';
	import type { Control, ControlOptions, ControlView, ModalView } from '$lib/types/models';
	import { DEFAULT_CONTROLVIEW, DEFAULT_CONTROLOPTIONS } from '$lib/types/models';
	import LbModal from '$lib/components/lb-modal.svelte';
	import { store } from '$lib/stores/store.svelte';
	import { utils } from '$lib/helpers/utils';
	import { format } from 'date-fns';

	let { control, controlOptions = DEFAULT_CONTROLOPTIONS }: { control: Control, controlOptions: ControlOptions } = $props();

	let entries = $derived(store.getState(control.states.entries)) as String;
	let entryList = $derived(entries ? entries.split('|') : []);
	let entryMap = $derived(updateEntries(entryList));
	let lastEntryDate = $derived(Object.keys(entryMap)[0]);

	const sortEntries = (obj: any) =>
		Object.keys(obj)
			.sort( (a, b) => Number(b) - Number(a))
			.reduce( (newObj: any, key) => {
				newObj[key] = obj[key].sort( (a:any, b:any) => b.time - a.time);
				return newObj;
			}, {});

	function updateEntries(list: string[]) {
		let obj: any = {};
		list.forEach( item => {
			const regex = new RegExp('([0-9]{4}-[0-9]{2}-[0-9]{2}).*([0-9]{2}:[0-9]{2}:[0-9]{2}).(.*)');
			const found = item.match(regex);
			if (found && found[1] && found[2] && found[3]) {
				let epoch: number = new Date(found[1]).valueOf();
				if (!obj[epoch]) { obj[epoch] = [] }
				obj[epoch].push({ time: utils.time2epoch(epoch, found[2]), description: found[3]})
			}
		});
		return sortEntries(obj)
	}

	function getStatus() {
		return lastEntryDate && entryMap[lastEntryDate][0] ? 
			format(new Date(Number(lastEntryDate)), "PPP ") + format(new Date(Number(entryMap[lastEntryDate][0].time)), "p") : '';
	}

	let	modal: ModalView = $state({
		action: (state: boolean) => {modal.state = state},
		state: false,
		size: { width: 'w-[450px]', height: 'h-[700px]'},
	});

  let controlView: ControlView = $derived({
		...DEFAULT_CONTROLVIEW,
		control: control,
		isFavorite: controlOptions.isFavorite,
		iconName: store.getIcon(control, controlOptions.isSubControl),
		textName: control.name,
		statusName: getStatus(),
		modal: {
			...modal,
			details: {
				tracker: entryMap
			}
		}
	});
</script>

<div>
	<LbControl bind:controlView {controlOptions}/>
	<LbWidget bind:controlView />
	<LbModal bind:controlView />
</div>
