import { SvelteMap } from 'svelte/reactivity';
import { INITIAL_STRUCTURE, DEFAULT_USERSETTINGS, NO_LOGIN, EMPTY_SYSTEM_STATUS } from '$lib/types/models';
import type { Structure, Control, Category, Room, SystemStatus, Route, DialogView, NotificationMap, NotificationList, Icon,
							ControlsMap, CategoriesMap, RoomsMap, MessageCenter, NotificationMessage, UserSettings, LoginCredentials } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { loxiconsPath } from '$lib/helpers/paths';
import { MenuIcon } from '@lucide/svelte';

/**
 * App store to maintain state
 */
class Store {
	appId: string = $state('');
	controlState: SvelteMap<string, any> = new SvelteMap();
	nav: Route = $state({ label: 'Menu', href: '/menu', icon: MenuIcon });
	structure: Structure = $state(INITIAL_STRUCTURE);
	controls: ControlsMap = $derived(this.structure.controls);
	rooms: RoomsMap = $derived(this.structure.rooms);
	categories: CategoriesMap = $derived(this.structure.cats);
	messageCenterList: MessageCenter[] = $derived(Object.values(this.structure.messageCenter));
	controlList: Control[] = $derived(Object.values(this.structure.controls));
	categoryList: Category[] = $derived(Object.values(this.structure.cats));
	roomList: Room[] = $derived(Object.values(this.structure.rooms));
	time: Date = $state(new Date());
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	msAlive: boolean = $state(false);
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.structure.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications));
	showStatus: boolean = $state(true);
	startPage: string = $state('/');
	locale: string = $state('en'); // default English
	loginCredentials: LoginCredentials = $state(NO_LOGIN);
	userSettings: UserSettings = $state(DEFAULT_USERSETTINGS);
	systemStatus: SystemStatus = $state(EMPTY_SYSTEM_STATUS);
	msStatus: number = $derived(this.systemStatus.entries ? Math.max(...this.systemStatus.entries.filter( item => item.isHistoric == false).map( item => item.severity)) : 0);
	iconList: Icon[] | undefined = $state();
	dnd = $state({isEnabled: false, duration: 300}); // TODO make configurable via menu

	weatherDialog: DialogView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});

	lockScreenDialog: DialogView = $state({
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

		this.appId = localStorage.getItem('appId') || utils.generateUuid();
		localStorage.setItem('appId', this.appId);

		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) || {};
		this.showStatus = localStorage.getItem('showStatus') == '1' ? true : false;
	}

	updateCredentials(url: string, cred: string) {
		this.loginCredentials = {
			hostUrl: url,
			credentials: btoa(cred)
		}
	}

	updateNotificationMap(notifications: NotificationMessage | NotificationList, statusOverride: number = 0 ) {
		const map: NotificationMap = utils.deserialize(localStorage.getItem('notifications')) || {};
		const msg = notifications as NotificationMessage;
		if (msg && msg.uid) {
			map[msg.uid] = {
				status: statusOverride || (map[msg.uid].status || 1),
				message: msg
			};
			localStorage.setItem('notifications', utils.serialize(map));
		}
		const msgList = notifications as NotificationList;
		if (msg && msgList.uids) {
			msgList.uids.forEach( (uid) => console.log('uid:', this.controlState.get(uid))); // TODO check what to do with uids
		}
		return map;
		/*
		*"{\"uids\":[\"1fa23e87-00f0-47cf-ffff504f9410a1fd\",\"1fa24183-01ec-47dd-ffff504f9410a1fd\"],\"type\":\u000b}"*
		*/
	}

	setNav(route: Route) {
		this.nav = route;
	}

	initStructure(data: Structure) {
		Object.assign(this.structure, data);
	}

	getState(uuid: string) {
		return this.controlState.get(uuid);
	}

	setState(uuid: string, data: any) {
		//console.log('setState', uuid, data);
		const item = $state(data);
		this.controlState.set(uuid, item);
		clearTimeout(this._stateUpdate);
		this.msAlive = true;
	}

	setInitialStates(data: any) {
		Object.keys(data).forEach( (key) => {
			const item = $state(data[key]);
			const obj = utils.isValidJSONObject(item) ? JSON.parse(item) : item;
			this.controlState.set(key, obj);
		});
	}

	getIcon(control: Control, isSubControl: boolean | undefined, textState: any = null) {
		if (textState && textState.icon) return loxiconsPath + textState.icon; /* used for TextState icon */
		if (control.defaultIcon) return loxiconsPath + control.defaultIcon;
		if (!isSubControl) { 
			const icon = lbControl.getDefaultIcon(control.type);
			if (icon.length ) {
				return icon;
			} 
			const cat = this.categoryList.find((cat: Category) => cat.uuid == control.cat);
			return cat ? loxiconsPath + cat.image : '';
		}
		return ''; // no icon found / used (TODO: keep empty?)
	}

	setMqttStatus(s: number) {
		this.mqttStatus = s;
	}

	resetLockScreenDialogTimeout() {
		this.lockScreenDialog.state = false; 
		clearTimeout(this.lockScreenDialog.timeout); 
		this.setLockScreenDialogTimeout();
	}

	resetWeatherDialogTimeout() {
		this.weatherDialog.state = false; 
		clearTimeout(this.weatherDialog.timeout); 
		this.setWeatherDialogTimeout();
	}

	setWeatherDialogTimeout() {
		this.weatherDialog.timeout = setTimeout(() => {
			this.weatherDialog.state = false;
		}, 30000); // 30s TODO add to configuration
	}

	setLockScreenDialogTimeout() {
		this.lockScreenDialog.timeout = setTimeout(() => {
			this.lockScreenDialog.state = true;
		}, 60000); // 60s TODO add to configuration
	}
}

export const store = new Store();
