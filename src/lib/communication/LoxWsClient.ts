import LoxClient from 'svelte-lox-client';
import { miniserverClient } from '$lib/communication/MiniserverClient';
import type FileMessage from 'svelte-lox-client/dist/WebSocketMessages/FileMessage';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { utils } from '$lib/helpers/Utils';

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
	async connect(token?: string): Promise<void> {
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
		await this.getSettings();
	}

	/**
	 * Retrieve Miniserver settings, such as structure, user settings, system status, etc.
	 */
	async getSettings(): Promise<void> {
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
	}

	/**
	 * Listen to Miniserver events, such as connection status, text and value events, etc.
	 */
	private registerEvents(): void {
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
			miniserverClient.disconnect();
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error(`[LoxWsClient] Error received: ${error.message}`, error);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_value', (event: any) => {
			console.debug(`[LoxWsClient] event_value received: ${event.detail.value}`);
			controlStore.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_daytimer', (event: any) => {
			const str = event.detail.toString();
			console.debug(`[LoxWsClient] event_daytimer received: ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('event_weather', (event: any) => {
			const str = event.detail.toString();
			console.debug(`[LoxWsClient] event_weather received: ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
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
	async control(uuid: string, value: string): Promise<void> {
		console.info('[LoxWsClient] Send control:', uuid, value);
		await this.client.control(uuid, value);
	}

	/**
	 * Retrieve file from Miniserver (e.g. camera images of intercom)
	 * @param filename Name of the file to retrieve
	 * @returns returns the file contents as a FileMessage
	 */
	async getFile(filename: string): Promise<FileMessage> {
		return await this.client.sendFileCommand(filename);
	}

	/**
	 * Disconnect Miniserver
	 * @param preserveToken preserve Token
	 */
	async disconnect(preserveToken: boolean = true): Promise<void> {
		await this.client.disconnect(preserveToken);
		miniserverClient.disconnect();
		appStore.loxStatus = 0;
	}

	/**
	 * Store user settings (e.g. sorting/order of controls)
	 * @param settings in string/strigify format 
	 */
	setUserSettings(settings: string): void {
		console.info('[LoxWsClient] setUserSettings not implemented', JSON.parse(settings));
	}
	
	/**
	 * Retrieve user settings (e.g. sorting/order of controls)
	 */
	getUserSettings(): void {
		miniserverClient.getUserSettings();
	}
	
	/**
	 * Generic fetch delegated to Miniserver
	 * @param url endpoint (e.g., /jdev/sps/io/...)
	*/
	async fetch(url: string): Promise<Response> {
		return miniserverClient.fetch(url);
	}
}
