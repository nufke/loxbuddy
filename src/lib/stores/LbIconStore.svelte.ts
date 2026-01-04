import { SvelteMap } from 'svelte/reactivity';
import { setCustomIconLoader, loadIcon } from '@iconify/svelte';
import loxiconmap from '$lib/helpers/lox2iconify.json';
import { registerIcons } from '$lib/helpers/registerIcons';

type IconMap = {
	[key: string]: string;
}

/**
 * Icon store to manage icons
 */
class LbIconStore {
	public iconMap: SvelteMap<string, string> = new SvelteMap();

	constructor() {
		registerIcons(); // register LoxBuddy icons
		this.loadIconMap(loxiconmap); // load icon mapping table
		this.registerCallbacks(loxiconmap); // register callbacks to update icon properties
	}

	// if mapped icon is not found, we return the input icon name
	getIcon(name: string) {
		return this.iconMap.get(name) || name;
	}

	// we postfix the default iconset with '-light' such that we can associate a callback to it
	loadIconMap(map: IconMap) {
		Object.entries(map).forEach( icon => { 
			const name: string =  $state(icon[1].includes(':') ? `light_${icon[1]}` : icon[1]); 
			this.iconMap.set(icon[0], name); 
		});
	}

	async updateIconProps(name: string, iconSet: string, strokeWidth: number) {
		const data = await loadIcon(`${iconSet}:${name}`);
		const scale = data.height/32/0.75 * strokeWidth;
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
		} : null;
	}

  // register callbacks to update properties of fonts.
	registerCallbacks(map: IconMap) {
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
		});
  }
}

export const iconStore = new LbIconStore();
