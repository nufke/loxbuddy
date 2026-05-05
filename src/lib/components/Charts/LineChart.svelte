<script lang="ts">
	import { scaleLinear } from 'd3-scale';
	import { line, area } from 'd3-shape';
	import { innerWidth } from 'svelte/reactivity/window';
	import { getHours } from 'date-fns';
	import { _ } from 'svelte-i18n';

	let { statistics, storage, fixedStep = 0 } = $props();

	const margin = { top: 10, right: 10, bottom: 30, left: 30 };
	const height = 180;
  const stopColorCss = ['var(--color-primary-500)', 'var(--color-secondary-500)']
	const range = (start: number, end: number, step: number = 1) => Array.from({ length: end }, (_, i) => start + i * step);
	const xGrid = range(0, 25);
	const xTicks = range(0, 25, 2);
	const xOffset = 0;

  let GradientColor = $derived( storage ? stopColorCss.reverse() : stopColorCss)
	let viewport: any = $state();
	let data = $derived(statistics?.data ?? []);
	let width = $derived(viewport?.clientWidth || 450);
	let graphWidth = $derived(width - (margin.left + margin.right));

	let scaledData = $derived.by(() => {
		const vals = data.map((d: any) => d.values[0]);
		const absMax = Math.max(0, ...vals.map(Math.abs));
		const s = absMax >= 500e6 ? 1e9 : absMax >= 500e3 ? 1e6 : absMax >= 500 ? 1e3 : 1;
		return data.map((d: any) => ({ ts: d.ts, value: d.values[0] / s }));
	});

	let yMin = $derived(Math.min(0, ...scaledData.map((d: any) => d.value)));
	let yMax = $derived(Math.max(0, ...scaledData.map((d: any) => d.value)));
	let yValues = $derived(calcYValues(yMin, yMax));

function calcYValues(min: number, max: number): number[] {
		if (min === 0 && max === 0) return [0, 1, 2, 3, 4];
		const steps = fixedStep ? [25] : [0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]; // overrule step for fixed 0-100% percent
		const negExt = min < 0 ? -min : 0;
		const posExt = max > 0 ? max : 0;
		const step = steps.find(s =>
			(negExt > 0 ? Math.ceil(negExt / s) : 0) + (posExt > 0 ? Math.ceil(posExt / s) : 0) <= 4
		) ?? 1000;
		const negCount = negExt > 0 ? Math.ceil(negExt / step) : 0;
		const posCount = posExt > 0 ? Math.ceil(posExt / step) : 0;
		const pad = 3 - negCount - posCount;
		const finalNeg = negCount + (max <= 0 ? pad : 0);
		return Array.from({ length: 5 }, (_, i) => (i - finalNeg) * step);
	}

	function getXIndex(point: any): number {
    return getHours(point.ts * 1000);
	}

	function getDate(n: number) {
		return n;
	}

	let xScaleGrid = $derived(scaleLinear()
		.domain([0, xGrid.length - 1])
		.range([margin.left, width - margin.right]));

	let xScaleTick = $derived(scaleLinear()
		.domain([0, (Math.max.apply(null, xTicks)) / ((xTicks[1] ?? 1) - xTicks[0])])
		.range([margin.left, width - margin.right]));

	let xScaleValue = $derived(scaleLinear()
		.domain([0, xGrid.length - 1])
		.range([margin.left, width - margin.right]));

	let yScaleValue = $derived(scaleLinear()
		.domain([Math.min(...yValues), Math.max(...yValues)])
		.range([height - margin.bottom, margin.top]));

	let yZero = $derived(yScaleValue(0));

	let linePath = $derived(
		line<any>()
			.x((d, i) => xScaleValue(getXIndex(d, i)))
			.y((d) => yScaleValue(d.value))
			.defined((d) => d.value != null && isFinite(d.value))
			(scaledData) ?? ''
	);

	let areaPath = $derived(
		area<any>()
			.x((d, i) => xScaleValue(getXIndex(d, i)))
			.y0(yZero)
			.y1((d) => yScaleValue(d.value))
			.defined((d) => d.value != null && isFinite(d.value))
			(scaledData) ?? ''
	);

	$effect(() => {
		if (innerWidth.current) { width = viewport.clientWidth; }
	});
</script>

<div class="chart" bind:this={viewport}>
	<svg {width} {height}>
		<defs>
			<linearGradient id="lc-grad-positive" x1="0" y1={margin.top} x2="0" y2={yZero} gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color={GradientColor[0]} stop-opacity="1"/>
				<stop offset="100%" stop-color={GradientColor[0]} stop-opacity="0.1"/>
			</linearGradient>
			<linearGradient id="lc-grad-negative" x1="0" y1={yZero} x2="0" y2={height - margin.bottom} gradientUnits="userSpaceOnUse">
				<stop offset="0%" stop-color={GradientColor[1]} stop-opacity="0.1"/>
				<stop offset="100%" stop-color={GradientColor[1]} stop-opacity="1"/>
			</linearGradient>
			<clipPath id="lc-clip-positive">
				<rect x={margin.left} y={margin.top} width={graphWidth} height={Math.max(0, yZero - margin.top)}/>
			</clipPath>
			<clipPath id="lc-clip-negative">
				<rect x={margin.left} y={yZero} width={graphWidth} height={Math.max(0, height - margin.bottom - yZero)}/>
			</clipPath>
		</defs>

		{#each xGrid as grid}
			<g transform="translate({xScaleGrid(grid)}, {height})">
				<line class="d3-line-vertical" x1="0" y1={-margin.bottom} x2="0" y2={margin.top - height}/>
			</g>
		{/each}

		{#each yValues as value}
			<g transform="translate(0, {yScaleValue(value)})">
				<line class="d3-line-horizontal {value === 0 ? 'opacity-60' : ''}"
					x1={margin.left} y1="0" x2={margin.left + graphWidth} y2="0"/>
			</g>
		{/each}

		{#each xTicks as tick}
			<g transform="translate({xScaleTick(tick)}, {height})">
				<text class="d3-text text-xs" style="text-anchor: middle;" x={xOffset} y="-15">{getDate(tick)}</text>
			</g>
		{/each}

		{#each yValues as value}
			<g transform="translate(0, {yScaleValue(value)})">
				<text class="d3-text text-xs" style="text-anchor: end;" x={margin.left - 6} y="4">{value}</text>
			</g>
		{/each}

		{#if linePath}
			<path d={areaPath} fill="url(#lc-grad-positive)" clip-path="url(#lc-clip-positive)"/>
			<path d={areaPath} fill="url(#lc-grad-negative)" clip-path="url(#lc-clip-negative)"/>
			<path d={linePath} fill="none" stroke-width="2"
				class={storage ? 'dark:stroke-secondary-500 secondary-primary-700' : 'dark:stroke-primary-500 stroke-primary-700'}
				clip-path="url(#lc-clip-positive)"/>
			<path d={linePath} fill="none" stroke-width="2"
				class={storage ? 'dark:stroke-primary-500 stroke-primary-700' : 'dark:stroke-secondary-500 stroke-secondary-700'}
				clip-path="url(#lc-clip-negative)"/>
		{/if}
	</svg>
</div>
