import { type Icon as IconType } from '@lucide/svelte';

export type MQTTStatus = {
	enabled: boolean;
	connected: boolean;
	client_id: string;
	last_error: string;
};

export type MQTTSettings = {
	enabled: boolean;
	uri: string;
	username: string;
	password: string;
	client_id: string;
	keep_alive: number;
	clean_session: boolean;
};

export type Structure = {
	lastModified: string;
	msInfo: MsInfo;
	partnerInfo: PartnerInfo;
	globalStates: GlobalStates;
	operatingModes: OperatingModesMap;
	rooms: RoomsMap;
	cats: CategoriesMap;
	modes: ModesMap;
	controls: ControlsMap;
	weatherServer?: WeatherServer;
	times: TimesMap;
	caller: CallerMap;
	mailer: MailerMap;
	autopilot: AutopilotMap;
	messageCenter: MessageCenterMap;
	mediaServer: MediaServerMap;
	structureDate: string;
}

export type PartnerInfo = {
	name: string;
	image: string;
	details: {
		phoneNumber: string;
		eMailAddress: string;
		website: string;
	}
}

export type ControlsMap = {
	[key: string]: Control;
}

export type CategoriesMap = {
	[key: string]: Category;
}

export type OperatingModesMap = {
	[key: string]: string;
}

export type RoomsMap = {
	[key: string]: Room;
}

export type ModesMap = {
	[key: string]: Mode;
}

export type TimesMap = {
	[key: string]: Time;
}

export type CallerMap = {
	[key: string]: Caller;
}

export type MailerMap = {
	[key: string]: Mailer;
}

export type AutopilotMap = {
	[key: string]: Autopilot;
}

export type MessageCenterMap = {
	[key: string]: MessageCenter;
}

export type MediaServerMap = {
	[key: string]: MediaServer;
}

export type GlobalStates = {
	operatingMode: string;				// uuid for operating mode (number)
	sunrise: string;							// uuid for minutes since midnight, using Miniserver location (number)
	sunset: string;								// uuid for minutes since midnight, using Miniserver location (number)
	pastTasks: string;						// uuid for past tasks (string[])
	plannedTasks: string;					// uuid for planned tasks (string[]);
	notifications: string;				// uuid for notifications
	modifications: string;				// uuid for structural changes made via API published as text events
	favColorSequences: string;		// uuid for favorite color sequences used in LightControllerV2 (string[])
	favColors: string; 						// uuid  for favorite colors used in LightControllerV2 (string[] )
	miniserverTime: string; 			// current date, time & UTC-offset of the Miniserver (Date)
	liveSearch: string;						// uuid for JSON object with current information about device learning
	userSettings: string;					// uuid
	userSettingsTs: string;				// uuid
	cloudservice: string;					// uuid
	hasInternet: string;					// uuid to check internet (number)
}

export type MsInfo = {
	serialNr: string;							// serial number of the Miniserver
	msName: string;								// name of the Miniserver
	projectName: string;					// project name as defined in Loxone Config
	localUrl: string;							// local IP address and port
	remoteUrl: string;						// internet IP address and port
	hostname: string;							// miniserver hostname (when using DHCP)
	tempUnit: number;							// temperature unit: 0 = C, 1 = F
	currency: string;							// currency symbol
	squareMeasure: string;				// unit of area
	location: string;							// location of the Miniserver
	latitude: number;							// GPS latitude
	longitude: number;						// GPS longitude
	altitude: number;							// GPS altitude
	languageCode: string;					// language string
	heatPeriodStart: string;			// month and day when the heating period starts (DEPRECATED)
	heatPeriodEnd: string;				// month and day when the heating period ends (DEPRECATED)
	coolPeriodStart: string;			// month and day when the cooling period starts (DEPRECATED)
	coolPeriodEnd: string;				// month and day when the cooling period ends (DEPRECATED)
	catTitle: string;							// locale name of categories
	roomTitle: string;						// locale name of rooms
	miniserverType: number;				// miniserver type (0:Gen1, 1:GoGen1, 2:Gen2, 3:GoGen2, 4:Compact)
	deviceMonitor: string;
	currentUser: {
		name: string;								// current user name
		uuid: string;								// current user uuid
		isAdmin: boolean;						// is user admin
		changePassword: boolean;		// can the user change the password
		userRights: number;
	}
}

export const DEFAULT_MSINFO: MsInfo = {
	serialNr: '',
	msName: '',
	projectName: '',
	localUrl: '',
	remoteUrl: '',
	hostname: '',
	tempUnit: 0,
	currency: '',
	squareMeasure: '',
	location: '',
	latitude: 0,
	longitude: 0,
	altitude: 0,
	languageCode: '',
	heatPeriodStart: '',
	heatPeriodEnd: '',
	coolPeriodStart: '',
	coolPeriodEnd: '',
	catTitle: '',
	roomTitle: '',
	miniserverType: 0,
	deviceMonitor: '',
	currentUser: {
		name: '',
		uuid: '',
		isAdmin: true,
		changePassword: true,
		userRights: 0
	}
}

export const DEFAULT_GLOBALSTATES: GlobalStates = {
	operatingMode: '',
	sunrise: '',
	sunset: '',
	pastTasks: '',
	plannedTasks: '',
	notifications: '',
	modifications: '',
	favColorSequences: '',
	favColors: '',
	miniserverTime: '',
	liveSearch: '',
	userSettings: '',
	userSettingsTs: '',
	cloudservice: '',
	hasInternet: '',
}

export const INITIAL_STRUCTURE: Structure = {
	lastModified: '',
	msInfo: DEFAULT_MSINFO,
	globalStates: DEFAULT_GLOBALSTATES,
	partnerInfo: {
		name: '',
		image: '',
		details: {
			phoneNumber: '',
			eMailAddress: '',
			website: '',
		}
	},
	operatingModes: {},
	rooms: {},
	cats: {},
	modes: {},
	controls: {},
	weatherServer: {
		states: {
			actual: '',
			forecast: ''
		},
		format: {
			relativeHumidity: '%.0f%%',
			temperature: '%.1f°',
			windSpeed: '%.0fkm/h',
			precipitation: '%.1fl/m²/h',
			barometricPressure: '%.0fhPa'
		},
		weatherTypeTexts: {},
		weatherFieldTypes: {}
	},
	times: {},
	caller: {},
	mailer: {},
	autopilot: {},
	messageCenter: {},
	mediaServer: {},
	structureDate: ''
}

export type Control = {
	name: string;									// GUI name of the control
	type: string;									// type of control, e.g., switch, button, slider, etc.
	uuidAction: string;						// unique identifier to identify the control action (same as uuid)
	room: string;									// uuid of room (serialNr of room should match serialNr of control)
	cat: string;									// uuid of category (serialNr of category should match serialNr of control)
	defaultRating: number;				// default rating
	isFavorite: boolean;					// elevate to favorite item
	isSecured: boolean;						// passwd/PIN protected control
	defaultIcon?: string | null;	// default icon
	restrictions: number;
	details?: any;								// control details
	states?: any;									// control states
	preset?: any;									// control presets
	links?: string[];							// UUID links for TextState control
	securedDetails?: SecuredDetails; // secured details (optional)
	subControls: {
		[key: string]: Control;			// subControls
	}
}

export const DEFAULT_CONTROL: Control = {
	name: '',
	type: '',
	uuidAction: '',
	room: '',
	cat: '',
	defaultRating: 0,
	isFavorite: false,
	isSecured: false,
	defaultIcon: '',
	restrictions: 0,
	details: {},
	states: {},
	subControls: {},
}

export type Room = {
	uuid: string;									// unique identifier to identify the room as MQTT topic (device-uuid)
	name: string;									// GUI name of the room
	image: string;								// location of the image
	defaultRating: number;				// default rating
	default?: boolean;						//
	isFavorite: boolean;					// elevate to favorite item
	type: number;									// type of room
	color: string;								// color of room
}

export type Category = {
	uuid: string;									// unique identifier to identify the category
	name: string;									// GUI name of the category
	image: string;								// location of the image
	defaultRating: number;				// default rating
	default?: boolean;						//
	type: string;									// type of category
	color: string;								// color of category
}

export type Mode = {
	id: number,
	name: string;
}

export type WeatherServer = {
	states: {
		actual: string;
		forecast: string;
	}
	format: {
		relativeHumidity: string;
		temperature: string;
		windSpeed: string;
		precipitation: string;
		barometricPressure: string;
	}
	weatherTypeTexts: {
		[key: string]: string;
	}
	weatherFieldTypes: {
		[key: string]: {
			id: number;
			name: string;
			analog: boolean
			unit?: string;
			format?: string;
		}
	}
}

export type Time = {
	id: number;
	name: string;
	analog: boolean;
}

export type Caller = {
	id: string;
	name: string;
	phoneNumber: string;
}

export type Mailer = {
	id: string;
	name: string;
	eMailAddress: string;
}

export type Autopilot = {
	name: string;
	uuidAction: string;
	states: {
		 changed: string;
		 history: string;
	}
}

export type MessageCenter = {
	name: string;
	uuidAction: string;
	states: {
		 changed: string;
	}
}

export type MediaServer = {
	type: number;
	subType: number;
	host: string;
	mac: string;
	uuidAction: string;
	useTriggerCard: boolean;
	internal: boolean;
	states: {
		audioEvents: string;
		apiVersion: string;
		serverState: string;
		grouping: string;
		connState: string;
		certificateValid: string;
		host: string;
	}
}

export type SystemStatus = {
	isLimitedUser: boolean;
	entries: SystemStatusEntry[];
	activeEntryUuid: string | null;
	controlUUID: string;
}

export type SystemStatusEntry = {
	entryUuid: string;
	eventId: number;
	sourceUuid: string;
	affectedUuids: string[];
	severity: number;
	affectedName: string;
	title: string;
	roomUuid: string;
	installationPlace: string | null;
	isHistoric: boolean;
	setHistoricAt: number; // epoch time
	confirmedAt: string | null; // TODO check
	timestamps: number[]; // epoch time
	readAt: number; // epoch
	isVisuLocked: boolean;
	actions: any[];
	desc: string;
	helpLink: string | null; // TODO check
}

export type NotificationMessage = {
  uid: string;						// unique message id
  ts: number;							// unix timestamp in seconds
	sound: number;					// sound
  title: string;					// title
  message: string;				// message, could be value, e.g. "1"
  type: number;						// 10 = normal message, 11 = message summary
	data: {
  	mac: string;					// mac or serial ID of miniserver
  	lvl: number;					// level: 1 = Info, 2 = Error, 3 = SystemError, 0 = undefined
  	uuid: string;					// UUID of Control (or empty)
	}
}

export type NotificationList = {
 uids: string[];					// list of messages
 type: number;
}

export type NotificationMap = {
	[key: string]: {				// uid of message
		status: number;				// status of message: 1=new, 2=unread, 3=archived, 4=deleted
		message: NotificationMessage;
	}
}

export type SingleButtonView = {
	name?: string;
	iconName?: string;
	iconColor?: string;
	class?: string;
	type: string;
	state?: boolean;
	click?: any;
	mousedown?: any;
	mouseup?: any;
}

export type ListItem = {
  id: number;
  name: string;
  value?: number;
	isAbsolute?: boolean; // used for temperatures
	correctionHeating?: number; // correction heating period 
	correctionCooling?: number; // correction cooling period
  visible?: boolean;
}

export type SliderBar = {
  min: number;
  max: number;
  step: number;
	position: number;
	orientation?: string;
	locked?: boolean;
}

export type ControlView = {
	control: Control;
	isSubControl?: boolean;
	showControl?: boolean;
	isFavorite?: boolean;
	iconName: string;
	iconText?: string;
	iconColor?: string;
	badgeIconName?: string;
	badgeIconColor?: string;
	textName: string;
	textColor?: string;
	statusName: string;
	statusColor: string;
	buttonState?: boolean;
	buttons: SingleButtonView[];
	slider?: SliderBar;
	list?: ListItem[];
	links?: string[];
	details?: any;
	modal: ModalView;
}

export type ModalView = {
	action: any,
	state?: boolean;
	class?: string;
	buttons?: SingleButtonView[];
	disableIcon?: boolean;
	details?: any;
	timeout?: any;			// timeout for screensaver
	noBlur?: boolean;
	size?: {
		width?: string;		// tailwindcss notation
		height?: string;	// tailwindcss notation
	}
}

export const DEFAULT_CONTROLVIEW: ControlView = {
	control: DEFAULT_CONTROL,
	isSubControl: false,
	showControl: true,
	isFavorite: false,
	iconName: '',
	iconColor: 'dark:fill-surface-50 fill-surface-950',
	textName: '',
	iconText: '',
	textColor: 'dark:text-surface-50 text-surface-950',
	statusName: '',
	statusColor: 'dark:text-surface-300 text-surface-700',
	buttons: [],
	modal: {
		action: () => {} // no default action
	}
}

export type LightItem = {
	id: number;
	uuid: string;
	selected?: boolean;
}

export type ScreenItem = {
	id: number;
	uuid: string;
	selected?: boolean;
}

export type MoodList = {
	name: string;
	id: number;
	static?: boolean;
	used?: number;
}

export type Route = {
	label: string;
	href: string;
	icon: typeof IconType;
	badge?: boolean;
};

export type ColorType = { 
	rgb: { 
		r: number; 
		g: number; 
		b: number;
	}
	kelvin: number;
}

export type ControlOptions = {
	isSubControl: boolean;
	action?: any;
	showControl?: boolean;
  showModal?: boolean;
	isFavorite?: boolean;
	isLink?: boolean;
}

export const DEFAULT_CONTROLOPTIONS: ControlOptions = {
	isSubControl: false,
	action: undefined,
	showControl: true,
  showModal: false,
	isFavorite: false,
	isLink: false
}

export type Entry = {
	mode: string;
	from: string;
	to: string;
	needActivate: string;
	value: string;
	latest?: boolean;
}

export type EntriesAndDefaultValue = {
	defValue: string;
	entries: string;
	entry: Entry[];
	uuid: string;
}

export type WeekDays = {
	[key: string]: string;
};

export type AlarmClockEntry = {
	name: string;
	isActive: boolean;
	alarmTime: number;	// seconds counted from midmight (0:00)
	nightLight?: boolean;
	daily?: boolean;		// daily or once, nighlight only
	modes?: number[];		// days based on operating modes, non-nighlight only
}

export type AlarmClockEntries = {
	[key: string]: AlarmClockEntry
}

export type WindowListItem = {
	name: string;
	installPlace: string;
	uuid: string;
	room: string;
	roomName: string;
	state: number;
	prio: number;
}

export type Button = {
	id: number;
	name: string;
	selected: boolean;
}

export type GeneralView = {
	title: string;
	openModal: boolean
	buttons: Button[];
	cancel: any;
	ok: any;
}

export type CalendarView = {
	control: Control;
	subControl?: Control;
	isIRC: boolean;
	isIRCV1: boolean;
	isCooling: boolean;
	openModal: boolean;
}

export type CalendarEntryView = {
	control: Control;
	subControl: Control;
	isIRC: boolean;
	isCooling: boolean;
	label: string;
	enableDelete: boolean;
	openModal: boolean;
}

export type SecuredDetails = {
	LL: {
		control: string;
		value: string; // "
    Code: string;
	}
}

export type SecuredDetailsValue = {
	videoInfo: {
		alertImage: string;
		streamUrl: string;
		deviceUuid: string;
		user: string;
		pass: string;
	},
	audioInfo: {
		host: string;
		user: string;
	}
}
