<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { innerWidth } from 'svelte/reactivity/window';
	import { format, getDaysInMonth, getHours, getISODay, getDate as getDateOfMonth, getMonth } from 'date-fns';
	import { _ } from 'svelte-i18n';
	import { utils } from '$lib/helpers/Utils';
	import { tick } from 'svelte';

	let { statistics } = $props();

	const margin = { top: 40, right: 10, bottom: 60, left: 30 };
	const yGrid = [0, 20, 40, 60, 80, 100];
	const height = 240;
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
	let label0X: number = $state(0);
	let label1X: number = $state(0);
	let textEl0: SVGTextElement | null = $state(null);
	let textEl1: SVGTextElement | null = $state(null);

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

	type GraphLayout = {
		xGrid: number[];
		xTicks: number[];
		columnWidth: number;
		barWidth: number;
		xOffset: number;
	}

	function getGraphLayout(s: string, gWidth: number, length: number): GraphLayout {
		let xGrid: number[];
		let xTicks: number[];
		let days = data[0] ? getDaysInMonth(data[0].ts*1000) : 31;
		switch (s) {
			case 'Day':   xGrid = range(0, 25, 1); xTicks = range(0, 25, 2); break;
			case 'Week':  xGrid = range(0, 8, 1);  xTicks = range(1, 7, 1);  break;
			case 'Month': xGrid = range(0, days+1, 1); xTicks = range(1, days, 2); break;
			case 'Year':  xGrid = range(0, 13, 1); xTicks = range(1, 12, 1); break;
			case 'All':   xGrid = range(0, length+1, 1); xTicks = range(1, length, 1); break;
			default:      xGrid = range(0, 3, 1);  xTicks = range(0, 3, 1);
		}

		const columnWidth = gWidth / xTicks.length;
		const xOffset = (s === 'Day') ? 0 : -columnWidth / 2 - (s === 'Week' ? 4 : 2);
		const barWidth = columnWidth / (s === 'Week' ? 4 : 3);

		return { xGrid, xTicks, columnWidth, barWidth, xOffset };
	}

	function calcValues(inp: any): number[] {
		const values = inp.flatMap((item: any) => item.values);
		const max = Math.max(...values);
		return Array.from({length: 6}, (_, i) => (max <= 2) ? Number((i*(getRounding(max)/5)).toFixed(1)) : (i*(getRounding(max)/5)));
	}

	function getRounding(n: number): number {
    const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    return steps.find(s => s > n) ?? 1;
	}

	function getDate(n: number): string {
		return (selector == 'Week') && data.length ? format(data[0].ts*1000 + (n - 1) * 86400000, 'd-M') :
			(selector == 'Year') ? months[n-1] :
			(selector == 'All') && data.length && n > 0 ? format(data[n-1].ts*1000, 'yyyy') : String(n); // 
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

	function getDayName(n: number): string {
		let days = $_('Days').split('|');
		return [...days.slice(1), days[0]][n-1]; // TODO define start of week
	}

	async function handlePointerMove(e: PointerEvent): Promise<void> {
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
			await tick(); /* make sure we wait for updated display */
			const w0 = textEl0?.getComputedTextLength() ?? 0;
			const w1 = textEl1?.getComputedTextLength() ?? 0;
			clampLabels(markerX, w0, w1);
		} else {
			hoveredIdx = null;
		}
	}

	function handlePointerDown(e: PointerEvent): void {
		(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
		handlePointerMove(e);
	}

	function handlePointerUp(): void {
		hoveredIdx = null;
	}

	function handlePointerLeave(): void {
		hoveredIdx = null;
	}

	function clampLabels(x: number, w0: number, w1: number): void {
		if (w1 === 0) {
			label0X = Math.min(Math.max(x, margin.left + w0 / 2), width - margin.right - w0 / 2);
			return;
		}
		const natural0 = x + 4;
		const natural1 = x - 4;
		const max0 = width - margin.right - w0;
		const min1 = margin.left + w1;
		if (natural0 > max0) {
			label0X = max0;
			label1X = natural1 - (natural0 - max0);
		} else if (natural1 < min1) {
			label1X = min1;
			label0X = natural0 + (min1 - natural1);
		} else {
			label0X = natural0;
			label1X = natural1;
		}
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
		<text class="d3-text text-md" style="text-anchor: middle;" x={width/2} y="12">{statistics?.title} ({utils.formatString(dataMax, statistics?.format)[1]})</text>
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
			<g transform="translate({xScaleTick(tick)}, {height - margin.bottom})">
				{#if selector == 'Week'}
					<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="30">{getDate(tick)}</text>
					<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="15">{getDayName(tick)}</text>
				{:else}
					{#if selector != 'Month' || (data[0] && getDaysInMonth(data[0].ts*1000) >= tick )} 
						<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="15">{getDate(tick)}</text>
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
		<text class="d3-text text-md" style="text-anchor: middle;" x={width/2} y={selector == 'Week' ? height - margin.bottom + 53 : height - margin.bottom + 38}>{$_(utils.capitalize(statistics?.xLabel))}</text>
		{#if hoveredIdx !== null}
			{@const pt = scaledData[hoveredIdx]}
			<line class="d3-line-vertical-marker" stroke-width="1" stroke-opacity="0.5"
				x1={markerX} y1={margin.top} x2={markerX} y2={height - margin.bottom}/>
			<text bind:this={textEl0} class="d3-text-marker-0 text-xs"
				style="{(pt.values[1] != null) ? 'text-anchor: start' : 'text-anchor: middle'}; font-weight: bold;" x={label0X} y={margin.top - 8}>
				{fmtMarker(pt.values[0])}
			</text>
			{#if pt.values[1] != null}
				<text bind:this={textEl1} class="d3-text-marker-1 text-xs"
					style="text-anchor: end; font-weight: bold;" x={label1X} y={margin.top - 8}>
					{fmtMarker(pt.values[1])}
				</text>
			{/if}
		{/if}
	</svg>
</div>
