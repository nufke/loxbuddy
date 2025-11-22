import { NO_LOGIN } from '$lib/types/models';
import type { Route, DialogView, LoginCredentials, Icon } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { MenuIcon } from '@lucide/svelte';

/**
 * App store to maintain App state
 */
class LbAppStore {
	appId: string = $state('');
	nav: Route = $state({ label: 'Menu', href: '', icon: MenuIcon, root: true });
	time: Date = $state(new Date());
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	msAlive: boolean = $state(false);
	showStatus: boolean = $state(true);
	startPage: string = $state('/');
	locale: string = $state('en'); // default English
	loginCredentials: LoginCredentials = $state(NO_LOGIN);
	dnd = $state({isEnabled: false, duration: 300}); // TODO make configurable via menu
	iconList: Icon[] | undefined = $state();

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

		this.showStatus = localStorage.getItem('showStatus') == '1' ? true : false;
	}

	setNav(route: Route) {
		this.nav = route;
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

export const appStore = new LbAppStore();
