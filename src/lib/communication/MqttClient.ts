import mqtt from 'mqtt';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { iconStore } from '$lib/stores/LbIconStore.svelte';
import { utils } from '$lib/helpers/Utils';
import type { UserSettings, InitialStateMap } from '$lib/types/models';
import loxiconmap from '$lib/helpers/lox2iconify.json';

type MessageHandler = (msg: string, match: RegExpMatchArray) => void;

/**
 * Class to connect to MQTT Server
 */
export class MqttClient {
	private client!: mqtt.MqttClient;
	private hostName: string = '';
	private port: number = 0;
	private userName: string = '';
	private passwd: string = '';
	private isConnected: boolean = false;
	private topicPrefix: string = 'loxone'; 				// TODO configure prefix in GUI
	private registeredTopics: string[] = [];
	private messageHandlers: Array<[RegExp, MessageHandler]> = [];

	/**
	 * Constructor is empty as we initialize the MQTT server after reading the environment variables.
	 * Instead we use the connect method to initialize the MQTT client.
	 */
	constructor() {
	}

	/**
	 * Establish connection to MQTT server. If no arguments are given, then use the MqttCredentials
	 * from localStorage.
	 *
	 * @param hostName - (optional) IP address of MQTT server and port
	 * @param port - (optional) port of MQTT server
	 * @param userName - (optional) Name of the user
	 * @param passwd - (optional) Password of the user
	 * @param topicPrefix - (optional) Subscribed topic prefix
	 */
	async connect(
		hostName?: string,
		port?: string,
		userName?: string,
		passwd?: string,
		topicPrefix?: string
	): Promise<void> {
		const cred = appStore.mqttCredentials;
		this.hostName = hostName ?? cred?.hostName ?? '';
		this.port = Number(port ?? cred?.port) || 9001;
		this.userName = userName ?? cred?.userName ?? '';
		this.passwd = passwd ?? cred?.password ?? '';
		this.topicPrefix = topicPrefix ?? cred?.topicPrefix ?? 'loxone';
		this.registeredTopics = this.topicPrefix.split(',').map((item) => item + '/#');
		this.buildMessageHandlers();

		if (!this.hostName.length) {
			console.error('[MqttClient] Hostname not given, cannot connect to MQTT server.');
			return;
		}

		if (!this.userName.length) {
			console.error('[MqttClient] Username not given, cannot connect to MQTT server.');
			return;
		}

		if (!this.passwd.length) {
			console.error('[MqttClient] Password not given, cannot connect to MQTT server.');
			return;
		}

		this.client = mqtt.connect({
			hostname: this.hostName,
			port: Number(this.port),
			connectTimeout: 5000,
			reconnectPeriod: 0,
			username: this.userName,
			password: this.passwd
		});

		this.registerEvents();
	}

	/**
	 * Listen to MQTT server events, such as connection status and messages.
	 */
	registerEvents(): void {
		this.client.on('connect', () => this.onConnect());
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('message', (topic: string, message: any) => this.onMessage(topic, message));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error('[MqttClient] error', error);
			this.client.end();
			this.isConnected = false; // throw error?
		});

		this.client.on('close', () => {
			console.info('[MqttClient] disconnected');
			this.isConnected = false;
			appStore.mqttStatus = 0; // diconnnect
		});
	}

	/**
	 * Callback when client is connected to the MQTT server.
	 */
	onConnect(): void {
		console.info('[MqttClient] Connected');
		this.isConnected = true;
		appStore.mqttStatus = 1; // connected=green
		const topics = this.registeredTopics;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.subscribe(this.registeredTopics, (error: any) => {
			if (error) {
				console.error('[MqttClient] subscribe error', error);
			} else {
				console.info(`[MqttClient] Client subscribed to topics '${topics}'`);
			}
		});
	}

	/**
	 * Build the map of regex patterns to message handler callbacks.
	 * Called once after topicPrefix is set.
	 */
	private buildMessageHandlers(): void {
		this.messageHandlers = [
			[new RegExp(this.topicPrefix + '/(.*)/structure'), (m, match) => this.updateStructure(m, match)],
			[new RegExp(this.topicPrefix + '/(.*)/states'),   (m, match) => this.updateInitialStates(m, match)],
			[new RegExp(this.topicPrefix + '/(.*)/icons'),   (m, match) => this.updateIcons(m, match)],
			[new RegExp(this.topicPrefix + '/(.*)/(.*)'),     (m, match) => this.updateState(m, match)],
		];
	}

	/**
	 * Callback when message is received. Dispatches to the matching handler(s).
	 *
	 * @param topic - Received MQTT topic
	 * @param message - Received message for this MQTT topic
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onMessage(topic: string, message: any): void {
		const msg = message.toString();
		console.debug('[MqttClient] MQTT message received: ', topic, msg);
		for (const [regex, handler] of this.messageHandlers) {
			const match = topic.match(regex);
			if (match) {
				handler(msg, match);
				break;
			}
		}
	};

	/**
	 * Check given serial number (part of MQTT topic) with the currently
	 * active serialNr of the Miniserver registered in the controlStore.
	 * In case they match, true is returned, otherwise false.
	 *
	 * @param snr - received serial number in MQTT topic
	 * @returns true if serial numbers match, otherwise return false
	 */
	checkSerialNr(snr: string): boolean {
		const serialNr = controlStore.msInfo.serialNr;
		if (snr !== serialNr) {
			console.debug(`[MqttClient] serial number in topic ${snr} not equal to connected Miniserver with serial nr ${serialNr}.`);
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Publish MQTT message
	 *
	 * @param uuid - Unique ID of the control
	 * @param msg - Message
	 * @param retain - flag to retain message in MQTT server (default: false)
	 */
	publishTopic(uuid: string, msg: string, retain: boolean = false): void {
		const qos = 1; // TODO add to configuration?
		const serialNr = controlStore.msInfo.serialNr;
		const topic = `${this.topicPrefix}/${serialNr}/${uuid}/cmd`;
		if (this.isConnected && serialNr) {
			console.info('[MqttClient] published:', topic, msg);
			this.client.publish(topic, msg, { retain, qos });
		}
	}

	/**
	 * Update structure
	 *
	 * @param msg - Incoming message
	 * @param match - Regex match result from the message handler map
	 */
	private updateStructure(msg: string, match: RegExpMatchArray): void {
		if (!match[1]) return;
		if (this.checkSerialNr(match[1])) {
			console.info('[MqttClient] Miniserver structure received for serialNr: ', match[1]);
			controlStore.initStructure(JSON.parse(msg), this);
		}
	}

	/**
	 * Update initial states
	 *
	 * @param msg - Incoming message
	 * @param match - Regex match result from the message handler map
	 */
	private updateInitialStates(msg: string, match: RegExpMatchArray): void {
		if (!match[1] || this.checkSerialNr(match[1])) return;
		const states = JSON.parse(msg) as InitialStateMap;
		controlStore.setInitialStates(states);
	}

	/**
	 * Update individual state
	 *
	 * @param msg - Incoming message
	 * @param match - Regex match result from the message handler map
	 */
	private updateState(msg: string, match: RegExpMatchArray): void {
		if (!match[1] || !match[2] || this.checkSerialNr(match[1])) return;
		const obj = utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg;
		controlStore.setState(match[2], obj);
	}

	/**
	 * Update icons
	 *
	 * @param msg - Incoming message
	 * @param match - Regex match result from the message handler map
	 */
	private updateIcons(msg: string, match: RegExpMatchArray): void {
		if (!match[1] || this.checkSerialNr(match[1])) return;
		const icons = utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg
		if (msg.length && Object.keys(icons).length) {
			console.debug('[MqttClient] icon map updated', icons);
			iconStore.registerIcons(icons);
		} else {
			console.debug('[MqttClient] flush user-defined icons');
			iconStore.registerIcons(loxiconmap); // update store with defaults
		}
	}

	/**
	 * Send control state over MQTT
	 *
	 * @param uuid - universally unique ID of the control
	 * @param value - value of the control
	 * @param visuPw - (optional) visualization password for secured controls
	 */
	async control(uuid: string, value: string, visuPw?: string): Promise<void> {
		console.info('[MqttClient] Send / publish control:', uuid, value);
		this.client.publish(uuid, value);
	}

	/**
	 * Disconnect MQTT client
	 */
	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.endAsync();
		}
	}

	/**
	 * Dummy placeholder
	 *
	 * @param filename - filename
	 */
	async getFile(fileName: string): Promise<void> {
		// TODO
	}

	/**
	 * Dummy placeholder to store user settings (e.g. sorting/order of controls).
	 *
	 * @param settings - user settings of type UserSettings
	 */
	async setUserSettings(settings: UserSettings): Promise<void> {
		console.info('[MqttClient] setUserSettings not yet implemented for MQTT', settings);
	}

	/**
	 * Dummy placeholder to retrieve user settings (e.g. sorting/order of controls).
	 */
	async getUserSettings(): Promise<void> {
		console.info('[MqttClient] getUserSettings not yet implemented for MQTT');
	}

	/**
	 * Dummy placeholder to fetch information
	 * @param url - url endpoint
	*/
	async fetch(url: string): Promise<Response> {
		return fetch(url); // TODO
	}

}

export const mqttClient = new MqttClient();
