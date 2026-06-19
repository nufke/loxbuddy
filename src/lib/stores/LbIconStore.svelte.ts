import { SvelteMap } from 'svelte/reactivity';
import { setCustomIconLoader, loadIcon } from '@iconify/svelte';
import loxiconmap from '$lib/helpers/lox2iconify.json';
import { registerCustomIcons } from '$lib/helpers/registerIcons';

/**
 * Maps a legacy Loxone icon name to an Iconify icon identifier (e.g. lucide:home).
 */
type IconMap = {
	[key: string]: string;
}

/**
 * Subset of Iconify icon data used when overriding stroke-width for weight variants.
 */
type IconProps = {
	body: string;
	left: number;
	top: number;
	width: number;
	height: number;
	rotate: number;
	hFlip: boolean;
	vFlip: boolean;
}

/**
 * Reactive store that manages custom icons including resolution and stroke-weight variants.
 *
 * On startup, {@link loadCustomIcons} must be called once to:
 * 1. Register the LoxBuddy-specific SVG icon set.
 * 2. Build the mapping from legacy Loxone icon names to Iconify identifiers.
 * 3. Set up Iconify custom loaders that rewrite `stroke-width` for five
 *    weight prefixes (`thin_`, `light_`, `medium_`, `semibold_`, `bold_`).
 *
 * During normal operation, call {@link getIcon} to translate a raw icon name
 * received from the Miniserver into the identifier that Iconify can render.
 */
class LbIconStore {
	public iconMap: SvelteMap<string, string> = new SvelteMap();

	constructor() {}

	/**
	 * Bootstraps the icon system.
	 * Registers the built-in LoxBuddy custom SVG icons and then calls
	 * {@link registerIcons} with the bundled Loxone-to-Iconify mapping file.
	 * Must be called once before any icons are resolved.
	 */
	loadCustomIcons(): void {
		registerCustomIcons(); // register LoxBuddy icons
		this.registerIcons(loxiconmap);
	}

	/**
	 * Populates the icon map and registers Iconify custom loaders for a given
	 * set of icon mappings.
	 * @param icons - Mapping of legacy icon names to Iconify identifiers.
	 */
	registerIcons(icons: IconMap): void {
		this.loadIconMap(icons); // load icon mapping table
		this.registerCallbacks(icons); // register callbacks to update icon properties
	}

	/**
	 * Resolves a legacy or internal icon name to its Iconify identifier.
	 * If the name is present in {@link iconMap} the mapped value is returned;
	 * otherwise the original name is returned as-is so the caller can still
	 * attempt to render it directly.
	 * @param name - The raw icon name (e.g. a legacy Loxone icon filename).
	 * @returns The Iconify identifier (e.g. `"light_lucide:home"`) or the
	 *   unchanged input when no mapping exists.
	 */
	getIcon(name: string): string {
		return this.iconMap.get(name) || name;
	}

	/**
	 * Fills {@link iconMap} from a raw icon mapping object.
	 * Icons that already contain a colon (i.e. are valid Iconify identifiers)
	 * are prefixed with `"light_"` so that the default weight-variant loader
	 * is applied. Icons without a colon are stored as-is.
	 * @param map - Mapping of legacy icon names to Iconify identifiers.
	 */
	private loadIconMap(map: IconMap): void {
		Object.entries(map).forEach( icon => {
			const name: string =  $state(icon[1].includes(':') ? `light_${icon[1]}` : icon[1]);
			this.iconMap.set(icon[0], name);
		});
	}

	/**
	 * Fetches an icon from Iconify and rescales its `stroke-width` attributes
	 * to the requested visual weight.
	 * The scale factor is derived from the icon's own height so that the
	 * resulting stroke appears consistent across different viewBox sizes.
	 * @param name - Icon name within the icon set (without the set prefix).
	 * @param iconSet - Iconify icon set identifier (e.g. lucide).
	 * @param strokeWidth - Desired stroke-width multiplier where 1.0 = thin,
	 *   1.5 = light, 2.0 = medium, 2.5 = semibold, and 3.0 = bold.
	 * @returns Resolved {@link IconProps} with the rewritten stroke-width, or
	 *   null when the icon cannot be loaded.
	 */
	private async updateIconProps(name: string, iconSet: string, strokeWidth: number): Promise<IconProps | null> {
		const data = await loadIcon(`${iconSet}:${name}`);
		const scale = data.height/32/0.75 * strokeWidth;
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
		} : null;
	}

	/**
	 * Derives the unique icon sets referenced in a map and registers five
	 * Iconify custom loaders per set — one for each stroke-weight prefix:
	 * thin_, light_, medium_, semibold_, and bold_.
	 * Each loader delegates to {@link updateIconProps} with a fixed
	 * strokeWidth value that corresponds to the weight.
	 * @param map - Mapping of legacy icon names to Iconify identifiers, used to
	 *   extract the set names (the part before the `:` separator).
	 */
	private registerCallbacks(map: IconMap): void {
		const iconSet: string[] = [];
		Object.values(map).forEach( (iconName) => {
			const item: string[] = iconName.split(':');
			if (item[0] && item[1] && !iconSet.includes(item[0])) {
				iconSet.push(item[0]);
			}
		});
		iconSet.forEach( (setName: string) => {
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 1.0), `thin_${setName}`);
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 1.5), `light_${setName}`);
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 2.0), `medium_${setName}`);
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 2.5), `semibold_${setName}`);
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 3.0), `bold_${setName}`);
		});
  }
}

export const iconStore = new LbIconStore();
