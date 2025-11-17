<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { ChevronLeftIcon, ChevronRightIcon, Clock3Icon, Undo2Icon } from '@lucide/svelte';
	import { format } from 'date-fns';
	import { _ } from 'svelte-i18n';

	let { date = $bindable(), view } = $props();

	let days = $_('Days').split('|');
	let months = $_('Months').split('|');
	let start = 0; // first day of the week (0 = Sunday, 1 = Monday)

	let localDate = $state(new SvelteDate(date));
	let offset = $state(0); // offset in months from currently selected date
	let dateStr = $derived(getDateStr(localDate));
	let selected: string = $derived(dateStr);
	let timeStr: string = $derived(getTimeStr(localDate));
	let viewDate = $derived(viewDateFrom(dateStr, offset));
	let month = $derived(months[viewDate.getMonth()]);
	let year = $derived(viewDate.getFullYear());
	let weeks = $derived(weeksFrom(viewDate, start));

	let calenderHeight = 300;
	let cw = 'w-9';
	let ts = 'text-md';

	function getDateStr(date: Date) {
		const pad = (n:number) => n < 10 ? '0' + n : n;
		return date.getFullYear() + "-" + pad(date.getMonth()+1) + '-' + pad(date.getDate());
	}

	function getTimeStr(date: Date) {
		const hours = date.getHours() 
		const minutes = date.getUTCMinutes(); 
		return (hours < 10 ? `0${hours}` : hours) + ':' + (minutes < 10 ? `0${minutes}` : minutes);
	}

	function setMonth(direction: number) {
		offset = offset + direction;
	}

	function updateDate(newDate: SvelteDate) {
		date = newDate;
	}

	function reset() {
		localDate = new SvelteDate();
		dateStr = getDateStr(localDate);
		timeStr = getTimeStr(localDate);
		offset = 0;
		selected = dateStr;
	}

	function selectDate(newDateStr: string) {
		selected = newDateStr;
		dateStr = newDateStr;
		localDate = new SvelteDate(dateStr + " " + timeStr);
		updateDate(localDate);
		offset = 0;
	}

	function viewDateFrom(date: string, offset: number) {
		let viewDate = new Date(date);
		viewDate.setMonth(viewDate.getMonth() + offset);
		return viewDate;
	}

	function weeksFrom(viewDate: Date, start: number) {
		let first = new Date(viewDate.getTime());
		first.setDate(1);
		first.setDate(first.getDate() + ((start - first.getDay() - 7) % 7));

		let last = new Date(viewDate.getTime());
		last.setDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate());
		last.setDate(last.getDate() + ((start - last.getDay() + 6) % 7));

		let d = new Date(first.getTime()),
			M = viewDate.getMonth(),
			Y = viewDate.getFullYear(),
			week: any = [],
			weeks = [week];

		for (let i = 0; i < 42; i++) { // always print same amount of dates
			let dd = d.getDate(),
				mm = d.getMonth(),
				yy = d.getFullYear(),
				value = getDateStr(d);
				
			week.push({
				date: dd,
				value,
				class: [
					mm == M ? '' : (mm > M ? yy >= Y : yy > Y) ? 'future' : 'past',
					value === selected ? 'dark:bg-primary-500 bg-primary-700 text-black' : '',
				].join(' ')
			});

			d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

			if (d.getDay() === start) {
				week = [];
				weeks.push(week);
			}
		}
		return weeks;
	}
</script>

<div class="flex flex-col justify-center items-center">
	<p class="text-xl mb-1">{format(localDate, 'PPP')}</p>
	<div class="card m-0 flex rounded-lg border border-white/5 hover:border-white/10
							bg-surface-50-950 px-2 py-2 hover:border-white/10" style="width: {calenderHeight}px; height: {calenderHeight}px;">
		<div class="grid grid-cols-7 gap-0">
			<div class="btn-icon {cw} justify-start m-auto" onclick={() => setMonth(-1)}><ChevronLeftIcon size="26"/></div>
			<div class="btn-icon {cw} justify-start m-auto dark:text-primary-500 text-primary-700" onclick={() => reset()}><Undo2Icon/></div>
			<div class="btn col-span-3 {ts}">{month} {year}</div>
			<div></div>
			<div class="btn-icon {cw} justify-start start m-auto" onclick={() => setMonth(+1)}><ChevronRightIcon size="26"/></div>
			{#each days as day}
				<div class="text-center {ts}">{day}</div>
			{/each}
			{#each weeks as week}
				{#each week as day}
					<div class="btn {ts} {cw} {day.class}" onclick={() => selectDate(day.value)}>{day.date}</div>
				{/each}
			{/each}
		</div>
	</div>
</div>

<style>
	.btn {
		cursor: pointer;
	}
	.btn-icon {
		cursor: pointer;
	}
	.btn:hover, .btn-icon:hover {
		filter: brightness(100%);
	}
	.past, .future {
		opacity: 0.5;
	}
</style>
