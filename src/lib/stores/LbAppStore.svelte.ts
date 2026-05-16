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
	mode: string = $state('dark');
	theme: string = $state('LoxBuddy');
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	loxStatus: number = $state(0);  // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	showStatus: boolean = $state(true);
	showWeather: boolean = $state(true);
	startPage: string = $state('/');
	sorting: string = $state('0'); // sorting disabled
	sortingMode: string = $state('0');// default sorting (config based)
	userDefinedOrder: boolean = $state(false);
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
		this.mode = localStorage.getItem('mode') || 'dark';
		this.theme = localStorage.getItem('theme') || 'LoxBuddy';
		this.isDemo = localStorage.getItem('demo') == '1';
		this.showWeather = localStorage.getItem('showWeather') == '1';
		this.locale = localStorage.getItem('locale') || 'en';
		this.credentials = utils.deserialize(localStorage.getItem('credentials')) as Credentials;
		this.sorting = localStorage.getItem('sorting') || '0'; /* sorting enabled */
		this.sortingMode = localStorage.getItem('sortingMode') || '0';
		this.dnd.isEnabled = (this.sorting == '1');
		this.userDefinedOrder = this.sortingMode != '0';
	}

	storeCredentials(credentials: Credentials): void {
		this.credentials = credentials;
		localStorage.setItem('credentials', utils.serialize(credentials));
	}

	clearCredentials(): void {
		this.credentials = NO_CREDENTIALS;
		localStorage.setItem('credentials', utils.serialize(NO_CREDENTIALS));
	}

	setDemo(state: number): void {
		this.isDemo = state == 1;
		localStorage.setItem('demo', String(state));
	}

	async setLocale(loc: string): Promise<void> {
		const dateFnsLocale: DateFnsLocale = {nl: nl, en: enGB, de: de};
		this.locale = loc;
		localStorage.setItem('locale', loc);
		locale.set(loc); // set svelte-i18n
		setDefaultOptions({locale: dateFnsLocale[loc]});
		console.info('[LbAppStore] Locale set to', appStore.locale);
	}

	setSortingMode(mode: string): void {
		this.sortingMode = mode;
		localStorage.setItem('sortingMode', mode);
		this.userDefinedOrder = (this.sortingMode != '0');
		localStorage.setItem('userDefinedOrder', this.userDefinedOrder ? '1' : '0');
	}

	resetLockScreenDialogTimeout(): void {
		this.lockScreenDialog.state = false; 
		clearTimeout(this.lockScreenDialog.timeout); 
		this.setLockScreenDialogTimeout();
	}

	resetWeatherDialogTimeout(): void {
		//this.weatherDialog.state = false; 
		clearTimeout(this.weatherDialog.timeout); 
		this.setWeatherDialogTimeout();
	}

	setWeatherDialogTimeout(): void {
		this.weatherDialog.timeout = setTimeout(() => {
			this.weatherDialog.state = false;
		}, 30000); // 30s TODO add to configuration
	}

	setLockScreenDialogTimeout(): void {
		this.lockScreenDialog.timeout = setTimeout(() => {
			this.lockScreenDialog.state = true;
		}, 60000); // 60s TODO add to configuration
	}
}

export const appStore = new LbAppStore();
