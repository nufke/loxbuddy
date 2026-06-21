import { SvelteMap } from 'svelte/reactivity';
import type { Credentials, MqttCredentials, SipCredentials } from '$lib/types/models';
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
	autoLogin: boolean = $state(false);
	credentials: Credentials | null = $state(null);
	date: Date = $state(new Date());
	isDemo: boolean = $state(false);
	locale: string = $state('en'); // default English
	lockScreenDialogOpen: boolean = $state(false);
	lockScreenDialogTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
	loginDialogOpen: boolean = $state(false);
	logLevel: number = $state(3); //	DEBUG = 4, INFO = 3, WARN = 2, ERROR = 1, NONE = 0
	loxStatus: number = $state(0);  // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	mode: string = $state('dark');
	mqttCredentials: MqttCredentials | null = $state(null);
	mqttStatus: number = $state(0); // 0=disconnected (grey), 1=connected/ok/info (green), 2=warning/issue (yellow), 3=error (red)
	sipCredentials: SipCredentials | null = $state(null);
	sipStatus: number = $state(0); // 0=unregistered (grey), 1=registered (green), 3=error (red)
	callStatus: string = $state('');
	showStatus: boolean = $state(true);
	showWeather: boolean = $state(true);
	startPage: string = $state('/');
	theme: string = $state('LoxBuddy');
	visuPw: SvelteMap<string, string> = new SvelteMap();
	weatherDialogOpen: boolean = $state(false);
	weatherDialogTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	constructor() {
		setInterval(() => {
			this.date = new Date();
		}, 1000); // update date every second

		this.appId = localStorage.getItem('appId') || utils.generateUuid();
		localStorage.setItem('appId', this.appId);


		this.showStatus = localStorage.getItem('showStatus') == '1';
		this.logLevel = Number(localStorage.getItem('logLevel') || '3');
		this.autoLogin = localStorage.getItem('autoLogin') == '1';
		this.mode = localStorage.getItem('mode') || 'dark';
		this.theme = localStorage.getItem('theme') || 'LoxBuddy';
		this.isDemo = localStorage.getItem('demo') == '1';
		this.showWeather = localStorage.getItem('showWeather') == '1';
		this.locale = localStorage.getItem('locale') || 'en';
		this.credentials = utils.deserialize(utils.getCookie('credentials')) as Credentials;
		this.mqttCredentials = utils.deserialize(utils.getCookie('mqttCredentials')) as MqttCredentials;
		this.sipCredentials = utils.deserialize(utils.getCookie('sipCredentials')) as SipCredentials;
	}

	storeCredentials(credentials: Credentials): void {
		this.credentials = credentials;
		utils.setCookie('credentials', utils.serialize(credentials));
	}

	storeMqttCredentials(credentials: MqttCredentials): void {
		this.mqttCredentials = credentials;
		utils.setCookie('mqttCredentials', utils.serialize(credentials));
	}

	storeSipCredentials(credentials: SipCredentials): void {
		this.sipCredentials = credentials;
		utils.setCookie('sipCredentials', utils.serialize(credentials));
	}

	getVisuPw(controlUuid: string) {
		return this.visuPw.get(controlUuid);
	}

	setVisuPw(controlUuid: string, visuPw: string) {
		this.visuPw.set(controlUuid, visuPw);
		setTimeout(() => {
			this.visuPw.delete(controlUuid);
		}, 10000); // delete visuPw after 10 sec
	}

	setLogLevel(level: number) {
		this.logLevel = level;
		localStorage.setItem('logLevel', String(level));
	}

	clearCredentials(): void {
		this.credentials = null;
		utils.deleteCookie('credentials');
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

	resetLockScreenDialogTimeout(): void {
		this.lockScreenDialogOpen = false;
		clearTimeout(this.lockScreenDialogTimeout);
		this.setLockScreenDialogTimeout();
	}

	resetWeatherDialogTimeout(): void {
		clearTimeout(this.weatherDialogTimeout);
		this.setWeatherDialogTimeout();
	}

	setWeatherDialogTimeout(): void {
		this.weatherDialogTimeout = setTimeout(() => {
			this.weatherDialogOpen = false;
		}, 30000); // 30s TODO add to configuration
	}

	setLockScreenDialogTimeout(): void {
		this.lockScreenDialogTimeout = setTimeout(() => {
			this.lockScreenDialogOpen = true;
		}, 60000); // 60s TODO add to configuration
	}
}

export const appStore = new LbAppStore();
