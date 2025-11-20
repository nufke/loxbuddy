import { SvelteMap } from 'svelte/reactivity';
import { INITIAL_STRUCTURE } from '$lib/types/models';
import type { Structure, Control, Category, Room, NotificationMap, NotificationList, Icon,
							ControlsMap, CategoriesMap, RoomsMap, MessageCenter, NotificationMessage } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { loxiconsPath } from '$lib/helpers/paths';

/**
 * ControlStore to maintain control states
 */
class LbControlStore {
	controlState: SvelteMap<string, any> = new SvelteMap();
	structure: Structure = $state(INITIAL_STRUCTURE);
	controls: ControlsMap = $derived(this.structure.controls);
	rooms: RoomsMap = $derived(this.structure.rooms);
	categories: CategoriesMap = $derived(this.structure.cats);
	messageCenterList: MessageCenter[] = $derived(Object.values(this.structure.messageCenter));
	controlList: Control[] = $derived(Object.values(this.structure.controls));
	categoryList: Category[] = $derived(Object.values(this.structure.cats));
	roomList: Room[] = $derived(Object.values(this.structure.rooms));
	time: Date = $state(new Date());
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.structure.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications));
	iconList: Icon[] | undefined = $state();

	constructor() {
		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) || {};
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
		//clearTimeout(this._stateUpdate);
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

}

export const controlStore = new LbControlStore();
