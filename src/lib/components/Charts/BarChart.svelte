<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { innerWidth } from 'svelte/reactivity/window';
	import { format, getDaysInMonth, getHours, getISODay, getDate as getDateOfMonth, getMonth } from 'date-fns';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';

	let { statistics } = $props();

	const margin = { top: 26, right: 10, bottom: 30, left: 30 };
	const yGrid = [0, 20, 40, 60, 80, 100];
	const height = 180;
	const months = $_('Months').split('|');
	const range = (start: number, end:number, step:number = 1) => Array.from({length: end}, (el, i) => start + (i * step) );

	let viewport: any = $state(); // TODO make HTMLDivElement
	let data = $derived(statistics?.data ?? []);
	let selector = $derived(statistics?.selector);
	let width = $derived(viewport?.clientWidth || 450);
	let graphWidth = $derived(width - (margin.left + margin.right));
	let { xGrid, xTicks, columnWidth, barWidth, xOffset } = $derived.by(() => getGraphLayout(selector, graphWidth, data.length));
	let dataMax = $derived(Math.max(...data.flatMap((item: any) => item.values)));
	let scale = $derived(dataMax >= 500e6 ? 1e9 : dataMax >= 500e3 ? 1e6 : dataMax >= 500 ? 1e3 : 1);
	let scaledData = $derived(data.map((item: any) => ({ ...item, values: item.values.map((v: number) => v / scale) })));
	let yValues = $derived(calcValues(scaledData));
	let hoveredIdx: number | null = $state(null);
	let markerX: number = $state(0);

	let xScaleGrid = $derived(scaleLinear()
		.domain([0, xGrid.length-1])
		.range([margin.left, width - margin.right])
	);

	let xScaleTick = $derived(scaleLinear()
		.domain([0, (Math.max.apply(null, xTicks))/(xTicks[1]-xTicks[0])])
		.range([margin.left, width - margin.right])
	);

	let xScaleValue = $derived(scaleLinear()
		.domain([0, xGrid.length-1])
		.range([margin.left, width - margin.right])
	);

	let yScaleGrid =  $derived(scaleLinear()
		.domain([0, 100])
		.range([height - margin.bottom, margin.top])
	);

	let yScaleValue = $derived(scaleLinear()
		.domain([0, Math.max.apply(null, yValues)])
		.range([height - margin.bottom, margin.top])
	);

	function getGraphLayout(s: string, gWidth: number, length: number) {
		let xGrid: number[];
		let xTicks: number[];
		switch (s) {
			case 'Day':   xGrid = range(0, 25, 1); xTicks = range(0, 25, 2); break;
			case 'Week':  xGrid = range(0, 8, 1);  xTicks = range(1, 7, 1);  break;
			case 'Month': xGrid = range(0, 32, 1); xTicks = range(1, 31, 2); break;
			case 'Year':  xGrid = range(0, 13, 1); xTicks = range(1, 12, 1); break;
			case 'All':   xGrid = range(0, length+1, 1); xTicks = range(1, length, 1); break;
			default:      xGrid = range(0, 3, 1);  xTicks = range(0, 3, 1);
		}

		const columnWidth = gWidth / xTicks.length;
		const xOffset = (s === 'Day') ? 0 : -columnWidth / 2 - (s === 'Week' ? 4 : 2);
		const barWidth = columnWidth / (s === 'Week' ? 4 : 3);

		return { xGrid, xTicks, columnWidth, barWidth, xOffset };
	}

	function calcValues(inp: any) {
		const values = inp.flatMap((item: any) => item.values);
		const max = Math.max(...values);
		return Array.from({length: 6}, (_, i) => (max <= 2) ? Number((i*(getRounding(max)/5)).toFixed(1)) : (i*(getRounding(max)/5)));
	}

	function getRounding(n: number) {
    const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    return steps.find(s => s > n) ?? 1;
	}

	function getDate(n: number) {
		return (selector == 'Week') && data.length ? format(data[0].ts*1000 + (n - 1) * 86400000, 'd-M') :
			(selector == 'Year') ? months[n-1] :
			(selector == 'All') && data.length && n > 0 ? format(data[n-1].ts*1000, 'yyyy') : n; // 
	}

	function getXIndex(point: any, i: number): number {
		const ms = point.ts * 1000;
		switch (selector) {
			case 'Day':   return getHours(ms);
			case 'Week':  return getISODay(ms) - 1;
			case 'Month': return getDateOfMonth(ms) - 1;
			case 'Year':  return getMonth(ms);
			default:      return i;
		}
	}

	function getDayName(n: number) {
		let days = $_('Days').split('|');
		return [...days.slice(1), days[0]][n-1]; // TODO define start of week
	}

	function handlePointerMove(e: PointerEvent) {
		const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		let nearestIdx = -1;
		let minDist = Infinity;
		scaledData.forEach((point: any, i: number) => {
			const px = xScaleValue(getXIndex(point, i)) + columnWidth / 2;
			const dist = Math.abs(px - mouseX);
			if (dist < minDist) { minDist = dist; nearestIdx = i; }
		});
		if (nearestIdx >= 0 && minDist < columnWidth) {
			hoveredIdx = nearestIdx;
			const pt = scaledData[nearestIdx];
			markerX = xScaleValue(getXIndex(pt, nearestIdx)) + columnWidth / 2;
		} else {
			hoveredIdx = null;
		}
	}

	function handlePointerDown(e: PointerEvent) {
		(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
		handlePointerMove(e);
	}

	function handlePointerUp() {
		hoveredIdx = null;
	}

	function handlePointerLeave() {
		hoveredIdx = null;
	}

	function fmtMarker(v: number): string {
		const [val, unit] = utils.formatString(v * scale, statistics?.format ?? '');
		return unit ? `${val} ${unit}` : `${val}`;
	}

	$effect( () => {
		if (innerWidth.current) { width = viewport.clientWidth; }
	});
</script>

<div class="chart" bind:this={viewport}>
	<svg {width} {height} style="touch-action: none;"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerLeave}
		onpointerleave={handlePointerLeave}>
		{#each xGrid as grid}
			<g transform="translate({xScaleGrid(grid)}, {height})">
				<line class="d3-line-vertical" x1="0" y1={-margin.bottom} x2="0" y2={margin.top - height}/>
			</g>
		{/each}
		{#each yGrid as grid}
			<g transform="translate(0, {yScaleGrid(grid)})">
				<line class="d3-line-horizontal" x1={margin.left} y1="0" x2={margin.left + graphWidth} y2="0"/>
			</g>
		{/each}
		{#each xTicks as tick}
			<g transform="translate({xScaleTick(tick)}, {height})">
				{#if selector == 'Week'}
					<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="0">{getDate(tick)}</text>
					<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="-15">{getDayName(tick)}</text>
				{:else}
					{#if selector != 'Month' || (data[0] && getDaysInMonth(data[0].ts*1000) >= tick )} 
						<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="-15">{getDate(tick)}</text>
					{/if}
				{/if}
			</g>
		{/each}
		{#each yValues as value}
			<g transform="translate(0, {yScaleValue(value)})">
				<text class="d3-text text-xs" style="text-anchor: end;" x={margin.left-6} y="4">{value}</text>
			</g>
		{/each}
		{#each scaledData as point, i}
			{#if point.values[0] > 0}
				<rect class="dark:fill-primary-500 fill-primary-700"
					x={xScaleValue(getXIndex(point, i)) + columnWidth/2 - barWidth/2 + barWidth/2}
					y={yScaleValue(point.values[0])}
					width={barWidth}
					height={yScaleValue(0) - yScaleValue(point.values[0])}/>
			{/if}
			{#if point.values[1] > 0}
				<rect class="dark:fill-secondary-500 fill-secondary-700"
					x={xScaleValue(getXIndex(point, i)) + columnWidth/2 - barWidth/2 - barWidth/2}
					y={yScaleValue(point.values[1])}
					width={barWidth}
					height={yScaleValue(0) - yScaleValue(point.values[1])}/>
			{/if}
		{/each}
		{#if hoveredIdx !== null}
			{@const pt = scaledData[hoveredIdx]}
			<line class="d3-line-vertical-marker" stroke-width="1" stroke-opacity="0.5"
				x1={markerX} y1={margin.top} x2={markerX} y2={height - margin.bottom}/>
			<text class="d3-text-marker-0 text-xs"
				style="text-anchor: middle; font-weight: bold;" x={markerX} y={10}>
				{fmtMarker(pt.values[0])}
			</text>
			{#if pt.values[1] != null}
				<text class="d3-text-marker-1 text-xs"
					style="text-anchor: middle; font-weight: bold;" x={markerX} y={22}>
					{fmtMarker(pt.values[1])}
				</text>
			{/if}
		{/if}
	</svg>
</div>
