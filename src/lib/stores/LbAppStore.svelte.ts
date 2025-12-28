import type { DialogView, Credentials } from '$lib/types/models';
import { NO_CREDENTIALS } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import { nl, enGB, de } from 'date-fns/locale'
import { locale } from 'svelte-i18n';
import { setDefaultOptions } from 'date-fns'
import { type DateFnsLocale } from '$lib/types/models';

/**
 * AppStore to maintain App state
 */
class LbAppStore {
	appId: string = $state('');
	isDemo: boolean = $state(false);
	token: string | undefined = $state();
	nav: string = $state(''); // default is main menu (hamburger symbol)
	date: Date = $state(new Date());
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	loxStatus: number = $state(0);  // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	showStatus: boolean = $state(true);
	showWeather: boolean = $state(true);
	startPage: string = $state('/');
	locale: string = $state('en'); // default English
	credentials: Credentials = $state(NO_CREDENTIALS);
	dnd = $state({isEnabled: false, duration: 300});

	weatherDialog: DialogView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});

	loginDialog: DialogView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});
	
	lockScreenDialog: DialogView = $state({
		action: () => {},
		state: false,
		timeout: undefined
	});

	constructor() {
		setInterval(() => {
			this.date = new Date();
		}, 1000);

		this.appId = localStorage.getItem('appId') || utils.generateUuid();
		localStorage.setItem('appId', this.appId);

		this.showStatus = localStorage.getItem('showStatus') == '1';
		this.isDemo = localStorage.getItem('demo') == '1';
		this.showWeather = localStorage.getItem('showWeather') == '1';
		this.locale = localStorage.getItem('locale') || 'en';
		this.credentials = utils.deserialize(localStorage.getItem('credentials'));
	}

	storeCredentials(credentials: Credentials) {
		this.credentials = credentials;
		localStorage.setItem('credentials', utils.serialize(credentials));
	}

	setDemo(state: number) {
		this.isDemo = state == 1;
		localStorage.setItem('demo', String(state));
	}

	async setLocale(loc: string) {
		const dateFnsLocale: DateFnsLocale = {nl: nl, en: enGB, de: de};
		this.locale = loc;
		localStorage.setItem('locale', loc);
		locale.set(loc); // set svelte-i18n
		setDefaultOptions({locale: dateFnsLocale[loc]});
		console.info('[LbAppStore] Locale set to', appStore.locale);
	}

	resetLockScreenDialogTimeout() {
		this.lockScreenDialog.state = false; 
		clearTimeout(this.lockScreenDialog.timeout); 
		this.setLockScreenDialogTimeout();
	}

	resetWeatherDialogTimeout() {
		//this.weatherDialog.state = false; 
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
