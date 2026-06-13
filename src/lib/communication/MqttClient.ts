import mqtt from 'mqtt';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { utils } from '$lib/helpers/Utils';

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

	/**
	 * Constructor is empty as we initialize the MQTT server after reading the environment variables.
	 * Instead we use the connect method to initialize the MQTT client.
	 */
	constructor() {
	}

	/**
	 * Establish connection to MQTT server. If no arguments are given, then use the MqttCredentials
	 * from localStorage.
	 * @param hostName (optional) IP address of MQTT server and port
	 * @param port (optional) port of MQTT server
	 * @param userName (optional) Name of the user
	 * @param passwd (optional) Password of the user
	 * @param topicPrefix (optional) Subscribed topic prefix
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

		if (!this.hostName.length) {
			console.error('[MqttClient] Invalid hostname, cannot connect to MQTT server.');
			return;
		}

		if (!this.passwd.length) {
			console.error('[MqttClient] Invalid password, cannot connect to MQTT server.');
			return;
		}

		if (!this.passwd.length) {
			console.error('[MqttClient] Invalid password, cannot connect to MQTT server.');
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
	 * Listen to MQTT server events, such as connection status and messages
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
	 * Callback when client is connected to the MQTT server
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
	 * Callback when message is received
	 * @param topic Received MQTT topic 
	 * @param message Received message for this MQTT topic
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onMessage(topic: string, message: any): void {
		//console.info('[MqttClient] Message received for topic ', topic);
		const msg = message.toString();
		this.monitorStructure(topic, msg);
		this.monitorInitialStates(topic, msg);
		this.monitorStates(topic, msg);
	};

	/**
	 * Publish MQTT message
	 * @param uuid Unique ID of the control
	 * @param msg Message
	 * @param retain flag to retain message in MQTT server (default: false)
	 */
	publishTopic(uuid: string, msg: string, retain: boolean = false): void {
		const qos = 1; // TODO add to configuration?
		const serialNr = controlStore.msInfo.serialNr;
		const topic = this.topicPrefix + '/' + serialNr + '/' + uuid + '/cmd';
		if (this.isConnected && serialNr) {
			console.info('[MqttClient] published:', topic, msg);
			this.client.publish(topic, msg, { retain, qos });
		}
	}

	/**
	 * Monitor MQTT structure
	 * @param topic Incoming topic
	 * @param msg Incoming mesage
	 */
	monitorStructure(topic: string, msg: string): void {
		const regex = new RegExp(this.topicPrefix + '/(.*)/structure');
		const found = topic.match(regex);
		if (found && found[1]) {
			const serialNr = controlStore.msInfo.serialNr;
			if (serialNr == found[1]) {
				console.info('[MqttClient] Miniserver structure received for serialNr: ', serialNr);
				controlStore.initStructure(JSON.parse(msg), this);
			} else {
				console.error('[MqttClient] Miniserver serialNr mismatch between topic and structure: ', serialNr, found[1]);
			}
 		}
	}

	/**
	 * Monitor MQTT initial states
	 * @param topic Incoming topic
	 * @param msg Incoming mesage
	 */
	monitorInitialStates(topic: string, msg: string): void {
		const regex = new RegExp(this.topicPrefix + '/(.*)/states');
		const found = topic.match(regex);
		if (found && found[1]) {
			const regex2 = new RegExp(this.topicPrefix + '/' + found[1] + '/', 'g'); // TODO replace stored states at server 
			msg = msg.replace(regex2, '');
			controlStore.setInitialStates(JSON.parse(msg));
		}
	}

	/**
	 * Monitor MQTT individual states
	 * @param topic Incoming topic
	 * @param msg Incoming mesage
	 */
	monitorStates(topic: string, msg: string): void {
		const regex = new RegExp(this.topicPrefix + '/(.+)/(.*)');
		const found = topic.match(regex);
		if (found && found[1] && found[2]) {
			const obj = utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg;
			//console.debug('[MqttClient] setState: ', found[2], obj);
			controlStore.setState(found[2], obj);
		}
	}

	/**
	 * Send control state over MQTT
	 * @param uuid universally unique ID of the control
	 * @param value value of the control
	 * @param visuPw (optional) visualization password for secured controls
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
	 * @param filename filename
	 */
	async getFile(fileName: string): Promise<void> {
		// TODO
	}

	/**
	 * Dummy placeholder to store user settings (e.g. sorting/order of controls)
	 */
	setUserSettings(settings: string): void {
		console.info('[MqttClient] setUserSettings not yet implemented', JSON.parse(settings));
	}

	/**
	 * Dummy placeholder to retrieve user settings (e.g. sorting/order of controls)
	 */
	getUserSettings(): void {
		console.info('[MqttClient] getUserSettings not yet implemented');
	}

	/**
	 * Dummy placeholder to fetch information
	 * @param url endpoint?
	*/
	async fetch(url: string): Promise<Response> {
		return fetch(url); // TODO
	}

}

export const mqttClient = new MqttClient();
