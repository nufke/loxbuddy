import { SvelteMap } from 'svelte/reactivity';
import { INITIAL_STRUCTURE } from '$lib/types/models';
import type { Structure, Control, Category } from '$lib/types/models';
import { Utils } from '$lib/helpers/utils';
import { loxiconsPath } from '$lib/helpers/paths';

class Store {
	structure: Structure = $state(INITIAL_STRUCTURE);
	controls = $derived(this.structure.controls);
	rooms = $derived(this.structure.rooms);
	categories= $derived(this.structure.cats);
	controlList = $derived(Object.values(this.structure.controls));
	categoryList = $derived(Object.values(this.structure.cats));
	roomList = $derived(Object.values(this.structure.rooms));
	securedDetails = new SvelteMap();
	lastBellEventImages = new SvelteMap();
  state = new SvelteMap();
	time = $state(new Date());
	
	constructor() {
		setInterval(() => {
	  	this.time = new Date();
		}, 1000);
  }

	initStructure(data: Structure) {
		Object.assign(this.structure, data);
	}

	getSecuredDetails(uuid: string) {
		const s = this.securedDetails.get(uuid);
		if (s) {
			return s;
		} else {
			return {};
		}
	}

	getState(uuid: string) {
		return this.state.get(uuid);
	}

	setState(key: string, data: any) {
		//console.log('setState', key, data);
		let item = $state(data);
		this.state.set(key, item);
	}

	setInitialStates(data: any) {
		Object.keys(data).forEach( (key) => {
			let item = $state(data[key]);
			let obj = Utils.isValidJSONObject(item) ? JSON.parse(item) : item;
			this.state.set(key, obj);
		});
	}

	setSecuredDetails(key: string, data: any) {
		//console.log('setSecuredDetails', key, data);
		let item = $state(data);
		this.securedDetails.set(key, item);
	}

	setLastBellEventImage(uuid: string, date: string, base64image: string) {
		let item: any = $state();
		let oldContent: any = this.lastBellEventImages.get(uuid);
		if (oldContent) {
			item = {...oldContent, [date]: base64image}; // add/replace item
		} else {
			item = {[date]: base64image}; // first item
		}
		this.lastBellEventImages.set(uuid, item);
	}

	getLastBellEventImages(uuid: string) {
		let images =  this.lastBellEventImages.get(uuid);
		//console.log('getLastBellEventImages', images);
		return images || [];
	}

	getCategoryIcon(control: Control, isSubControl: boolean | undefined) {
		if (control.defaultIcon) return  loxiconsPath + control.defaultIcon;
		if (!isSubControl) { 
			const cat = this.categoryList.find((cat: Category) => cat.uuid == control.cat);
			return cat ? loxiconsPath + cat.image : '';
		} else {
			return ''; // hide icon for subcontrols by returning empty name
		}
	}
}

export const store = new Store();
