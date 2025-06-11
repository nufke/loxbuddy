<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import { ChevronRight } from '@lucide/svelte';
	import { Clock3 } from '@lucide/svelte';
	import { Undo2 } from '@lucide/svelte';
	import { _ } from 'svelte-i18n';

	let days = $_('Days').split('|');
	let months = $_('Months').split('|');
	let start = 0; // first day of the week (0 = Sunday, 1 = Monday)

	let selected: string = $state('');
	let offset = $state(0); // offset in months from currently selected date
	let today: string = $state(getDateStr(new Date()));
	let date = $derived(today);
	let viewDate = $derived(viewDateFrom(date, offset));
	let month = $derived(months[viewDate.getMonth()]);
	let year = $derived(viewDate.getFullYear());
  let weeks = $derived(weeksFrom(viewDate, date, start));

	function getDateStr(date: Date) {
    const pad = (n:number) => n < 10 ? "0" + n : n;
    return date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate());
  }

	function setMonth(direction: number) {
		offset = offset + direction;
	}

	function setTime() {
	}

	function reset() {
		date = getDateStr(new Date());
		offset = 0;
		selected = '';
	}

	function selectDate(newDate: string) {
		selected = newDate;
		date = newDate;
		offset = 0;
	}

	function viewDateFrom(date: string, offset: number) {
		let viewDate = new Date(date);
		viewDate.setMonth(viewDate.getMonth() + offset);
		return viewDate;
	}

	function weeksFrom(viewDate: Date, date: string, start: number) {
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
					value === today ? 'bg-green-500 text-black' : '',
					value === selected ? 'selected' : ''
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

<div class="card m-0 flex  rounded-lg border border-white/5
						bg-linear-to-r from-white/[0.095] to-white/5 px-2 py-2 hover:border-white/10 min-h-[300px]">
	<div class="grid grid-cols-7 gap-1">
		<div class="btn-icon" onclick={() => setMonth(-1)}><ChevronLeft/></div>
		<div class="btn-icon text-green-500" onclick={() => reset()}><Undo2/></div>
		<div class="btn col-span-3">{month} {year}</div>
		<div class="btn-icon text-green-500" onclick={() => setTime()}><Clock3/></div>
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
	.btn:hover, .btn-icon:hover, .selected {
		background: gray;
		filter: brightness(100%);
	}
	.past, .future {
    opacity: 0.5;
  }
</style>
