import { SvelteMap } from 'svelte/reactivity';
import { INITIAL_STRUCTURE } from '$lib/types/models';
import type { Structure, Control, Category, Room, SystemStatus, Route, ModalView, NotificationMap,
							ControlsMap, CategoriesMap, RoomsMap, MessageCenter, NotificationMessage } from '$lib/types/models';
import { Utils } from '$lib/helpers/utils';
import { loxiconsPath } from '$lib/helpers/paths';
import { Menu } from '@lucide/svelte';

class Store {
  controlState: SvelteMap<string, any> = new SvelteMap();
	nav: Route = $state({ label: 'Menu', href: '/menu', icon: Menu });
	structure: Structure = $state(INITIAL_STRUCTURE);
	controls: ControlsMap = $derived(this.structure.controls);
	rooms: RoomsMap = $derived(this.structure.rooms);
	categories: CategoriesMap = $derived(this.structure.cats);
	messageCenterList: MessageCenter[] = $derived(Object.values(this.structure.messageCenter));
	controlList: Control[] = $derived(Object.values(this.structure.controls));
	categoryList: Category[] = $derived(Object.values(this.structure.cats));
	roomList: Room[] = $derived(Object.values(this.structure.rooms));
	securedDetails: SvelteMap<string, any> = new SvelteMap();
	lastBellEventImages: SvelteMap<string, any> = new SvelteMap();
	time: Date = $state(new Date());
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	msAlive: boolean = $derived(false);
	msStatus: number = $derived(this.getSystemCode());
	notifications: NotificationMessage = $derived(this.getState(this.structure.globalStates.notifications) as NotificationMessage);
	notificationsMap: NotificationMap = $state({});

	weatherModal: ModalView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});

	lockScreenModal: ModalView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});

	_stateUpdate: NodeJS.Timeout;

	constructor() {
		setInterval(() => {
	  	this.time = new Date();
		}, 1000);

		this._stateUpdate = setTimeout(() => {
			this.msAlive = false;
    	console.error("No state update received from Miniserver") 
  	}, 1000);

		this.notificationsMap = Utils.deserialize(localStorage.getItem('notifications'));

		if ($effect.tracking()) { // TODO check coreect use of method, see https://webjose.hashnode.dev/svelte-reactivity-lets-talk-about-effects
			$effect(() => {
				this.updateNotificationStorage();
			});
		} else {
			console.log('Not tracking.');
		}
  }

	updateNotificationStorage() {
		if (this.notifications) {
			this.notificationsMap = Utils.deserialize(localStorage.getItem('notifications'));
			this.notificationsMap[this.notifications.uid] = this.notifications;
 	  	console.log('add item to notificationMap', this.notifications.uid, this.notificationsMap);
			localStorage.setItem('notifications', Utils.serialize(this.notificationsMap));
		}
	}

	setNav(route: Route) {
		this.nav = route;
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

	getMessages() {
		return this.controlState.get('systemStatus');
	}

	getSystemCode() { // 0=no status (disconnected), 1=info, 2=warning, 3=error
		let status = this.controlState.get('systemStatus') as SystemStatus;
		if (status && status.entries) {
			return  this.msAlive ? Math.max(...status.entries.filter( item => item.isHistoric == false).map( item => item.severity)) : 0;
		}
		return 0;
	}

	getState(uuid: string) {
		return this.controlState.get(uuid);
	}

	setState(key: string, data: any) {
		//console.log('setState', key, data);
		let item = $state(data);
		this.controlState.set(key, item);
		clearTimeout(this._stateUpdate);
		this.msAlive = true;
	}

	setInitialStates(data: any) {
		Object.keys(data).forEach( (key) => {
			let item = $state(data[key]);
			let obj = Utils.isValidJSONObject(item) ? JSON.parse(item) : item;
			this.controlState.set(key, obj);
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

	setMqttStatus(s: number) {
		this.mqttStatus = s;
	}

	resetLockScreenModalTimeout() {
		this.lockScreenModal.state = false; 
		clearTimeout(this.lockScreenModal.timeout); 
		this.setLockScreenModalTimeout();
	}

	resetWeatherModalTimeout() {
		this.weatherModal.state = false; 
		clearTimeout(this.weatherModal.timeout); 
		this.setWeatherModalTimeout();
	}

	setWeatherModalTimeout() {
		this.weatherModal.timeout = setTimeout(() => {
			this.weatherModal.state = false;
		}, 30000); // 30s TODO add to configuration
	}

	setLockScreenModalTimeout() {
		this.lockScreenModal.timeout = setTimeout(() => {
			this.lockScreenModal.state = true;
		}, 60000); // 60s TODO add to configuration
	}
}

export const store = new Store();
