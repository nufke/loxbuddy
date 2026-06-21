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
	 * - Called with all three arguments: disconnects any existing connection
	 *   and connects with the supplied credentials, reusing a stored token when possible.
	 *
	 * @param hostName - IP address or hostname of the Miniserver (including http/https prefix).
	 * @param userName - login name of the Miniserver user.
	 * @param password - plaintext password used for the initial token request.
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
		appStore.loginDialogOpen = true;
	}

	/**
	 * Registers WebSocket event listeners for connection lifecycle events
	 * (connected, authenticated, disconnected, error) and all state-update event types
	 * (event_value, event_daytimer, event_weather, event_text), forwarding each to
	 * the control store.
	 */
	private registerEvents(): void {
		this.client?.on('connected', () => {
			console.info(`[MiniserverClient] Connection to Miniserver established`);
		});

		this.client?.on('authenticated', () => {
			console.info(`[MiniserverClient] User ${this.userName} authenticated`);
			appStore.loxStatus = 1;
			appStore.loginDialogOpen = false; // close login dialog
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
			const value = event.detail.value;
			const uuid = event.detail.uuid.stringValue;
			console.debug(`[MiniserverClient] event_value received: ${uuid} ${value}`);
			controlStore.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_daytimer', (event: any) => {
			const str = event.detail.toString();
			const uuid = event.detail.uuid.stringValue;
			console.debug(`[MiniserverClient] event_daytimer received: ${uuid} ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_weather', (event: any) => {
			const str = event.detail.toString();
			const uuid = event.detail.uuid.stringValue;
			console.debug(`[MiniserverClient] event_weather received: ${uuid} ${str}`);
			controlStore.setState(event.detail.uuid.stringValue, str);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client?.on('event_text', (event: any) => {
			const text = event.detail.text;
			const uuid = event.detail.uuid.stringValue;
			console.debug(`[MiniserverClient] event_text received: ${uuid} ${text}`);
			const objOrText = utils.isValidJSONObject(text) ? JSON.parse(text) : text;
			controlStore.setState(event.detail.uuid.stringValue, objOrText);
		});
	}

	/**
	 * Sends a control command to the Miniserver over the active WebSocket connection.
	 *
	 * @param uuid - universally unique ID of the control.
	 * @param value - command value string.
	 * @param visuPw - optional visualisation password for secured controls.
	 */
	async control(uuid: string, value: string, visuPw?: string): Promise<void> {
		console.info(`[MiniserverClient] Send ${visuPw ? 'secure ' : ''}control:`, uuid, value);
		await this.client?.control(uuid, value, visuPw);
	}

	/**
	 * Retrieves a file from the Miniserver (e.g. a camera image from the intercom).
	 *
	 * @param filename - path/name of the file to retrieve.
	 * @returns file contents as a `FileMessage`, or `undefined` when the client is disconnected.
	 */
	async getFile(filename: string): Promise<FileMessage | undefined> {
		return await this.client?.sendFileCommand(filename);
	}

	/**
	 * Disconnects from the Miniserver and resets the connection state.
	 * No-op when no connection is active.
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
	 * Fetches and applies the full Miniserver configuration after a successful connection:
	 * structure file, user settings, system status, and locale. Also enables event streaming.
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
	 * Checks whether a stored token is still accepted by the Miniserver via the REST API.
	 *
	 * @param url - IP address and/or hostname of the Miniserver (including http/https prefix).
	 * @param userName - name of the user the token belongs to.
	 * @param token - authorization token to validate.
	 * @returns true if the token is valid; false if the token is invalid or the server is not responding.
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
	 * Persists user settings (e.g. control sort order and favourites) to the Miniserver via REST.
	 *
	 * @param settings - user settings object to store.
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
	 * Retrieves user settings (e.g. control sort order and favourites) from the Miniserver
	 * and forwards them to the control store.
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
	 * Retrieves the current system status entries from the first MessageCenter control
	 * and stores them in the control store. No-op when no MessageCenter is configured.
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
	 * Issues a generic authenticated GET request to the Miniserver using the stored credentials.
	 *
	 * @param url - endpoint path (e.g. `jdev/sps/io/...`), without host or auth query parameters.
	 * @returns the raw fetch `Response` from the Miniserver.
	 */
	async fetch(url: string): Promise<Response> {
		const request = new Request(`${this.hostName}/${url}?autht=${appStore.credentials?.token}&user=${this.userName}`);
		return fetch(request);
	}
}

export const miniserverClient = new MiniserverClient();
