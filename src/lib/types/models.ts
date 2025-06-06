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
	msInfo: { [key: string]: MsInfo };
	globalStates: { [key: string]: GlobalStates };
	operatingModes: { [key: string]: String };
	rooms: { [key: string]: Room };
	cats: { [key: string]: Category };
	modes: { [key: string]: Mode };
	controls: { [key: string]: Control };
	weatherServer: WeatherServer;
	times: { [key: string]: Time };
	caller: { [key: string]: Caller };
	mailer: { [key: string]: Mailer };
	autopilot: { [key: string]: Autopilot };
	messageCenter: { [key: string]: MessageCenter };
}

export const INITIAL_STRUCTURE: Structure = {
	lastModified: '',
	msInfo: {},
	globalStates: {},
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
	messageCenter: {}
}

export type MsInfo = {
	serialNr: string;							// serial number of the Miniserver
	msName: string;								// name of the Miniserver
	projectName?: string;					// project name as defined in Loxone Config
	localUrl?: string;						// local IP address and port
	remoteUrl?: string;						// internet IP address and port
	hostname?: string;						// miniserver hostname (when using DHCP)
	tempUnit?: number;						// temperature unit: 0 = C, 1 = F
	currency?: string;						// currency symbol
	squareMeasure?: string;				// unit of area
	location?: string;						// location of the Miniserver
	latitude?: number;						// GPS latitude
	longitude?: number;						// GPS longitude
	altitude?: number;						// GPS altitude
	languageCode?: string;				// language string
	heatPeriodStart?: string;			// month and day when the heating period starts (DEPRECATED)
	heatPeriodEnd?: string;				// month and day when the heating period ends (DEPRECATED)
	coolPeriodStart?: string;			// month and day when the cooling period starts (DEPRECATED)
	coolPeriodEnd?: string;				// month and day when the cooling period ends (DEPRECATED)
	catTitle?: string;						// locale name of categories
	roomTitle?: string;						// locale name of rooms
	miniserverType?: 0,						// miniserver type (0:Gen1, 1:GoGen1, 2:Gen2, 3:GoGen2, 4:Compact)
	deviceMonitor?: string;
	currentUser?: {
		name?: string;							// current user name
		uuid?: string;							// current user uuid
		isAdmin?: boolean;					// is user admin
		changePassword?: boolean;		// can the user change the password
		userRights?: number;
	}
}

export type GlobalStates = {
	operatingMode?: number;				// operating mode number
	sunrise?: number;							// minutes since midnight, using Miniserver location
	sunset?: number;							// minutes since midnight, using Miniserver location
	pastTasks?: string[];
	plannedTasks?: string[];
	notifications?: any;					// notifications
	modifications?: any;					// structural changes made via API published as text events
	favColorSequences?: string[];	// favorite color sequences used in LightControllerV2
	favColors?: string[];					// favorite colors used in LightControllerV2
	miniserverTime?: Date;				// current date, time & UTC-offset of the Miniserver
	liveSearch?: any;							// JSON object with current information about device learning
	userSettings?: any;
	userSettingsTs?: any;
	cloudservice?: any;
	hasInternet?: number;
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
	defaultIcon: string;					// default icon
	restrictions: number;
	details: any;									// control details
	states: any;									// control states
	securedDetails?: any;					// secured details (optional)
	subControls: {
		[key: string]: Control;			// subControls
	}
}

export type Room = {
	uuid: string;									// unique identifier to identify the room as MQTT topic (device-uuid)
	name: string;									// GUI name of the room
	image: string;								// location of the image
	defaultRating: number;				// default rating
	isFavorite: boolean;					// elevate to favorite item
	type: string;									// type of room
	color: string;								// color of room
}

export type Category = {
	uuid: string;									// unique identifier to identify the category
	name: string;									// GUI name of the category
	image: string;								// location of the image
	defaultRating: number;				// default rating
	default: boolean;							//
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
			unit: string;
			format: string;
		}
	}
}

export type Time = {
	[key: string]: {
		id: number;
		name: string;
		analog: boolean;
	}
}

export type Caller = {
	[key: string]: {
		id: string;
		name: string;
		phoneNumber: string;
	}
}

export type Mailer = {
	[key: string]: {
		id: string;
		name: string;
		eMailAddress: string;
	}
}

export type Autopilot = {
	[key: string]: {
		name: string;
		uuidAction: string;
		states: any;
	}
}

export type MessageCenter = {
	[key: string]: {
		name: string;
		uuidAction: string;
		states: any;
	}
}

export type SingleButtonView = {
	name?: string;
	iconName?: string;
	type: string;
	state?: boolean;
	click?: any;
	mousedown?: any;
	mouseup?: any;
}

export type ListItem = {
  id: number;
  name: string;
  value?: number[];
  show?: boolean;
}

export type SliderBar = {
  min: number;
  max: number;
  step: number;
	position: number;
}

export type ControlView = {
	control?: Control,
	iconName: string;
	iconColor?: string;
	textName: string;
	textColor?: string;
	statusName?: string;
	statusColor?: string;
	buttonState?: boolean;
	buttons: SingleButtonView[];
	slider?: SliderBar;
	list?: ListItem[];
	securedDetails?: any;
	details?: any;
	modal: ModalView;
}

export type ModalView = {
	action: any,
	state?: boolean;
	buttons?: SingleButtonView[];
	details?:any;
}

export const DEFAULT_CONTROLVIEW: ControlView = {
	iconName: '',
	iconColor: 'fill-white',
	textName: '',
	textColor: 'text-white',
	statusName: '',
	statusColor: 'text-white',
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

export type MoodList = {
	name: string;
	id: number;
	static: boolean;
	used?: number;
}

export type Route = {
	label: string;
	href: string;
	icon: typeof IconType;
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
}

export const DEFAULT_CONTROLOPTIONS: ControlOptions = {
	isSubControl: false,
	action: undefined,
	showControl: true,
  showModal: false
}

export const DEFAULT_CONTROL = {
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
	subControls: {}
}