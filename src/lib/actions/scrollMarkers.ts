/**
 * Returns an inline SVG string for a Lucide chevron pointing up or down.
 *
 * @param dir - 'up' for a chevron-up, 'down' for a chevron-down.
 * @returns SVG markup string ready for use as `innerHTML`.
 */
const chevronSvg = (dir: 'up' | 'down') =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="${dir === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg>`;

/**
 * Creates an absolutely-positioned scroll-indicator element containing a
 * Lucide chevron SVG. The element starts fully transparent and fades in/out
 * via a CSS opacity transition when its opacity style is toggled.
 *
 * @param dir - 'up' places the marker near the top edge; 'down' near the bottom.
 * @returns A div element ready to be prepended or appended to the scroll container's parent.
 */
function makeMarker(dir: 'up' | 'down'): HTMLElement {
	const isTop = dir === 'up';
	const el = document.createElement('div');
	el.style.cssText = [
		'position:absolute',
		'z-index:10',
		'left:50%',
		`transform:translateX(-50%) translateY(${isTop ? '-50%' : '50%'})`,
		isTop ? 'top:10px' : 'bottom:10px',
		'color:var(--color-surface-500,#a1a1aa)',
		'pointer-events:none',
		'opacity:0',
		'transition:opacity 300ms'
	].join(';');
	el.innerHTML = chevronSvg(dir);
	return el;
}

/**
 * Svelte use-action that manages scroll-overflow indicators for a scrollable element.
 *
 * @param node   - The scrollable `HTMLElement` to observe (must overflow-y: auto/scroll).
 * @param margin - Pixels to subtract from 90 % of the viewport height when
 *                 computing `maxHeight`; accounts for surrounding chrome
 *                 (headers, tab bars, buttons, etc.).
 * @returns Svelte action lifecycle object with `update` and `destroy` callbacks.
 */
export function scrollMarkers(node: HTMLElement, margin: number) {
	const parent = node.parentElement!;
	const topEl = makeMarker('up');
	const bottomEl = makeMarker('down');
	parent.prepend(topEl);
	parent.append(bottomEl);

	/**
	 * Recalculates `maxHeight` and updates the opacity of both scroll-indicator
	 * markers based on the current scroll position and content dimensions.
	 *
	 * @returns `void` — side-effects only: mutates `node.style.maxHeight`,
	 *   `topEl.style.opacity`, and `bottomEl.style.opacity`.
	 */
	function parse() {
		const h = window.innerHeight || 0;
		node.style.maxHeight = `${Math.floor(h * 0.9) - margin}px`;
		const hasScroll = node.scrollHeight > node.clientHeight;
		topEl.style.opacity = (h > 0 && hasScroll && node.scrollTop > 10) ? '1' : '0';
		bottomEl.style.opacity = (h > 0 && hasScroll && node.scrollTop + node.clientHeight < node.scrollHeight - 10) ? '1' : '0';
	}

	node.addEventListener('scroll', parse);
	window.addEventListener('resize', parse);

	parse();

	return {
		update(newMargin: number) { margin = newMargin; parse(); },
		destroy() {
			node.removeEventListener('scroll', parse);
			window.removeEventListener('resize', parse);
			topEl.remove();
			bottomEl.remove();
		}
	};
}
