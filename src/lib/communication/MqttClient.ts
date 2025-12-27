import mqtt from 'mqtt';
import { appStore } from '$lib/stores/LbAppStore.svelte';
import { controlStore } from '$lib/stores/LbControlStore.svelte';
import { weatherStore } from '$lib/stores/LbWeatherStore.svelte';
import { utils } from '$lib/helpers/Utils';

/**
 * Class to connect to MQTT Server
 */
export class MqttClient {
	private client!: mqtt.MqttClient;
	private hostname: string = '';
	private port: number = 0;
	private username: string = '';
	private passwd: string = '';
	private isConnected: boolean = false;
	private topicPrefix: string = 'loxone'; 				// TODO configure prefix in GUI
	private weatherPrefix: string = 'weather4lox'; 	// TODO configure prefix in GUI

	/** 
	 * Constructor is empty as we initialize the MQTT server after reading the environment variables.
	 * Instead we use the connect method to initialize the MQTT client
	 */
	constructor() {
	}

	/**
	 * Establish connection to MQTT server
	 * @param hostname IP address of MQTT server and port
	 * @param hostname port of MQTT server
	 * @param username Name of the user
	 * @param passwd Password of the user
	 */
	async connect(hostname: string, port: string, username: string, passwd: string, topicPrefix: string) {
		this.hostname = hostname;
		this.port = Number(port) || 1883;
		this.username = username;
		this.passwd = passwd;
		this.topicPrefix = topicPrefix;

		if (!username.length) {
			console.error('[MqttClient] Invalid username, cannot connect to MQTT server');
		}

		if (!passwd.length) {
			console.error('[MqttClient] Invalid password, cannot connect to MQTT server');
		}

		this.client = mqtt.connect({
			hostname: hostname,
			port: Number(port),
			connectTimeout: 5000,
			username: username,
			password: passwd
		});

		this.registerEvents();
	}

	/**
	 * Listen to MQTT server events, such as connection status and messages
	 */
	registerEvents() {
		this.client.on('connect', () => this.onConnect());
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('message', (topic: string, message: any) => this.onMessage(topic, message));

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.on('error', (error: any) => {
			console.error('[MqttClient] error ', error);
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
	onConnect() {
		console.info('[MqttClient] Connected\n');
		this.isConnected = true;
		appStore.mqttStatus = 1; // connected=green

		const registerTopics = [
			this.topicPrefix + '/#',
			this.weatherPrefix + '/#'
		];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.subscribe(registerTopics, function (error: any) {
			if (error) {
				console.error('[MqttClient] subscribe error', error);
			} else {
				console.info(`[MqttClient]  Client subscribed to topics '${registerTopics}'`);
			}
		});
	}

	/**
	 * Callback when message is received
	 * @param topic Received MQTT topic 
	 * @param message Received message for this MQTT topic
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private onMessage(topic: string, message: any) {
		//console.info('[MqttClient] Message received for topic ', topic);
		const msg = message.toString();
		this.monitorStructure(topic, msg);
		this.monitorInitialStates(topic, msg);
		this.monitorStates(topic, msg);
		this.monitorWeatherStates(topic, msg);
	};

	/**
	 * Publish MQTT message
	 * @param uuid Unique ID of the control
	 * @param msg Message
	 * @param retain flag to retain message in MQTT server (default: false)
	 */
	publishTopic(uuid: string, msg: string, retain: boolean = false) {
		const qos = 1; // TODO add to configuration?
		const serialNr = controlStore.structure.msInfo.serialNr;
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
	monitorStructure(topic: string, msg: string) {
		const regex = new RegExp(this.topicPrefix + '/(.*)/structure');
		const found = topic.match(regex);
		if (found && found[1]) {
			controlStore.initStructure(JSON.parse(msg), this);
			const serialNr = controlStore.structure.msInfo.serialNr;
			if (serialNr == found[1]) {
				console.info('[MqttClient] Miniserver registered: ', serialNr);
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
	monitorInitialStates(topic: string, msg: string) {
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
	monitorStates(topic: string, msg: string) {
		const regex = new RegExp(this.topicPrefix + '/(.+)/(.*)');
		const found = topic.match(regex);
		if (found && found[1] && found[2]) {
			const obj = utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg;
			//console.debug('[MqttClient] setState: ', found[2], obj);
			controlStore.setState(found[2], obj);
		}
	}

	/**
	 * Monitor MQTT Weather4Lox updates
	 * @param topic Incoming topic
	 * @param msg Incoming mesage
	 */
	monitorWeatherStates(topic: string, msg: string) {
		const regex = new RegExp(this.weatherPrefix + '/(.+)');
		const found = topic.match(regex);
		if (found && found[1] && /current|daily|hourly/.test(found[1]) ) {
			weatherStore.setObservation(found[1], msg);
		}
	}
}

export const mqttClient = new MqttClient();
