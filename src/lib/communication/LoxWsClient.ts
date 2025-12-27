import LoxClient from 'svelte-lox-client';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { utils } from '$lib/helpers/Utils';

/**
 * Class to connect to Miniserver using WebSocket
 */
export class LoxWsClient {
	private client: LoxClient;
	private hostUrl: string = '';
	private username: string = '';

	/**
	 * Constructor to initialize WebSocket to the Miniserver
	 * @param hostname Miniserver IP address and port
	 * @param username Name of the user
	 * @param password Password of the user
	 * @param appId Unique application ID for each client
	 * @param logLevel logger level
	 */
	constructor(hostname: string, username: string, password: string, appId: string, logLevel: number) {
		this.hostUrl = 'http://' + hostname; // TODO swich protocol http(s) depending on TLS
		this.username = username;

		if (!appId.length) {
			console.error('LoxWsClient: Invalid App ID, cannot connect to Miniserver');
		}

		if (!username.length) {
			console.error('LoxWsClient: Invalid username, cannot connect to Miniserver');
		}

		this.client = new LoxClient(hostname, username, password, appId, { logLevel: logLevel });

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
				console.info('LoxWsClient: Connecting to Miniserver using existing token...');
				await this.client.connect(token);
			}	else {
				console.info('LoxWsClient Connecting to Miniserver requesting new token...');
				await this.client.connect();
				const newToken = this.client.auth.tokenHandler.token;
				if (newToken) {
					appStore.storeToken(newToken);
					console.info('LoxWslient: Token received and stored:');
				}
			}
		}	catch {
			console.log('LoxWsClient: A error!');
			return;
		}
		this.getSettings();
	}

	async getSettings() {
		if (appStore.loxStatus) { // make sure we are connected
			// get structure file
			console.info('LoxWsClient: Get structure file...');
			const structure = await this.client.getStructureFile();
			controlStore.initStructure(structure, this);
			this.client.parseStructureFile();

			// initiates streaming of all events
			await this.client.enableUpdates();

			// get UserSettings for sorting and favorites
			console.info('LoxWsClient: Get user settings...');
			this.getUserSettings();

			// get System status
			console.info('LoxWsClient: Get system status...');
			this.getSystemStatus();

			// get icon list
			console.info('LoxWsClient: Get icons...');
			this.getIconList();
		}
	}

	/**
	 * Listen to Miniserver events, such as connection status, text and value events, etc.
	 */
	registerEvents() {
		this.client.on('connected', () => {
			console.info(`LoxWsClient: Connection to Miniserver established`);
		});

		this.client.on('authenticated', () => {
			console.info(`LoxWsClient: User ${this.username} authenticated`);
			appStore.loxStatus = 1;
			appStore.loginDialog.state = false; // close login dialog
		});

		this.client.on('disconnected', () => {
			console.info('LoxWsClient: Disconnected from Miniserver');
			appStore.loxStatus = 0;
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error(`LoxWsClient: Error received: ${error.message}`, error);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_value', (event: any) => {
			console.debug(`LoxWsClient: event_value received: ${event}`);
			controlStore.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_text', (event: any) => {
			const text = event.detail.text;
			console.debug(`LoxWsClient: event_text received: ${text}`);
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
		console.info('LoxWsClient control:', uuid, value);
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
		fetch(`${this.hostUrl}/jdev/sps/getusersettings?autht=${appStore.token}&user=${this.username}`)
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
		.catch(e => console.error('fetch error: ', e))
	}

	/**
	 * Check credentials using HTTP webservice (no login)
	 */
	async checkCredentials(username: string, password: string) {
		await fetch(`${this.hostUrl}/jdev/cfg/apiKey`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + btoa(username + ':' + password)
			}
		})
		.then((response) => {
			if (response.status != 200) {
				throw new Error('LoxWsClient checkCredentials: Credentials failed');
			};
		});
	}

	/**
	 * Retrieve Miniserver system status
	 */
	getSystemStatus() {
		fetch(`${this.hostUrl}/jdev/sps/io/${controlStore.messageCenterList[0].uuidAction}/getEntries/2?autht=${appStore.token}&user=${this.username}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.then((data) => {
			controlStore.systemStatus = JSON.parse(data.LL.value);
		});
	}

	/**
	 * Retrieve Miniserver icon list
	 */
	getIconList() {
		fetch(`${this.hostUrl}/jdev/sps/geticonlist?autht=${appStore.token}&user=${this.username}`)
		.then((response) => response.json())
		.then((data) => {
			controlStore.iconList = data;
		});
	}

	/**
	 * Generic webservice command using Miniserver user credentials
	 * @param url webservices endpoint (e.g., /jdev/sps/io/...)
	*/
	async fetch(url: string) {
		return fetch(`${this.hostUrl}/${url}?autht=${appStore.token}&user=${this.username}`)
		.then((response) => response.json())
		.then((data) => {
			//console.log('data', data)
			return data?.LL?.value ? data.LL.value : data;
		});
	}
}

export const startLoxWsClient = async () => {
	const token = localStorage.getItem('token') || undefined;
	const cred = utils.deserialize(localStorage.getItem('credentials'));
	const appId = localStorage.getItem('appId') || undefined;

	if (cred.hostname && cred.username && appId && token) {
		const loxClient = new LoxWsClient(cred.hostname, cred.username, '', appId, 0);
		await loxClient.connect(token);
	} else {
		appStore.loginDialog.state = true; 
	}
}
