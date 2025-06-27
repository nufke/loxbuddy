<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import { format } from 'date-fns';
	import { Utils } from '$lib/helpers/utils';
	import { _ } from 'svelte-i18n';
	import { Calendar } from '@lucide/svelte';

	let { date = $bindable(), view = $bindable() } = $props();

	let minuteIncrement: number = 1;
	let showMeridian: boolean = false;
	let meridiem: string[] = ['am', 'pm'];
	let refClock: HTMLElement
	let size = 300;

	let isMinuteView: boolean = $state(view.isMinuteView);
	let selectedHour = $derived(date.getHours() || 0);
	let selectedMinutes = $derived(date.getMinutes() || 0);
	let isMouseDown: boolean = $state(false);
	let pos = $derived(positions(isMinuteView ? size : size*0.85, size/2, 0, false, 0));
	let isPM = $derived(showMeridian ? selectedHour >= 12 : false);
	let multiplier = $derived(isMinuteView ? 5 : 1);
	let innerHours = $derived(
		positions(isMinuteView ? size*0.85 : size*0.55, size/2, isMinuteView ? 0 : 12, isMinuteView, 12)
	);

	let handCss = $derived.by(() => {
		const nextDegree = isMinuteView ? selectedMinutes * 6 : (selectedHour % 12) * 30;
		return isMinuteView || showMeridian || selectedHour < 12
			? `transform: rotateZ(${nextDegree}deg);`
			: `transform: rotateZ(${nextDegree}deg); height: calc(23% + 1px)`;
	});

	function resetDate() {
		return new SvelteDate();
	}

	function updateView(passedValue: SvelteDate) {
		if (date.valueOf() !== passedValue.valueOf() && passedValue) {
			date = new SvelteDate(passedValue);
		} else if (!passedValue) {
			isMinuteView = false;
			if (!date) {
				date = resetDate();
			} else {
				date.setHours(0, 0);
			}
		}
	}

	function positions(size: number, offset: number, valueForZero: number, minuteView: boolean, hourAdded: number) {
		const r = (size) / 2;
		offset = offset || r;
		const coeff = [0, 1 - 0.5, 1 - 0.134, 1, 1 - 0.134, 1 - 0.5];
		const xCoeff = coeff.concat(coeff);
		const yCoeff = coeff.slice(3).concat(coeff).concat(coeff.slice(0, 3));
		const pos = [];
		for (let i = 0; i < 12; i++) {
			pos.push({
				x: Math.abs(xCoeff[i] * r + (i <= 6 ? 1 : -1) * offset),
				y: Math.abs(yCoeff[i] * r + (i >= 9 || i < 3 ? -1 : 1) * offset),
				val: minuteView ? i * 5 || valueForZero : i ? i + hourAdded : valueForZero
			});
		}
		return pos;
	}

	function showTime(value: number, asMeridian: boolean) {
		if (asMeridian) {
			if (isPM && value === 12) return 12;
			return value < 10 || value % 12 < 10 ? `0${value % 12}` : value % 12;
		}
		return value < 10 ? `0${value}` : value;
	}

	function isSelected(selected: number, val: string|number, i: number) {
		if (isMinuteView) {
			return val === selected || (i === 0 && i === selected);
		} else {
			if (showMeridian) {
				if (isPM && val == 12 && selected === 12) return true;
				if (!isPM && val == 12 && selected === 0) return true;
				return val === (selected ? selected % 12 : 12);
			} else if (+val > 12) {
				return (i ? multiplier * i + 12 : 0) === selected;
			} else {
				return val === '00' || val === '12'
					? (selected === 12 && parseInt(val) == 12) || (val === '00' && selected === 0)
					: val === selected;
			}
		}
	}

	function onClick(e: any) {
		if (!e.target) return;
		let a = 0;
		let b = 0;
		if (e.target.tagName === 'BUTTON') {
			let val = parseInt(e.target.dataset.value);
			if (!isMinuteView && isPM) {
				val += 12;
			}
			if (isMinuteView && minuteIncrement !== 1) {
				if (e.isKeyboard) {
					val =
						val > selectedMinutes
							? selectedMinutes + minuteIncrement
							: selectedMinutes - minuteIncrement;
				} else if (val % minuteIncrement !== 0) {
					const diff = val % minuteIncrement;
					const prev = val - diff;
					const next = prev + minuteIncrement;
					val = next - val < val - prev ? next : prev;
				}
			}
			isMinuteView ? date.setMinutes(val) : date.setHours(val);
		} else if (isMinuteView) {
			const rect = refClock.getBoundingClientRect();
			const clientX = e.clientX - rect.left;
			const clientY = e.clientY - rect.top;
			const cntX = size/2, cntY = size/2;
			let quadrant = null;
			if (clientX > cntX) {
				quadrant = clientY > cntY ? 2 : 1;
			} else {
				quadrant = clientY > cntY ? 3 : 4;
			}
			switch (quadrant) {
				case 1:
					a = clientX - cntX;
					b = cntY - clientY;
					break;
				case 2:
					a = clientX - cntX;
					b = clientY - cntY;
					break;
				case 3:
					a = cntX - clientX;
					b = clientY - cntY;
					break;
				case 4:
					a = cntX - clientX;
					b = cntY - clientY;
					break;
			}
			const c = Math.sqrt(a * a + b * b);
			const beta = 90 - Math.asin(a / c) * (180 / Math.PI);
			let degree = 0;
			switch (quadrant) {
				case 1:
					degree = 90 - beta;
					break;
				case 2:
					degree = beta + 90;
					break;
				case 3:
					degree = 270 - beta;
					break;
				case 4:
					degree = beta + 270;
					break;
			}
			degree = Math.round(degree / 6 / minuteIncrement) * minuteIncrement;
			if (degree >= 60) {
				degree = 0;
			}
			date.setMinutes(degree);
		} else {
			return;
		}

		if (!isMouseDown && e.type !== 'keyboard' && !isMinuteView) {
			isMinuteView = true;
		}
	}

	function onToggleMove(e: any) {
		isMouseDown = (e.type === 'mousedown');
	}

	function showDate() {
		return format(date, 'PPP', { locale: Utils.getLocale() });
	}

	$effect(() => {
		updateView(date);
	});
</script>

<div class="relative">
	<div class="relative flex flex-row justify-center align-center mb-4">
		<button type="button" class="text-lg" onclick={() => {view.isDateView = true; isMinuteView = false;}}>
			{$_("Timer till")}: {showDate()}&#160;
		</button>
		<button type="button" class="text-lg" class:is-active={!isMinuteView} onclick={() => (isMinuteView = false)}>
			{showTime(selectedHour, showMeridian)}
		</button>
		<span class="text-lg"> : </span>
		<button type="button" class="text-lg" class:is-active={isMinuteView} onclick={() => (isMinuteView = true)}>
			{showTime(selectedMinutes, false)}
		</button>
		{#if showMeridian}
			<span class="text-lg">{(isPM ? meridiem[1] : meridiem[0]).toUpperCase()}</span>
		{/if}
	</div>
	<button class="absolute z-10 top-[50px] right-[0px] text-primary-500 text-sm" onclick={() => {view.isDateView = true; isMinuteView = false;}}>
		<Calendar size="18"/>
	</button>
	<div class="relative card flex rounded-full m-auto border border-white/5 bg-linear-to-r from-white/[0.095] 
							to-white/5 hover:border-white/10 overflow-auto" style="width: {size}px; height: {size}px"
							class:is-minute-view={isMinuteView} bind:this={refClock} onclick={(e) => { e.preventDefault(); onClick(e);}}
							onmousedown={onToggleMove} onmousemove={(e) => {isMouseDown && onClick(e);}} onmouseup={onToggleMove}>
		<div class="absolute w-[6px] h-[6px] left-[50%] top-[50%] bg-primary-500 rounded-full translate-x-[-50%] translate-y-[-50%]"></div>
		<div class="lb-hand absolute w-[2px] bg-primary-500 bottom-[50%]" style={handCss}>
			<div class="relative left-[-15px] top-[-29px] w-[4px] h-[4px] bg-transparent rounded-full box-content border-solid border-14 border-primary-500"></div>
		</div>
		{#each pos as p, i (p.val)}
			<button type="button" class="lb-ticks absolute text-center rounded-full border-0 cursor-pointer translate-x-[-50%] translate-y-[-50%]"
			        style={`left:${p.x}px; top:${p.y}px;`} class:outer-tick={isMinuteView}
				transition:fade={{ duration: 200 }} data-value={p.val} 
				class:is-selected={isSelected(selectedHour, p.val, i)}>{p.val}
			</button>
		{/each}
		{#each innerHours as p, i}
			<button type="button" class="lb-ticks absolute text-center rounded-full border-0 cursor-pointer  translate-x-[-50%] translate-y-[-50%]" 
			  style={`left:${p.x}px; top:${p.y}px;`} class:outer-tick={showMeridian && !isMinuteView}
				transition:fade={{ duration: 200 }} data-value={p.val} 
				class:is-selected={isSelected(isMinuteView ? selectedMinutes : selectedHour, p.val, i)}>
					{p.val}
			</button>
		{/each}
	</div>
</div>

<style>
	.lb-hand {
		height: calc(40% - 4px);
		left: calc(50% - 1px);
		transform-origin: center bottom 0;
		transition:
			transform 0.3s ease,
			height 0.15s ease;
	}
	.lb-ticks {
		transition: all 0.3s;
	}
	.lb-ticks:hover {
		color: var(--sdt-clock-color-hover);
		background-color: var(--sdt-clock-time-bg-hover);
	}
	.lb-ticks.outer-tick {
		opacity: 0;
	}
	.lb-ticks.is-selected {
		animation: tick-selection 0s 0.175s ease-out forwards;
		color: black;
		background: var(--color-primary-500);
	}
</style>
