import { LoxWsClient } from '$lib/communication/LoxWsClient';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { utils } from '$lib/helpers/Utils';
import { demo } from '$lib/demo/Demo';

/**
 * Singleton that manages the active Miniserver connection.
 * This covers both WebSocket as REST APIs
 */
class MiniserverClient {
	private msClient: LoxWsClient | null = null;
	private hostName: string = ''; // should include http or https
	private userName: string = '';

	/**
	 * Connect to a Miniserver.
	 * - Called without arguments: startup path using stored credentials (or demo).
	 *   Shows the login dialog when no valid credentials are found.
	 * - Called with (hostUrl, userName, password): disconnects any existing connection
	 *   and connects with the supplied credentials, reusing a stored token when possible.
	 */
	async connect(hostName?: string, userName?: string, password?: string): Promise<void> {
		if (hostName && userName) {
      this.hostName = hostName.replace(/\/$/, ''); // remove optional trailing slash
      this.userName = userName;

      // Explicit credentials — disconnect any existing connection first
			this.disconnect();

			this.msClient = new LoxWsClient(hostName, userName, password ?? '', appStore.appId, 0);
			const cred = appStore.credentials;
			if (cred?.hostName === hostName && cred?.userName === userName && cred?.token) {
				if (await this.checkTokenValidity(hostName, userName, cred.token)) {
					await this.msClient.connect(cred.token);
					return;
				}
			}
			await this.msClient.connect(); // connect with password; token is stored on success
			this.getMiniserverSettings();
			return;
		}

		// No credentials — startup path, check if user wants to run demo
		if (appStore.isDemo) {
      this.disconnect(); // disconnect if there was an open connection
			demo.start();
			appStore.clearCredentials();
			appStore.setLocale('en'); // switch to en locale for demo
			appStore.loginDialog.state = false;
			return;
		}

    // no demo, check if there is an existing Miniserver handle
		if (this.msClient) {
			console.info('[MiniserverClient] Connection already active or in progress, skipping');
			return;
		}

		const cred = utils.deserialize(localStorage.getItem('credentials'));
		const appId = localStorage.getItem('appId') || undefined;

		if (cred && cred.hostName && cred.userName && cred.token && appId) {
			this.hostName = cred.hostName;
			this.userName = cred.userName;
			if (await this.checkTokenValidity(cred.hostName, cred.userName, cred.token)) {
				this.msClient = new LoxWsClient(cred.hostName, cred.userName, '', appId, 0);
				await this.msClient.connect(cred.token);
				this.getMiniserverSettings();
				return;
			}
		}

		console.error('[MiniserverClient] Unable to connect and authenticate');
		appStore.loginDialog.state = true;
	}

	/**
	 * Disconnect Miniserver (if not already done)
	 */
  async disconnect(): Promise<void> {
		if (this.msClient) {
			await this.msClient.disconnect();
			this.msClient = null;
		}
  }

	getMiniserverSettings(): void {
		// get UserSettings for sorting and favorites
		console.info('[MiniserverClient] Get user settings...');
		this.getUserSettings();

		// get System status
		console.info('[MiniserverClient] Get system status...');
		this.getSystemStatus();

		// get icon list
		console.info('[MiniserverClient] Get icons...');
		this.getIconList();

		// update locale based on structure language
		appStore.setLocale(controlStore.msInfo.languageCode.toLowerCase().slice(0, 2));
	}

	/**
	 * Check validity of token using REST API
	 * Returns true if the token is valid. Returns false if token is invalid or server is not responsive.
	 */
	async checkTokenValidity(url: string, userName: string, token: string): Promise<boolean> {
		return fetch(`${url}/jdev/sys/checktoken/${token}/${userName}?autht=${token}&user=${userName}`, {cache: "no-store"})
		.then((response) => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(`Something went wrong. Response status: ${response.status}`);
		})
		.then(() => {
			return true;
		})
		.catch(() => {
			console.error('[MiniserverClient] Miniserver not responding. Unable to check token');
			return false;
		});
	}

	/**
	 * Check credentials using REST API with username and password (no login)
	 * NOTE: no catch implemented in this fetch, this should be handled in the caller
	 * @param url IP address and/or hostname of the Miniserver
	 * @param userName name of the user
	 * @param password user password
	 */
	checkCredentials(url: string, userName: string, password: string): void {
		fetch(`${url}/jdev/sps/getusersettings`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + btoa(userName + ':' + password)
			}
		})
		.then((response) => {
			if (response.status != 200) {
				throw new Error('[MiniserverClient]: Check credentials failed');
			};
		});
	}
  
	/**
	 * Retrieve user settings (e.g. sorting/order of controls)
	 */
	getUserSettings(): void {
		fetch(`${this.hostName}/jdev/sps/getusersettings?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('getusersettings failed');
			}
		})
		.then((data) => {
			controlStore.setUserSettings(data);
		})
		.catch((error) => console.error('[MiniserverClient] getUserSettings fetch error: ', error));
	}

	/**
	 * Retrieve Miniserver system status
	 */
	getSystemStatus(): void {
		fetch(`${this.hostName}/jdev/sps/io/${controlStore.messageCenterList[0].uuidAction}/getEntries/2?autht=${appStore.credentials.token}&user=${this.userName}`)
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
	 * Retrieve Miniserver icon list
	 */
	getIconList(): void {
		fetch(`${this.hostName}/jdev/sps/geticonlist?autht=${appStore.credentials.token}&user=${this.userName}`)
		.then((response) => response.json())
		.then((data) => {
			controlStore.iconList = data;
		})
		.catch((error) => console.error('[MiniserverClient] getIconList fetch error: ', error));
	}

	/**
	 * Generic REST command using Miniserver user credentials
	 * @param url endpoint (e.g., /jdev/sps/io/...)
	*/
	async fetch(url: string): Promise<Response> {
		const request = new Request(`${this.hostName}/${url}?autht=${appStore.credentials.token}&user=${this.userName}`);
		return fetch(request);
	}
}

export const miniserverClient = new MiniserverClient();
