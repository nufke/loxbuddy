import { SvelteMap } from 'svelte/reactivity';
import { MqttClient } from '$lib/communication/MqttClient';
import { DEFAULT_USERSETTINGS, EMPTY_SYSTEM_STATUS, DEFAULT_GLOBALSTATES,
				 DEFAULT_MSINFO, EMPTY_ICON_AND_COLOR } from '$lib/types/models';
import type { Structure, MsInfo, Control, ControlState, Category, Room, NotificationMap,
							NotificationList, UserSettings, UserDefaultStructure, IconAndColor,
							SystemStatus, GlobalStates, MessageCenter, NotificationMessage,
							Icon, StatisticV2, Statistics, StatisticInfo, StatisticInfoType,
							StatisticsEntry, SecuredDetails } from '$lib/types/models';
import { startOfDay, endOfDay, startOfISOWeek, endOfISOWeek, startOfMonth,
				 endOfMonth, startOfYear, endOfYear, getUnixTime } from 'date-fns';
import { utils } from '$lib/helpers/Utils';
import { lbControl } from '$lib/helpers/LbControl';
import { DemoClient, demo } from '$lib/demo/DemoClient';
import { MiniserverClient} from '$lib/communication/MiniserverClient';

/**
 * ControlStore to maintain control states
 */
class LbControlStore {
	categories: SvelteMap<string, Category> = new SvelteMap();
	controlClient: SvelteMap<string, DemoClient | MiniserverClient | MqttClient> = new SvelteMap();
	controls: SvelteMap<string, Control> = new SvelteMap();
	controlState: SvelteMap<string, ControlState> = new SvelteMap();
	messageCenter: SvelteMap<string, MessageCenter> = new SvelteMap();
	operatingModes: SvelteMap<string, string> = new SvelteMap();
	rooms: SvelteMap<string, Room> = new SvelteMap();
	sortingMap: SvelteMap<string, UserDefaultStructure> = new SvelteMap();
	globalStates: GlobalStates = $state(DEFAULT_GLOBALSTATES);
	iconList: Icon[] | undefined = $state();
	msInfo: MsInfo = $state(DEFAULT_MSINFO);
	sorting: boolean = $state(false); // sorting and drag-and-drop disabled
	sortingMode: number = $state(0);// default sorting (config based)
	systemStatus: SystemStatus = $state(EMPTY_SYSTEM_STATUS);
	userSettings = $state(DEFAULT_USERSETTINGS);
	
	categoryList: Category[] = $derived(Array.from(this.categories.values()));
	controlList: Control[] = $derived(Array.from(this.controls.values()));
	customSorting = $derived(((this.sortingMode == 1) ? this.userSettings.userDefaultStructure : this.sortingMap.get(this.msInfo.serialNr)) ?? {}) as UserDefaultStructure;
	messageCenterList: MessageCenter[] = $derived(Object.values(this.messageCenter));
	notifications: NotificationMessage | NotificationList = $derived(this.getState(this.globalStates.notifications));
	notificationsMap: NotificationMap = $derived(this.updateNotificationMap(this.notifications)); /* process incoming notifications */
	notificationsList: NotificationMessage[] = $derived(this.listNotifications(this.notificationsMap)); /* update list of current notifications */
	msStatus: number = $derived(this.systemStatus.entries ? Math.max(...this.systemStatus.entries.filter((item) => item.isHistoric == false).map((item) => item.severity)) : 0);
	roomList: Room[] = $derived(Array.from(this.rooms.values()));

	/** 
	 * Initiatie states for notificationsMap, sorting, sortingMode and sortingMap.
	 */
	constructor() {
		this.notificationsMap = utils.deserialize(localStorage.getItem('notifications')) as NotificationMap || {};
		this.sorting = (localStorage.getItem('sorting') == '1'); /* sorting enabled */
		this.sortingMap = utils.deserializeMap(localStorage.getItem('sortingMap'));
		this.sortingMode = Number(localStorage.getItem('sortingMode')) || 0;
	}

	/**
	 * Send the control command to the Miniserver. THe visualization password
	 * should be given for secure controls.
	 * @param uuid UUID of control
	 * @param cmd command to be sent to Miniserver
	 * @param visuPw (optional) visualization password for secured controls
	 */
	setControl(control: Control, cmd: string, visuPw?: string): void {
		if (control.isSecured && (!visuPw || !visuPw?.length)) return; // secured control, but no password given, so return
		const client = this.controlClient.get(control.uuidAction);
		client?.control(control.uuidAction, cmd, visuPw);
	}

	/**
	 * Update notifications map containing messages and system states.
	 * @param notifications notification message or notification list
	 * @param statusOverride (optional) enable override (default 0)
	 */
	updateNotificationMap(notifications: NotificationMessage | NotificationList, statusOverride: number = 0 ): NotificationMap {
		const map: NotificationMap = utils.deserialize(localStorage.getItem('notifications')) || {};
		const msg = notifications as NotificationMessage;
		map[this.msInfo.serialNr] ??= {};
		if (msg && msg.uid) {
			map[this.msInfo.serialNr][msg.uid] ??= {
				...msg, 
				status: statusOverride || 1
			}
			localStorage.setItem('notifications', utils.serialize(map));
		}
		const msgList = notifications as NotificationList;
		if (msg && msgList.uids) {
			msgList.uids.forEach( (uid) => console.debug('[LbControlStore] uid:', this.controlState.get(uid))); // TODO check what to do with uids
		}
		return map;
	}

	/**
	 * get list of (old) notifications of current Miniserver
	 * Sort messages based on timestamp
	 * @returns time sorted list of notifications
	 */
	listNotifications(map: NotificationMap): NotificationMessage[] {
		return map && map[this.msInfo.serialNr] ? Object.values(map[this.msInfo.serialNr]).sort((a, b) => b.ts - a.ts) : [];
	}

	/**
	 * Parse the Miniserver structure file. For each Miniserver and control we register the clients instance,
	 * such that we can send control states to the associated client.
	 * @param data structure object
	 * @param client any of the available clients (DemoClient, MiniserverClient, MqttClient)
	 */
	initStructure(data: Structure, client: DemoClient | MiniserverClient | MqttClient ): void {
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

	/**
	 * Clean and clear structure.
	 */
	clearStructure(): void {
		this.msInfo = DEFAULT_MSINFO;
		this.globalStates = DEFAULT_GLOBALSTATES;
		this.operatingModes.clear();
		this.controls.clear();
		this.rooms.clear();
		this.categories.clear();
		this.messageCenter.clear();
	}

	/**
	 * Retrieves the control state.
	 * @param uuid UUID of the control
	 * @returns value of the control (note: could be an object)
	 */
	getState(uuid: string): ControlState {
		return this.controlState.get(uuid);
	}

	/**
	 * Sets the control state.
	 * @param uuid UUID of the control
	 * @param data value/data of the control
	 */
	setState(uuid: string, data: ControlState): void {
		const item = $state(data);
		this.controlState.set(uuid, item);
	}

	/**
	 * Set initial states. Used to load all states at once for DemoClient
	 * @param data map containing all states  
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	setInitialStates(data: any) {
		Object.keys(data).forEach( (key) => {
			const item = $state(data[key]);
			const obj = utils.isValidJSONObject(item) ? JSON.parse(item) : item;
			this.controlState.set(key, obj);
		});
	}

	/**
	 * Select the icon for a given control:
	 * - If the control has a state for the IconAndColor, then returns the icon specified by the IconAndColor state.
	 * - If the control has a defaultIcon, return it.
	 * - If the control has no default icon, use the category icon
	 * - If nothing works, returns a empty string (aka no icon)
	 * @param control Control object
	 * @param isSubControl (optional) specify if Control is a subControl
	 * @param iconAndColor object containing the icon and color
	 * @returns name of the icon or empty of no icon is available
	 */
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

	/**
	 * Retrieve file from Miniserver (e.g. camera images of intercom)
	 * @param uuid UUID of the control, to look-up the associated client
	 * @param url url of the hostName
	 * @returns returns the file contents as a FileMessage
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getFile(uuid: string, url: string): Promise<any> {
		const client = this.controlClient.get(uuid);
		return await client?.getFile(url);
	}

	/**
	 * Generic fetch command using Miniserver user credentials
	 * @param uuid UUID of the control, to look-up the associated client
	 * @param url endpoint (e.g., /jdev/sps/io/...)
	*/
	fetchUrl(uuid: string, url: string): Promise<Response> {
		const client = this.controlClient.get(uuid) || demo;
		return client.fetch(url);
	}

	/**
	 * Fetch secured details for intercom
	 * @param control intercom control
	 */
	async fetchSecuredDetails(control: Control): Promise<SecuredDetails> {
		return controlStore.fetchUrl(control.uuidAction, `jdev/sps/io/${control.uuidAction}/securedDetails`)
		.then((resp) => resp.json())
		.then((json) => json as SecuredDetails)
	}

	/**
	 * Fetch statistical information, including when data is active/ valid (activeSince)
	 * @param control The control of which the statistic al info is fetched
	 * @returns Statistic info including when statistics are valid (activeSince)
	*/
	async fetchStatisticInfo(control: Control): Promise<StatisticInfo> {
		const info: StatisticInfo = {};
		await this.fetchUrl(control.uuidAction, `jdev/sps/getStatisticInfo/${control.uuidAction}`)
			.then((resp) => resp.json())
			.then((json) => {
				const obj = json.LL?.value && utils.isValidJSONObject(json.LL.value) ? JSON.parse(json.LL.value) : json;
				if (obj.length) {
					obj.forEach((item: StatisticInfoType) => {
						info[item.id] = { activeSince: item.activeSince };
					});
				}
			});
		return info;
	}

	/**
	 * Fetch statistics of the given control
	 * @param control The control of which the statistics are fetched
	 * @returns Statistics including metadata
	*/
	async fetchStatistics(control: Control, statisticV2: StatisticV2, newDate: Date, selector: string, type: string):
		Promise<Statistics> {
		const statistics: Statistics = {};
		let dataPointUnit = 'hour';
		let fromUnixUtc: number;
		let untilUnixUtc: number;

		switch (selector) {
			case 'Day':   fromUnixUtc = getUnixTime(startOfDay(newDate));   untilUnixUtc = getUnixTime(endOfDay(newDate));   dataPointUnit = 'hour';  break;
			case 'Week':  fromUnixUtc = getUnixTime(startOfISOWeek(newDate)); untilUnixUtc = getUnixTime(endOfISOWeek(newDate)); dataPointUnit = 'day'; break;
			case 'Month': fromUnixUtc = getUnixTime(startOfMonth(newDate)); untilUnixUtc = getUnixTime(endOfMonth(newDate)); dataPointUnit = 'day';  break;
			case 'Year':  fromUnixUtc = getUnixTime(startOfYear(newDate));  untilUnixUtc = getUnixTime(endOfYear(newDate));  dataPointUnit = 'month'; break;
			case 'All':   fromUnixUtc = 1230768000; untilUnixUtc = getUnixTime(new Date()); dataPointUnit = 'year'; break;
			default:      fromUnixUtc = getUnixTime(startOfDay(newDate));   untilUnixUtc = getUnixTime(endOfDay(newDate));   dataPointUnit = 'hour';
		}

		await Promise.all(statisticV2.groups.map(async (item) => {
			const mode = item.accumulated ? 'diff' : 'raw';
			await this.fetchUrl(control.uuidAction, `jdev/sps/getStatistic/${control.uuidAction}/${mode}/${fromUnixUtc}/${untilUnixUtc}/${dataPointUnit}/${item.id}/`)
				.then((r) => r.ok ? r.arrayBuffer() : null)
				.then((buffer) => {
					const stats: StatisticsEntry[] = [];
					if (buffer) {
						const view = new DataView(buffer);
						const size = 4 + item.dataPoints.length * 8;
						for (let i = 0; i < Math.floor(view.byteLength / size); i++) {
							const ts = view.getUint32(i * size, true);
							const values: number[] = [];
							for (let j = 0; j < item.dataPoints.length; j++) {
								values.push(view.getFloat64(i * size + 4 + j * 8, true));
							}
							stats.push({ ts, values: values });
						}
					}
					statistics[item.id] = {
						data: stats,
						title: item.dataPoints[0].title,
						format: item.dataPoints[0].format,
						type: type,
						fromUnixUtc,
						untilUnixUtc,
						total: stats.flatMap((s) => s.values[0]).reduce((a, b) => a + b, 0),
						totalNeg: stats.flatMap((s) => s.values[1]).reduce((a, b) => a + b, 0) || 0, // TODO might not exist
						selector,
						xLabel: dataPointUnit,
					};
				});
		}));
		return statistics;
	}

	/**
	 * Set control sorting
	 * @param mode mode 0=LoxConfig, 1=user-defined, 2=app-specific
	 */
	setSortingMode(mode: number): void {
		this.sortingMode = mode;
		localStorage.setItem('sortingMode', String(mode));
	}

	/**
	 * Update control sorting map
	 * @param list updated list of controls, rooms or categories
	 * @param key key indicating if this is a favorite, room, or category
	 */
	async updateSortingOrder(list: Control[] | Room[] | Category[], key: string): Promise<void> {
		const currentSorting: UserDefaultStructure = $state.snapshot(this.customSorting); /* plain copy, no proxy */
		const newSorting: UserDefaultStructure = { ...currentSorting };
		list.forEach((item, index) => {
			const uuid = (item as Control).uuidAction ?? (item as Room | Category).uuid;
			newSorting[uuid] = {
				...(currentSorting[uuid] ?? {}),
				[key]: { ...(currentSorting[uuid]?.[key] ?? { isFav: true }), position: index }
			};
		});
		switch (this.sortingMode) {
			case 0: break; /* sorting according to Lox Config, skip */
			case 1: { /* user-defined sorting: write back to userSettings so $derived re-evaluates correctly */
				const client = this.controlClient.get(this.msInfo.serialNr) || demo;
				const settings: UserSettings = { ...$state.snapshot(this.userSettings), ts: utils.getLoxTime(true), userDefaultStructure: newSorting };
				await client.setUserSettings(settings);
				this.storeUserSettings(settings);
				break;
			}
			case 2: { /* app-specific sorting: write back to sortingMap so $derived re-evaluates correctly */
				this.sortingMap.set(this.msInfo.serialNr, newSorting);
				localStorage.setItem('sortingMap', utils.serialize(Object.fromEntries(this.sortingMap)));
				break;
			}
			default: /* none */
		}
	}

	/**
	 * Set and store user settings
	 * @param settings userSettings
	 */
	storeUserSettings(settings: UserSettings): void {
		this.userSettings = settings;
		localStorage.setItem('userSettings', utils.serialize(this.userSettings)); /* store user settings in localStorage */

		/* store app-specific sorting if not available */
		const sorting = this.sortingMap.get(this.msInfo.serialNr) || {};
		if ((this.sortingMode == 2) && !Object.keys(sorting).length && this.userSettings.userDefaultStructure) {
			this.sortingMap.set(this.msInfo.serialNr, this.userSettings.userDefaultStructure);
			localStorage.setItem('sortingMap', utils.serialize(Object.fromEntries(this.sortingMap))); /* store sorting in localStorage */
		}
	}

	/**
	 * Retrieve user settings
	 */
	async getUserSettings(): Promise<void> {
		const client = this.controlClient.get(this.msInfo.serialNr) || demo;
		await client.getUserSettings();
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
