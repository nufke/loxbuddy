import { SvelteMap } from 'svelte/reactivity';
import { MqttClient } from '$lib/communication/MqttClient';
import { DEFAULT_USERSETTINGS, EMPTY_SYSTEM_STATUS, DEFAULT_GLOBALSTATES, DEFAULT_MSINFO, EMPTY_ICON_AND_COLOR } from '$lib/types/models';
import type { Structure, MsInfo, Control, Category, Room, NotificationMap, NotificationList, UserSettings, UserDefaultStructure, IconAndColor, SystemStatus,
							GlobalStates, MessageCenter, NotificationMessage, Icon } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { Demo, demo } from '$lib/demo/Demo';
import { MiniserverClient} from '$lib/communication/MiniserverClient';

/**
 * ControlStore to maintain control states
 */
class LbControlStore {
	controlState: SvelteMap<string, any> = new SvelteMap();
	controlClient: SvelteMap<string, Demo | MiniserverClient | MqttClient> = new SvelteMap();
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
	userSettings = $state(DEFAULT_USERSETTINGS);
	sortingMap: SvelteMap<string, UserDefaultStructure> = new SvelteMap();
	systemStatus: SystemStatus = $state(EMPTY_SYSTEM_STATUS);
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications));
	msStatus: number = $derived(this.systemStatus.entries ? Math.max(...this.systemStatus.entries.filter((item) => item.isHistoric == false).map((item) => item.severity)) : 0);
	iconList: Icon[] | undefined = $state();
	sorting: boolean = $state(false); // sorting and drag-and-drop disabled
	sortingMode: number = $state(0);// default sorting (config based)
	customSorting = $derived(((this.sortingMode == 1) ? this.userSettings.userDefaultStructure : this.sortingMap.get(this.msInfo.serialNr)) ?? {}) as UserDefaultStructure;

	constructor() {
		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) as NotificationMap || {};
		this.sorting = (localStorage.getItem('sorting') == '1'); /* sorting enabled */
		this.sortingMode = Number(localStorage.getItem('sortingMode')) || 0;
		this.sortingMap = utils.deserializeMap(localStorage.getItem('sortingMap'));
	}

	setControl(uuid: string, cmd: string): void {
		const client = this.controlClient.get(uuid);
		client?.control(uuid, cmd);
	}

	updateNotificationMap(notifications: NotificationMessage | NotificationList, statusOverride: number = 0 ): NotificationMap {
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

	initStructure(data: Structure, client: Demo | MiniserverClient | MqttClient ): void {
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
		Object.entries(data.messageCenter).forEach( ([uuid, message]) => {
			const mc = $state(message);
			this.messageCenter.set(uuid, mc);
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

	clearStructure(): void {
		this.msInfo = DEFAULT_MSINFO;
		this.globalStates = DEFAULT_GLOBALSTATES;
		this.operatingModes.clear();
		this.controls.clear();
		this.rooms.clear();
		this.categories.clear();
		this.messageCenter.clear();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getState(uuid: string): any {
		return this.controlState.get(uuid);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setState(uuid: string, data: any): void {
		const item = $state(data);
		this.controlState.set(uuid, item);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setInitialStates(data: any) {
		Object.keys(data).forEach( (key) => {
			const item = $state(data[key]);
			const obj = utils.isValidJSONObject(item) ? JSON.parse(item) : item;
			this.controlState.set(key, obj);
		});
	}

	getIcon(control: Control, isSubControl: boolean | undefined, iconAndColor: IconAndColor = EMPTY_ICON_AND_COLOR): string {
		if (iconAndColor && iconAndColor.icon && iconAndColor.icon.length) return iconAndColor.icon; /* used for TextState icon */
		if (control.defaultIcon) return control.defaultIcon;
		if (!isSubControl) { 
			const icon = lbControl.getDefaultIcon(control.type);
			if (icon.length) {
				return icon;
			} 
			const cat = this.categoryList.find((cat: Category) => cat.uuid == control.cat);
			return (cat && cat.image && cat.image.length) ? cat.image : 'unknown';
		}
		console.error('[LbControlStore] No icon found for ', control.name);
		return ''; // no icon found / used (TODO: keep empty?)
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getFile(uuid: string, url: string): Promise<any> {
		const client = this.controlClient.get(uuid);
		return await client?.getFile(url);
	}

	fetchUrl(uuid: string, url: string): Promise<Response> {
		const client = this.controlClient.get(uuid) || demo;
		return client.fetch(url);
	}

	setSortingMode(mode: number): void {
		this.sortingMode = mode;
		localStorage.setItem('sortingMode', String(mode));
	}

	updateSortingOrder(list: Control[] | Room[] | Category[], key: string): void {
		list.forEach((item, index) => {
			const uuid = (item as Control).uuidAction ?? (item as Room | Category).uuid;
			this.customSorting[uuid] ??= {}; /* create if not exists */
			this.customSorting[uuid][key] = {
				...(this.customSorting[uuid][key] ?? { isFav: true }),
				position: index
			};
		});

		switch (this.sortingMode) {
			case 1: { /* user-defined sorting */
				const client = this.controlClient.get(this.msInfo.serialNr) || demo;
				client.setUserSettings(JSON.stringify({...this.userSettings, userDefaultStructure: this.customSorting}));
				break;
			}
			case 2: { /* app-specific sorting */
				this.sortingMap.set(this.msInfo.serialNr, this.customSorting);
				localStorage.setItem('sortingMap', utils.serialize(Object.fromEntries(this.sortingMap))); /* store sorting in localStorage */
				break;
			}
			default: /* none */
		}
	}

	setUserSettings(settings: UserSettings): void {
		this.userSettings = settings;
		localStorage.setItem('userSettings', utils.serialize(this.userSettings)); /* store user settings in localStorage */

		/* store app-specific sorting if not available */
		const sorting = this.sortingMap.get(this.msInfo.serialNr) || {};
		if ((this.sortingMode == 2) && !Object.keys(sorting).length && this.userSettings.userDefaultStructure) {
			this.sortingMap.set(this.msInfo.serialNr, this.userSettings.userDefaultStructure);
			localStorage.setItem('sortingMap', utils.serialize(Object.fromEntries(this.sortingMap))); /* store sorting in localStorage */
		}
	}

	getUserSettings(): void {
		const client = this.controlClient.get(this.msInfo.serialNr) || demo;
		client.getUserSettings();
	}

	/**
	 * Disconnect client based on the registered Miniserver serial number
	 */
	disconnectClient(): void {
		this.clearStructure();
		const client = this.controlClient.get(this.msInfo.serialNr); // TODO disconnect active client
		client?.disconnect();
	}
}

export const controlStore = new LbControlStore();
