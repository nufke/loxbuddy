<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { ChevronLeft, ChevronRight, Clock3, Undo2 } from '@lucide/svelte';
	import { format } from 'date-fns';
	import { Utils } from '$lib/helpers/utils';
	import { _ } from 'svelte-i18n';

	let { date = $bindable(), view = $bindable() } = $props();

	let days = $_('Days').split('|');
	let months = $_('Months').split('|');
	let start = 0; // first day of the week (0 = Sunday, 1 = Monday)

	let offset = $state(0); // offset in months from currently selected date
	let dateStr = $derived(getDateStr(date));
	let selected: string = $derived(dateStr);
	let timeStr: string = $state(getTimeStr(date));
	let viewDate = $derived(viewDateFrom(dateStr, offset));
	let month = $derived(months[viewDate.getMonth()]);
	let year = $derived(viewDate.getFullYear());
  let weeks = $derived(weeksFrom(viewDate, start));

	function getDateStr(date: Date) {
    const pad = (n:number) => n < 10 ? "0" + n : n;
    return date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate());
  }

	function showDate() {
		return format(date, 'PPP', { locale: Utils.getLocale() });
	}

	function getTimeStr(date: Date) {
		const hours = date.getHours() 
		const minutes = date.getUTCMinutes(); 
		return (hours < 10 ? `0${hours}` : hours) + ':' + (minutes < 10 ? `0${minutes}` : minutes);
  }

	function setMonth(direction: number) {
		offset = offset + direction;
	}

	function reset() {
		date = new Date();
		dateStr = getDateStr(date);
		timeStr = getTimeStr(date);
		offset = 0;
		selected = dateStr;
	}

	function selectDate(newDateStr: string) {
		selected = newDateStr;
		dateStr = newDateStr;
		date = new SvelteDate(dateStr + " " + timeStr);
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
					value === selected ? 'bg-primary-500 text-black' : '',
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

<div class="relative flex flex-row justify-center align-center mb-4">
	<button type="button" class="text-lg">
		{$_("Timer till")}: {showDate()}&#160;
	</button>
	<button type="button" class="text-lg" onclick={() => {view.isMinuteView = false; view.isDateView = false;}}>
		{timeStr.split(':')[0]}:
	</button>
	<button type="button" class="text-lg" onclick={() => {view.isMinuteView = true; view.isDateView = false;}}>
		{timeStr.split(':')[1]}
	</button>
</div>
<div class="card m-0 flex rounded-lg border border-white/5
						bg-surface-50-950 px-2 py-2 hover:border-white/10 min-h-[300px]">
	<div class="grid grid-cols-7 gap-1">
		<div class="btn-icon" onclick={() => setMonth(-1)}><ChevronLeft/></div>
		<div class="btn-icon text-primary-500" onclick={() => reset()}><Undo2/></div>
		<div class="btn col-span-3">{month} {year}</div>
		<div class="btn-icon text-primary-500" onclick={() => {view.isMinuteView = false; view.isDateView = false}}><Clock3/></div>
		<div class="btn-icon" onclick={() => setMonth(+1)}><ChevronRight/></div>
		{#each days as day}
			<div class="text-center">{day}</div>
		{/each}
		{#each weeks as week}
			{#each week as day}
				<div class="btn w-9 {day.class}" onclick={() => selectDate(day.value)}>{day.date}</div>
			{/each}
		{/each}
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
