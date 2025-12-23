import { SvelteMap } from 'svelte/reactivity';
import { INITIAL_STRUCTURE, DEFAULT_USERSETTINGS, EMPTY_SYSTEM_STATUS } from '$lib/types/models';
import type { Structure, Control, Category, Room, NotificationMap, NotificationList, UserSettings, SystemStatus,
							ControlsMap, CategoriesMap, RoomsMap, MessageCenter, NotificationMessage, Icon } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { loxiconsPath } from '$lib/helpers/paths';

/**
 * ControlStore to maintain control states
 */
class LbControlStore {
	client: SvelteMap<string, any> = new SvelteMap();
	controlState: SvelteMap<string, any> = new SvelteMap();
	controlClient: SvelteMap<string, any> = new SvelteMap();
	structure: Structure = $state(INITIAL_STRUCTURE);
	controls: ControlsMap = $derived(this.structure.controls);
	rooms: RoomsMap = $derived(this.structure.rooms);
	categories: CategoriesMap = $derived(this.structure.cats);
	messageCenterList: MessageCenter[] = $derived(Object.values(this.structure.messageCenter));
	controlList: Control[] = $derived(this.structure.controls ? Object.values(this.structure.controls) : []);
	categoryList: Category[] = $derived(this.structure.cats ? Object.values(this.structure.cats) : []);
	roomList: Room[] = $derived(Object.values(this.structure.rooms));
	userSettings: UserSettings = $state(DEFAULT_USERSETTINGS);
	systemStatus: SystemStatus = $state(EMPTY_SYSTEM_STATUS);
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.structure.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications));
	msStatus: number = $derived(this.systemStatus.entries ? Math.max(...this.systemStatus.entries.filter( item => item.isHistoric == false).map( item => item.severity)) : 0);
	iconList: Icon[] | undefined = $state();

	constructor() {
		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) || {};
	}

	setControl(uuid: string, cmd: string) {
		const client = this.controlClient.get(uuid);
		client.control(uuid, cmd);
	}

	updateNotificationMap(notifications: NotificationMessage | NotificationList, statusOverride: number = 0 ) {
		const map: NotificationMap = utils.deserialize(localStorage.getItem('notifications')) || {};
		const msg = notifications as NotificationMessage;
		if (msg && msg.uid) {
			map[msg.uid] = {
				status: statusOverride || (map[msg.uid] ? map[msg.uid].status : 1),
				message: msg
			};
			localStorage.setItem('notifications', utils.serialize(map));
		}
		const msgList = notifications as NotificationList;
		if (msg && msgList.uids) {
			msgList.uids.forEach( (uid) => console.log('uid:', this.controlState.get(uid))); // TODO check what to do with uids
		}
		return map;
	}

	initStructure(data: Structure, client: any) {
		Object.assign(this.structure, data);
		// Mapping table to associate control UUIDs for each backend
		Object.values(this.structure.controls).forEach( (control) => {
			this.controlClient.set(control.uuidAction, client);
		});
		// Add message center to mapping table
		const messageCenter = Object.values(this.structure.messageCenter);
		this.controlClient.set(messageCenter[0].uuidAction, client);
	}

	getState(uuid: string) {
		return this.controlState.get(uuid);
	}

	setState(uuid: string, data: any) {
		const item = $state(data);
		this.controlState.set(uuid, item);
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

	async getFile(uuid: string, url: string) {
		const client = this.controlClient.get(uuid);
		return await client.getFile(url);
	}

	async fetchUrl(uuid: string, url: string) {
		const client = this.controlClient.get(uuid);
		return await client.fetch(url);
	}

}

export const controlStore = new LbControlStore();
