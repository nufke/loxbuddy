import LoxClient from 'svelte-lox-client';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { utils } from '$lib/helpers/Utils';
import { demo } from '$lib/demo/Demo';

/**
 * Class to connect to Miniserver using WebSocket
 */
export class LoxWsClient {
	private client: LoxClient;
	private hostName: string = ''; // should include http or https
	private userName: string = '';

	/**
	 * Constructor to initialize WebSocket to the Miniserver
	 * @param hostName Miniserver IP address and port (incl http(s))
	 * @param userName Name of the user
	 * @param password Password of the user
	 * @param appId Unique application ID for each client
	 * @param logLevel logger level
	 */
	constructor(hostName: string, userName: string, password: string, appId: string, logLevel: number) {
		this.hostName = hostName.replace(/\/$/, ''); // remove optional trailing slash
		this.userName = userName;

		if (!appId.length) {
			console.error('[LoxWsClient] Invalid App ID, cannot connect to Miniserver');
		}

		if (!userName.length) {
			console.error('[LoxWsClient] Invalid username, cannot connect to Miniserver');
		}

		this.client = new LoxClient(hostName, userName, password, appId, { logLevel: logLevel });

		// register event callbacks
		this.registerEvents();
	}

	/**
	 * Establish connection to Miniserver
	 * @param token (optional) active token for the connection 
	 */
	async connect(token?: string) {
		try {
			if (token) {
				console.info('[LoxWsClient] Connecting to Miniserver using existing token...');
				await this.client.connect(token);
			}	else {
				console.info('[LoxWsClient] Connecting to Miniserver requesting new token...');
				await this.client.connect();
				const newToken = this.client.auth.tokenHandler.token;
				if (newToken) {
					console.info('[LoxWsClient] Token received and stored');
					appStore.storeCredentials({ hostName: this.hostName, userName: this.userName, token: newToken, msName: '' });
				}
			}
		}	catch {
			console.error('[LoxWsClient] Unable to connect and authenticate!');
			return;
		}
		this.getSettings();
	}

	/**
	 * Retrieve Miniserver settings, such as structure, user settings, system status, etc.
	 */
	async getSettings() {
		if (!appStore.loxStatus) return; // make sure we are connected

		// get structure file
		console.info('[LoxWsClient] Get structure file...');
		
		try {
			const structure = await this.client.getStructureFile();
			// add msName to credentials
			appStore.storeCredentials({...appStore.credentials, msName: structure.msInfo.msName});
			// store structure as app state
			controlStore.initStructure(structure, this);
			// we need to parse the structure in the client, 
			// otherwise the control messages are not understood by LoxClient
			this.client.parseStructureFile();
		}	catch {
			console.error('[LoxWsClient] Unable to get and parse structure file');
			return;
		}

		// initiates streaming of all events
		await this.client.enableUpdates();

		// get UserSettings for sorting and favorites
		console.info('[LoxWsClient] Get user settings...');
		this.getUserSettings();

		// get System status
		console.info('[LoxWsClient] Get system status...');
		this.getSystemStatus();

		// get icon list
		console.info('[LoxWsClient] Get icons...');
		this.getIconList();
		
		// update locale based on structure language
		appStore.setLocale(controlStore.msInfo.languageCode.toLowerCase().slice(0, 2));
	}

	/**
	 * Listen to Miniserver events, such as connection status, text and value events, etc.
	 */
	registerEvents() {
		this.client.on('connected', () => {
			console.info(`[LoxWsClient] Connection to Miniserver established`);
		});

		this.client.on('authenticated', () => {
			console.info(`[LoxWsClient] User ${this.userName} authenticated`);
			appStore.loxStatus = 1;
			appStore.loginDialog.state = false; // close login dialog
		});

		this.client.on('disconnected', () => {
			console.info('[LoxWsClient] Disconnected from Miniserver');
			appStore.loxStatus = 0;
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error(`[LoxWsClient] Error received: ${error.message}`, error);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_value', (event: any) => {
			console.debug(`[LoxWsClient] event_value received: ${event}`);
			controlStore.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_text', (event: any) => {
			const text = event.detail.text;
			console.debug(`[LoxWsClient] event_text received: ${text}`);
			const objOrText = utils.isValidJSONObject(text) ? JSON.parse(text) : text;
			controlStore.setState(event.detail.uuid.stringValue, objOrText);
		});
	}

	/**
	 * Send control state to Miniserver
	 * @param uuid universally unique ID of the control
	 * @param value value of the control
	 */
	async control(uuid: string, value: string) {
		console.info('[LoxWsClient] Send control:', uuid, value);
		await this.client.control(uuid, value);
	}

	/**
	 * Retrieve file from Miniserver (e.g. camera images of intercom)
	 * @param filename Name of the file to retrieve
	 * @returns returns the file contents as a FileMessage
	 */
	async getFile(filename: string) {
		return await this.client.sendFileCommand(filename);
	}

	/**
	 * Disconnect Miniserver and preserve token
	 */
	async disconnect() {
		await this.client.disconnect(true);
		appStore.loxStatus = 0;
	}

	/**
	 * Retrieve user settings (e.g. sorting/order of controls)
	 */
	getUserSettings() {
		fetch(`${this.hostName}/jdev/sps/getusersettings?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('getusersettings failed');
			}
		})
		.then((data) => {
			controlStore.userSettings = data;
		})
		.catch(e => console.error('[LoxWsClient] getUserSettings fetch error: ', e));
	}

	/**
	 * Retrieve Miniserver system status
	 */
	getSystemStatus() {
		fetch(`${this.hostName}/jdev/sps/io/${controlStore.messageCenterList[0].uuidAction}/getEntries/2?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.then((data) => {
			controlStore.systemStatus = JSON.parse(data.LL.value);
		})
		.catch(e => console.error('[LoxWsClient] getSystemStatus fetch error: ', e));
	}

	/**
	 * Retrieve Miniserver icon list
	 */
	getIconList() {
		fetch(`${this.hostName}/jdev/sps/geticonlist?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => response.json())
		.then((data) => {
			controlStore.iconList = data;
		})
		.catch(e => console.error('[LoxWsClient] getIconList fetch error: ', e));
	}

	/**
	 * Generic webservice command using Miniserver user credentials
	 * @param url webservices endpoint (e.g., /jdev/sps/io/...)
	*/
	async fetch(url: string) {
		return fetch(`${this.hostName}/${url}?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => response.json())
		.then((data) => {
			//console.debug('[LoxWsClient] fetch data', data)
			return data?.LL?.value ? data.LL.value : data;
		});
	}
}

/**
 * Establish connection with Miniserver if credentials are available
 * If Demo was runnig before, reload Demo
 */
export const startLoxWsClient = async () => {
	const cred = utils.deserialize(localStorage.getItem('credentials'));
	const appId = localStorage.getItem('appId') || undefined;

	if (appStore.isDemo) {
		demo.start();
		appStore.setLocale('en'); // switch to en locale for demo
		return;
	}

	if (cred && cred.hostName && cred.userName && cred.token && appId) {
		const loxClient = new LoxWsClient(cred.hostName, cred.userName, '', appId, 0);
		await loxClient.connect(cred.token);
	} else {
		appStore.loginDialog.state = true; 
	}
}

/**
 * Check credentials using HTTP webservice (no login)
 * NOTE: no catch implemented in this fetch, this should be handled in the caller
 */
export const checkCredentials = async (url: string, userName: string, password: string) => {
	await fetch(`${url}/jdev/sps/getusersettings`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + btoa(userName + ':' + password)
		}
	})
	.then((response) => {
		if (response.status != 200) {
			throw new Error('[checkCredentials]: Credentials failed');
		};
	});
}

/**
 * Check validity of token. Returns true is token is valid
 */
export const checkTokenValidity = async (url: string, userName: string, token: string) => {
	return fetch(`${url}/jdev/sps/getusersettings?autht=${token}&user=${userName}`)
	.then((response) => {
		if (response.status == 200) {
			return true;
		} else {
			return false;
		}
	});
}
