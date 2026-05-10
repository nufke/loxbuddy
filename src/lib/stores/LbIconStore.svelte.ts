import { SvelteMap } from 'svelte/reactivity';
import { setCustomIconLoader, loadIcon, addCollection } from '@iconify/svelte';
import type { IconifyJSON } from '@iconify/types';
import loxiconmap from '$lib/helpers/lox2iconify.json';
import { registerCustomIcons } from '$lib/helpers/registerIcons';
import lucideIcons from '@iconify/json/json/lucide.json';
import lucideLabIcons from '@iconify/json/json/lucide-lab.json';
import tablerIcons from '@iconify/json/json/tabler.json';
import hugeIcons from '@iconify/json/json/hugeicons.json';
import streamlineUltimateIcons from '@iconify/json/json/streamline-ultimate.json';
import streamlinePlumpIcons from '@iconify/json/json/streamline-plump.json';
import streamlineSharpIcons from '@iconify/json/json/streamline-sharp.json';
import streamlineCyberIcons from '@iconify/json/json/streamline-cyber.json';
import streamlineIcons from '@iconify/json/json/streamline.json';
import lineMdIcons from '@iconify/json/json/line-md.json';
import iconParkOutlineIcons from '@iconify/json/json/icon-park-outline.json';
import iconParkTwoToneIcons from '@iconify/json/json/icon-park-twotone.json';
import iconoirIcons from '@iconify/json/json/iconoir.json';
import ionIcons from '@iconify/json/json/ion.json';
import mageIcons from '@iconify/json/json/mage.json';
import majestIcons from '@iconify/json/json/majesticons.json';
import mynauiIcons from '@iconify/json/json/mynaui.json';
import solarIcons from '@iconify/json/json/solar.json';
import siIcons from '@iconify/json/json/si.json';
import heroIcons from '@iconify/json/json/heroicons.json';
import heroIconsOutline from '@iconify/json/json/heroicons-outline.json';
import charmIcons from '@iconify/json/json/charm.json';
import akarIcons from '@iconify/json/json/akar-icons.json';
import famIcons from '@iconify/json/json/famicons.json';
import flowbiteIcons from '@iconify/json/json/flowbite.json';
import guidanceIcons from '@iconify/json/json/guidance.json';
import iconamoonIcons from '@iconify/json/json/iconamoon.json';
import phIcons from '@iconify/json/json/ph.json';
import proIcons from '@iconify/json/json/proicons.json';
import tDesignIcons from '@iconify/json/json/tdesign.json';
import ciIcons from '@iconify/json/json/ci.json';

type IconMap = {
	[key: string]: string;
}

/**
 * Icon store to manage icons
 */
class LbIconStore {
	public iconMap: SvelteMap<string, string> = new SvelteMap();

	constructor() {}

	registerIcons() {
		// pre-load icons from local bundles
		[	lucideIcons, lucideLabIcons, tablerIcons, hugeIcons,
			streamlineUltimateIcons, streamlinePlumpIcons, streamlineSharpIcons, streamlineCyberIcons, streamlineIcons,
			lineMdIcons, iconParkOutlineIcons, iconParkTwoToneIcons, iconoirIcons, ionIcons,
			mageIcons, majestIcons, mynauiIcons, solarIcons, siIcons,
			heroIcons, heroIconsOutline, charmIcons, akarIcons, famIcons,
			flowbiteIcons, guidanceIcons, iconamoonIcons, phIcons, proIcons, tDesignIcons, ciIcons ]
			.forEach((iconSet) => addCollection(iconSet as IconifyJSON));

		registerCustomIcons(); // register LoxBuddy icons
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
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 2.5), `semibold_${setName}`);
			setCustomIconLoader( (name: string) => this.updateIconProps(name, setName, 3.0), `bold_${setName}`);
		});
  }
}

export const iconStore = new LbIconStore();
