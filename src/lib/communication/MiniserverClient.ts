import LoxClient from 'svelte-lox-client';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { utils } from '$lib/helpers/Utils';
import type { UserSettings } from '$lib/types/models';

type FileMessage = {
	filename: string;
	type: 'json' | 'text' | 'binary';
	data: unknown;
	length: number;
};

/**
 * Singleton that manages the Miniserver connection.
 * This covers both WebSocket as HTTP(S) REST APIs
 */
export class MiniserverClient {
	private client: LoxClient | null = null;
	private hostName: string = ''; // should include http or https
	private userName: string = '';
	private token: string = '';

	/**
	 * Constructor is empty. Instead we use the connect method to initialize the Miniserver client.
	 */
	constructor() {}

	/**
	 * Connect to a Miniserver:
	 * - Called without arguments: startup path using stored credentials (or demo).
	 *   Shows the login dialog when no valid credentials are found.
	 * - Called with (hostName, userName, password): disconnects any existing connection
	 *   and connects with the supplied credentials, reusing a stored token when possible.
	 */
	async connect(hostName?: string, userName?: string, password?: string): Promise<void> {
		if (appStore.isDemo) return; // do not connect if we are in demo mode

		const cred = appStore.credentials;
		const appId = appStore.appId;
		const logLevel = 0; // TODO config

    // Explicit credentials — disconnect any existing connection first
		await this.disconnect();

		if (hostName && userName && password) {
      this.hostName = hostName.replace(/\/$/, ''); // remove optional trailing slash
      this.userName = userName;
			this.client = new LoxClient(hostName, userName, password, appId, { logLevel: logLevel });
			this.registerEvents();

			// if credentials are available, try this first
			if (cred?.hostName === hostName && cred?.userName === userName && cred?.token) {
				if (await this.checkTokenValidity(hostName, userName, cred?.token)) {
				console.info('[MiniserverClient] Connect to Miniserver with existing token...');
					await this.client.connect(cred?.token);
					return;
				}
			}

			// otherwise connect without credentials, and if successfull store credentials
			console.info('[MiniserverClient] Connect to Miniserver without existing token...');
			await this.client.connect(); // connect with password; token is stored on success
			this.token = this.client.auth.tokenHandler.token ?? '';
			if (this.token.length) {
				console.info('[MiniserverClient] Token received and stored');
				appStore.storeCredentials({ hostName: this.hostName, userName: this.userName, token: this.token, msName: '' });
			}
			await this.getSettings();
			return;
		}

		// No arguments, use credentials if available
		if (cred?.hostName && cred?.userName && cred?.token) {
			if (await this.checkTokenValidity(cred?.hostName, cred?.userName, cred?.token)) {
				this.hostName = cred?.hostName;
				this.userName = cred?.userName;
				this.token = cred?.token;
				console.info('[MiniserverClient] Connect to Miniserver with existing credentials...');
				this.client = new LoxClient(cred?.hostName, cred?.userName, '', appId, { logLevel: logLevel });
				this.registerEvents();
				await this.client?.connect(cred?.token);
				await this.getSettings();
				return;
			}
		}

		console.error('[MiniserverClient] Unable to connect and authenticate');
		appStore.loginDialog.state = true;
	}

	/**
	 * Listen to Miniserver events, such as connection status, text and value events, etc.
	 */
	private registerEvents(): void {
		this.client?.on('connected', () => {
			console.info(`[MiniserverClient] Connection to Miniserver established`);
		});

		this.client?.on('authenticated', () => {
			console.info(`[MiniserverClient] User ${this.userName} authenticated`);
			appStore.loxStatus = 1;
			appStore.loginDialog.state = false; // close login dialog
		});

		this.client?.on('disconnected', () => {
			console.info('[MiniserverClient] Disconnected from Miniserver');
			this.client = null; /* null before any further calls to prevent re-entry */
			appStore.loxStatus = 0;
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('error', (error: any) => {
			console.error(`[MiniserverClient] Error received: ${error.message}`, error);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_value', (event: any) => {
			console.debug(`[MiniserverClient] event_value received: ${event.detail.value}`);
			controlStore.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_daytimer', (event: any) => {
			const str = event.detail.toString();
			console.debug(`[MiniserverClient] event_daytimer received: ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_weather', (event: any) => {
			const str = event.detail.toString();
			console.debug(`[MiniserverClient] event_weather received: ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_text', (event: any) => {
			const text = event.detail.text;
			console.debug(`[MiniserverClient] event_text received: ${text}`);
			const objOrText = utils.isValidJSONObject(text) ? JSON.parse(text) : text;
			controlStore.setState(event.detail.uuid.stringValue, objOrText);
		});
	}

	/**
	 * Send control state to Miniserver
	 * @param uuid universally unique ID of the control
	 * @param value value of the control
	 * @param visuPw (optional) visualization password for secured controls
	 */
	async control(uuid: string, value: string, visuPw?: string): Promise<void> {
		console.info(`[MiniserverClient] Send ${visuPw ? 'secure ' : ''}control:`, uuid, value);
		await this.client?.control(uuid, value, visuPw);
	}

	/**
	 * Retrieve file from Miniserver (e.g. camera images of intercom)
	 * @param filename Name of the file to retrieve
	 * @returns returns the file contents as a FileMessage
	 */
	async getFile(filename: string): Promise<FileMessage | undefined> {
		return await this.client?.sendFileCommand(filename);
	}

	/**
	 * Disconnect Miniserver (if not already done)
	 */
  async disconnect(): Promise<void> {
		const client = this.client;
		if (client) {
			this.client = null; /* null first to prevent re-entry from disconnected event */
			appStore.loxStatus = 0;
			await client.disconnect();
		}
  }

	/**
	 * Retrieve Miniserver settings, such as structure, user settings, system status, etc.
	 */
	private async getSettings(): Promise<void> {
		if (!appStore.loxStatus) return; // make sure we are connected

		// get structure file
		console.info('[MiniserverClient] Get structure file...');

		try {
			const structure = await this.client?.getStructureFile();
			// add msName to credentials
			appStore.storeCredentials({ hostName: this.hostName, userName: this.userName, token: this.token, msName: structure.msInfo.msName });
			// empty structure first
			controlStore.clearStructure();
			// store structure as app state
			controlStore.initStructure(structure, this);
			// important: we need to parse the structure in the client,
			// otherwise the control messages are not understood by LoxClient
			this.client?.parseStructureFile();
		}	catch {
			console.error('[MiniserverClient] Unable to get and parse structure file');
			return;
		}

		// get UserSettings for sorting and favorites
		console.info('[MiniserverClient] Get user settings...');
		await this.getUserSettings();

		// get System status
		console.info('[MiniserverClient] Get system status...');
		await this.getSystemStatus();

		// update locale based on structure language
		appStore.setLocale(controlStore.msInfo.languageCode.toLowerCase().slice(0, 2));

		// initiates streaming of all events
		await this.client?.enableUpdates();
	}

	/**
	 * Check validity of token using the REST API
	 * @param url IP address and/or hostname of the Miniserver
	 * @param userName name of the user
	 * @param token authorization token
	 * @returns true if the token is valid. Returns false if token is invalid or server is not responding
	 */
	private async checkTokenValidity(url: string, userName: string, token: string): Promise<boolean> {
		return fetch(`${url}/jdev/sys/checktoken/${token}/${userName}?autht=${token}&user=${userName}`, {cache: "no-store"})
		.then((response) => {
			return response.json();
		})
		.then(() => {
			return true;
		})
		.catch(() => {
			console.error('[MiniserverClient] Invalid token or Miniserver not responding.');
			return false;
		});
	}

	/**
	 * Store user settings (e.g. sorting/order of controls)
	 * @param settings user settings of type UserSettings
	 */
	async setUserSettings(settings: UserSettings): Promise<void> {
		console.info('[MiniserverClient] user settings send to Miniserver:', settings);
		await fetch(`${this.hostName}/jdev/sps/setusersettings?autht=${appStore.credentials?.token}&user=${this.userName}`,
		{ 
			method: "POST",
			body: settings.ts + '/' + JSON.stringify(settings)
		})
		.catch((error) => console.error('[MiniserverClient] setUserSettings fetch POST error: ', error));
	}

	/**
	 * Retrieve user settings (e.g. sorting/order of controls)
	 */
	async getUserSettings(): Promise<void> {
		await fetch(`${this.hostName}/jdev/sps/getusersettings?autht=${appStore.credentials?.token}&user=${this.userName}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('getusersettings failed');
			}
		})
		.then((data) => {
			controlStore.storeUserSettings(data);
		})
		.catch((error) => console.error('[MiniserverClient] getUserSettings fetch error: ', error));
	}

	/**
	 * Retrieve Miniserver system status
	 */
	async getSystemStatus(): Promise<void> {
		if (!controlStore.messageCenterList.length) return; /* no messageCenter, return */
		fetch(`${this.hostName}/jdev/sps/io/${controlStore.messageCenterList[0].uuidAction}/getEntries/2?autht=${appStore.credentials?.token}&user=${this.userName}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.then((data) => {
			controlStore.systemStatus = JSON.parse(data.LL.value);
		})
		.catch((error) => console.error('[MiniserverClient] getSystemStatus fetch error: ', error));
	}

	/**
	 * Generic fetch command using Miniserver user credentials
	 * @param url endpoint (e.g., /jdev/sps/io/...)
	*/
	async fetch(url: string): Promise<Response> {
		const request = new Request(`${this.hostName}/${url}?autht=${appStore.credentials?.token}&user=${this.userName}`);
		return fetch(request);
	}
}

export const miniserverClient = new MiniserverClient();
