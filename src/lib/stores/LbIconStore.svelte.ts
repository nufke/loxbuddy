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
	private strokeWidth = 1.25; // defaiult stroke-width based on 32x32 size icons 

	constructor() {
		registerIcons(); // register LoxBuddy icons
		this.loadIconMap(loxiconmap); // load icon mapping table
		this.registerCallbacks(); // register callbacks to update icon properties
	}

	// if mapped icon is not found, we return the input icon name
	getIcon(name: string) {
		return this.iconMap.get(name) || name;
	}

	 // we prefix the iconset name with 'lb_' such that we can associate a callback to it
	loadIconMap(map: IconMap) {
		Object.entries(map).forEach( icon => { 
			const name: string =  $state(icon[1].includes(':') ? 'lb_' + icon[1] : icon[1]); 
			this.iconMap.set(icon[0], name); 
		});
	}

	async updateIconProps(name: string, iconSet: string) {
		const data = await loadIcon(`${iconSet}:${name}`);
		const scale = data.height/32/0.75 * this.strokeWidth;
		if ((iconSet == 'lucide') && name == 'house') {
			console.log(data);
		}
		return data ? {
			...data,
			body: data.body.replaceAll(/stroke-width=\"[0-9\.]+\"/g, `stroke-width="${scale}"`)
		} : null;
	}

  // register callbacks to update properties of fonts.
	registerCallbacks() {
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'akar-icons'), 'lb_akar-icons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'charm'), 'lb_charm');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'ci'), 'lb_ci');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'cbi'), 'lb_cbi');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'famicons'), 'lb_famicons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'flowbite'), 'lb_flowbite');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'heroicons'), 'lb_heroicons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'heroicons-outline'), 'lb_heroicons-outline');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'hugeicons'), 'lb_hugeicons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'iconamoon'), 'lb_iconamoon');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'iconoir'), 'lb_iconoir');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'icon-park-outline'), 'lb_icon-park-outline');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'ion'), 'lb_ion');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'line-md'), 'lb_line-md');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'loxbuddy'), 'lb_loxbuddy');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'lucide'), 'lb_lucide');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'lucide-lab'), 'lb_lucide-lab');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'majesticons'), 'lb_majesticons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'mage'), 'lb_mage');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'mynaui'), 'lb_mynaui');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'ph'), 'lb_ph');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'proicons'), 'lb_proicons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'si'), 'lb_si');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'solar'), 'lb_solar');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'streamline'), 'lb_streamline');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'streamline-flex'), 'lb_streamline-flex');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'streamline-plump'), 'lb_streamline-plump');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'streamline-sharp'), 'lb_streamline-sharp');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'streamline-ultimate'), 'lb_streamline-ultimate');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'system-uicons'), 'lb_system-uicons');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'tabler'), 'lb_tabler');
		setCustomIconLoader( (name: string) => this.updateIconProps(name, 'tdesign'), 'lb_tdesign');
  }
}

export const iconStore = new LbIconStore();
