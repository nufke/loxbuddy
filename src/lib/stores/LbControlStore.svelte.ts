import { SvelteMap } from 'svelte/reactivity';
import { MqttClient } from '$lib/communication/MqttClient';
import { DEFAULT_USERSETTINGS, EMPTY_SYSTEM_STATUS, DEFAULT_GLOBALSTATES, DEFAULT_MSINFO } from '$lib/types/models';
import type { Structure, MsInfo, Control, Category, Room, NotificationMap, NotificationList, UserSettings, SystemStatus,
							GlobalStates, MessageCenter, NotificationMessage, Icon } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { Demo } from '$lib/demo/Demo';
import { LoxWsClient} from '$lib/communication/LoxWsClient';

/**
 * ControlStore to maintain control states
 */
class LbControlStore {
	controlState: SvelteMap<string, any> = new SvelteMap();
	controlClient: SvelteMap<string, Demo | LoxWsClient | MqttClient> = new SvelteMap();
	msInfo: MsInfo = $state(DEFAULT_MSINFO);
	globalStates: GlobalStates = $state(DEFAULT_GLOBALSTATES);
	operatingModes: SvelteMap<string, string> = new SvelteMap();
	controls: SvelteMap<string, Control> = new SvelteMap();
	rooms: SvelteMap<string, Room> = new SvelteMap();
	categories: SvelteMap<string, Category> = new SvelteMap();
	messageCenter: SvelteMap<string, MessageCenter> = new SvelteMap();
	messageCenterList: MessageCenter[] = $derived(Array.from(this.messageCenter.values()));
	controlList: Control[] = $derived(Array.from(this.controls.values()));
	categoryList: Category[] = $derived(Array.from(this.categories.values()));
	roomList: Room[] = $derived(Array.from(this.rooms.values()));
	userSettings: UserSettings = $state(DEFAULT_USERSETTINGS);
	systemStatus: SystemStatus = $state(EMPTY_SYSTEM_STATUS);
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications));
	msStatus: number = $derived(this.systemStatus.entries ? Math.max(...this.systemStatus.entries.filter( item => item.isHistoric == false).map( item => item.severity)) : 0);
	iconList: Icon[] | undefined = $state();

	constructor() {
		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) || {};
	}

	setControl(uuid: string, cmd: string) {
		const client = this.controlClient.get(uuid);
		client?.control(uuid, cmd);
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
			msgList.uids.forEach( (uid) => console.debug('[LbControlStore] uid:', this.controlState.get(uid))); // TODO check what to do with uids
		}
		return map;
	}

	initStructure(data: Structure, client: Demo | LoxWsClient | MqttClient ) {
		// Store reference to client using device serial nr 
		this.controlClient.set(data.msInfo.serialNr, client);
		// fill maps
		if (data.msInfo) {
			Object.assign(this.msInfo, data.msInfo);
		}
		if (data.globalStates) {
			Object.assign(this.globalStates, data.globalStates);
		}
		Object.entries(data.controls).forEach( ([uuid, control]) => {
			const c = $state(control);
			this.controls.set(uuid, c);
		});
		Object.entries(data.rooms).forEach( ([uuid, room]) => {
			const r = $state(room);
			this.rooms.set(uuid, r);
		});
		Object.entries(data.cats).forEach( ([uuid, cat]) => {
			const c = $state(cat);
			this.categories.set(uuid, c);
		});
		Object.entries(data.operatingModes).forEach( ([mode, val]) => {
			const v = $state(val);
			this.operatingModes.set(mode, v);
		});
		// Mapping table to associate control UUIDs for each backend client
		Object.values(data.controls).forEach( (control) => {
			this.controlClient.set(control.uuidAction, client);
			// also register backend client for each subcontrol
			const subControls: Control[] = control.subControls ? Object.values(control.subControls) : [];
			if (subControls.length) {
				subControls.forEach( (subControl) => {
					this.controlClient.set(subControl.uuidAction, client);
				});
			}
		});
		// Add message center to mapping table
		const messageCenter = Object.values(data.messageCenter);
		this.controlClient.set(messageCenter[0].uuidAction, client);
	}

	clearStructure() {
		// TODO
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
		if (textState && textState.icon) return textState.icon; /* used for TextState icon */
		if (control.defaultIcon) return control.defaultIcon;
		if (!isSubControl) { 
			const icon = lbControl.getDefaultIcon(control.type);
			if (icon.length ) {
				return icon;
			} 
			const cat = this.categoryList.find((cat: Category) => cat.uuid == control.cat);
			return cat ? cat.image : '';
		}
		console.error('[LbControlStore] No icon found for ', control.name);
		return ''; // no icon found / used (TODO: keep empty?)
	}

	async getFile(uuid: string, url: string) {
		const client = this.controlClient.get(uuid);
		return await client?.getFile(url);
	}

	async fetchUrl(uuid: string, url: string) {
		const client = this.controlClient.get(uuid);
		return await client?.fetch(url);
	}

	/* disconnect client based on the registered Miniserver serial number */
	disconnectClient() {
		const client = this.controlClient.get(this.msInfo.serialNr);
		client?.disconnect();
	}
}

export const controlStore = new LbControlStore();
