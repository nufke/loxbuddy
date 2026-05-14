import { SvelteMap } from 'svelte/reactivity';
import { setCustomIconLoader, loadIcon } from '@iconify/svelte';
import loxiconmap from '$lib/helpers/lox2iconify.json';
import { registerCustomIcons } from '$lib/helpers/registerIcons';

type IconMap = {
	[key: string]: string;
}

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
 * Icon store to manage icons
 */
class LbIconStore {
	public iconMap: SvelteMap<string, string> = new SvelteMap();

	constructor() {}

	registerIcons(): void {
		registerCustomIcons(); // register LoxBuddy icons
		this.loadIconMap(loxiconmap); // load icon mapping table
		this.registerCallbacks(loxiconmap); // register callbacks to update icon properties
	}

	// if mapped icon is not found, we return the input icon name
	getIcon(name: string): string {
		return this.iconMap.get(name) || name;
	}

	// we postfix the default iconset with '-light' such that we can associate a callback to it
	loadIconMap(map: IconMap): void {
		Object.entries(map).forEach( icon => { 
			const name: string =  $state(icon[1].includes(':') ? `light_${icon[1]}` : icon[1]); 
			this.iconMap.set(icon[0], name); 
		});
	}

	async updateIconProps(name: string, iconSet: string, strokeWidth: number): Promise<IconProps | null> {
		const data = await loadIcon(`${iconSet}:${name}`);
		const scale = data.height/32/0.75 * strokeWidth;
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
		} : null;
	}

  // register callbacks to update properties of fonts.
	registerCallbacks(map: IconMap): void {
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
