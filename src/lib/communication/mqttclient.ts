import mqtt from 'mqtt';
import { store } from '$lib/stores/store.svelte';
import { weatherStore } from '$lib/stores/weather-store.svelte';
import { utils } from '$lib/helpers/utils';
import { test } from '$lib/test/test';

/**
 * Class to connect to MQTT Server
 */
export class MqttClient {
	client!: mqtt.MqttClient;
	hostname: string = '';
	port: number = 0;
	username: string = '';
	passwd: string = '';
	isTest: boolean = false;
	isConnected: boolean = false;
	topicPrefix: string = 'loxone'; 				// TODO configure prefix in GUI
	weatherPrefix: string = 'weather4lox'; 	// TODO configure prefix in GUI

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
	 * @param isTest flag defining if we run in test mode
	 */
	async connect(hostname: string, port: string, username: string, passwd: string, topicPrefix: string, isTest: boolean) {
		this.hostname = hostname;
		this.port = Number(port) || 1883;
		this.username = username;
		this.passwd = passwd;
		this.isTest = isTest;
		this.topicPrefix = topicPrefix;

		if (!username.length) {
			console.error('Invalid username, cannot connect to MQTT server');
		}

		if (!passwd.length) {
			console.error('Invalid password, cannot connect to MQTT server');
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
			console.error('MQTT client error ', error);
			this.client.end();
			this.isConnected = false; // throw error?
		});

		this.client.on('close', () => {
			console.info('MQTT client disconnected');
			this.isConnected = false;
			store.setMqttStatus(0); // diconnnect=grey
		});
	}

	/**
	 * Callback when client is connected to the MQTT server
	 */
	onConnect() {
		console.info('MQTT client connected\n');
		this.isConnected = true;
		store.setMqttStatus(1); // connect=green

		const registerTopics = [
			this.topicPrefix + '/#',
			this.weatherPrefix + '/#'
		];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.client.subscribe(registerTopics, function (error: any) {
			if (error) {
				console.error(error);
			} else {
				console.info(`MQTT client subscribed to topics '${registerTopics}'`);
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
		//console.info('MQTT: message received for topic ', topic);
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
		const serialNr = store.structure.msInfo.serialNr;
		const topic = this.topicPrefix + '/' + serialNr + '/' + uuid + '/cmd';
		if (this.isConnected && serialNr && !this.isTest) {
			console.info('MQTT client publish:', topic, msg);
			this.client.publish(topic, msg, { retain, qos });
		} else {
			console.info('TEST publish:', topic, msg);
			test.exec(uuid, topic, msg);
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
			store.initStructure(JSON.parse(msg));
			const serialNr = store.structure.msInfo.serialNr;
			if (serialNr == found[1]) {
				console.info('Miniserver registered: ', serialNr);
			} else {
				console.error('Miniserver serialNr mismatch between topic and structure: ', serialNr, found[1]);
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
			store.setInitialStates(JSON.parse(msg));
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
			//console.log('setState: ', found[2], obj);
			store.setState(found[2], obj);
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
			//console.log('setObservation: ', found[1], msg);
			weatherStore.setObservation(found[1], msg);
		}
	}
}

export const mqttClient = new MqttClient();
