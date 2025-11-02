import LoxClient from 'svelte-lox-client';
import { store } from '$lib/stores/Store.svelte';
import { utils } from '$lib/helpers/Utils';
import { test } from '$lib/test/Test';

/**
 * Class to connect to Miniserver using WebSocket
 */
export class LoxWsClient {
 	private client!: LoxClient;
	private hostUrl: string = '';
	private username: string = '';
	private passwd: string = '';
	private appId: string = '';
	private isTest: boolean = true; // not initialized means test mode

	/** 
	 * Constructor is empty as we initialize the WebSocket after reading the environment variables.
	 * Instead we use the connect method to initialize the client
	 */
	constructor() {
	}

	/**
	 * Establish WebSocket connection to Miniserver
	 * @param hostname Miniserver IP address and port
	 * @param username Name of the user
	 * @param passwd Password of the user
	 * @param appId Unique application ID for each client
	 * @param logLevel logger level
	 * @param isTest flag defining if we run in test mode
	 */
	async connect(hostname: string, username: string, passwd: string, appId: string, logLevel: number, isTest: boolean) {
		this.hostUrl = 'http://' + hostname; // TODO swich protocol http(s) depending on TLS
		this.username = username;
		this.passwd = passwd;
		this.isTest = isTest;
		this.appId = appId;
		
		if (!appId.length) {
			console.error('Invalid App ID, cannot connect to Miniserver');
		}

		if (!username.length) {
			console.error('Invalid username, cannot connect to Miniserver');
		}

		if (!passwd.length) {
			console.error('Invalid password, cannot connect to Miniserver');
		}

		this.client = new LoxClient(hostname, username, passwd, appId, { logLevel: logLevel });
		this.registerEvents();

		// initiate connection
		console.info('LoxClient connecting to miniserver...');
		await this.client.connect();

		// get structure file
		console.info('LoxClient: Get structure file...');
		const structure = await this.client.getStructureFile();
		store.initStructure(structure);
		this.client.parseStructureFile();

		// initiates streaming of all events
		await this.client.enableUpdates();
	}

	/**
	 * Listen to Miniserver events, such as connection status, text and value events, etc.
	 */
	registerEvents() {
		this.client.on('connected', () => {
			console.info(`LoxClient with ID ${this.appId} connected to Miniserver`);
			store.updateCredentials(this.hostUrl, this.username + ':' + this.passwd);
		});

		this.client.on('disconnected', () => {
			console.info('LoxClient disconnected from Miniserver');
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error(`LoxClient error: ${error.message}`, error);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on("event_value", (event: any) => {
			store.setState(event.detail.uuid.stringValue, event.detail.value);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on("event_text", (event: any) => {
			const text = event.detail.text;
			const objOrText = utils.isValidJSONObject(text) ? JSON.parse(text) : text;
			store.setState(event.detail.uuid.stringValue, objOrText);
		});
	}

	/**
	 * Send control state to Miniserver
	 * @param uuid unique ID of the control
	 * @param value value of the control
	 */
	async control(uuid: string, value: string) {
		if (this.isTest) {
			console.info('TEST control:', uuid, value);
			test.exec(uuid, value);
		} else {
			console.info('LoxClient control:', uuid, value);
			await this.client.control(uuid, value);
		}
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
	 * Disconnect Miniserver and token gets invalidated
	 */
	async disconnect() {
		await this.client.disconnect();
	}
}

export const loxWsClient = new LoxWsClient();
