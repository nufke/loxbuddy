import mqtt from 'mqtt';
import { store } from '$lib/stores/store.svelte';
import { weatherStore } from '$lib/stores/weather-store.svelte';
import { utils } from '$lib/helpers/utils';
import { test } from '$lib/test/test';

let connected: boolean;
let topicPrefix = 'loxone'; // TODO configure prefix in GUI
const weatherPrefix = 'weather4lox'; // TODO configure prefix in GUI

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let mqttclient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mqttConnect = (env: any) => {
	const mqttOptions = {
		hostname: env.MQTT_HOSTNAME || 'localhost',
		port: env.MQTT_PORT ? parseInt(env.MQTT_PORT) : 1883,
		connectTimeout: 5000,
		username: env.MQTT_USERNAME,
		password: env.MQTT_PASSWORD
	}

	if (env.MQTT_TOPIC) {
		topicPrefix = env.MQTT_TOPIC;
	}

	mqttclient = mqtt.connect(mqttOptions);
	mqttclient.on('connect', onConnect);

	mqttclient.on('message', onMessage);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mqttclient.on('error', (error: any) => {
		console.error('MQTT error ', error);
		mqttclient.end();
		connected = false;
		//throw error
	});

	mqttclient.on('close', () => {
		console.log('MQTT disconnected');
		connected = false;
		store.setMqttStatus(0); // diconnnect=grey
	});
}

const onConnect = () => {
	console.log('MQTT: connected\n');
	connected = true;
	store.setMqttStatus(1); // connect=green
	const registerTopics = [
		topicPrefix + '/#',
		weatherPrefix + '/#'
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mqttclient.subscribe(registerTopics, function (error: any) {
		if (error) {
			console.error(error);
		} else {
			console.log(`MQTT subscribed to topics '${registerTopics}'`);
		}
	});
};

//TODO check type of arguments
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onMessage = (topic: string, message: any) => {
	//console.log('MQTT: message received for topic ', topic);
	const msg = message.toString();
	monitorStructure(topic, msg);
	monitorInitialStates(topic, msg);
	monitorStates(topic, msg);
	monitorWeatherStates(topic, msg);
};

export async function reconnect() {
	mqttclient.reconnect();
}

export const publishTopic = (uuid: string, msg: string, retain: boolean = false) => {
	console.log('publishTopic disabled')
	/*
	const qos = 1; // TODO add to configuration?
	const serialNr = store.structure.msInfo.serialNr;
	const topic = topicPrefix + '/' + serialNr + '/' + uuid + '/cmd';
	if (connected && serialNr && !store.isTest) {
		console.log('MQTT publish:', topic, msg);
		mqttclient.publish(topic, msg, { retain, qos });
	} else {
		console.log('TEST publish:', topic, msg);
		test.exec(uuid, topic, msg);
	}
		*/
};

function monitorStructure(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/structure');
	const found = topic.match(regex);
	if (found && found[1]) {
		store.initStructure(JSON.parse(msg));
		const serialNr = store.structure.msInfo.serialNr;
		if (serialNr == found[1]) {
			console.log('Miniserver registered: ', serialNr);
			console.log('Query all initial states for miniserver: ', serialNr);
			publishTopic('states', '1'); // get initial states
			publishTopic('systemStatus', '1'); // get system status
		} else {
			console.log('Miniserver serialNr mismatch between topic and structure: ', serialNr, found[1]);
		}
 	}
}

function monitorInitialStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/states');
	const found = topic.match(regex);
	if (found && found[1]) {
		const regex2 = new RegExp(topicPrefix + '/' + found[1] + '/', 'g'); // TODO replace stored states at server 
		msg = msg.replace(regex2, '');
		store.setInitialStates(JSON.parse(msg));
	}
}

function monitorStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.+)/(.*)');
	const found = topic.match(regex);
	if (found && found[1] && found[2]) {
		const obj = utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg;
		//console.log('setState: ', found[2], obj);
		store.setState(found[2], obj);
	}
}

function monitorWeatherStates(topic: string, msg: string) {
	const regex = new RegExp(weatherPrefix + '/(.+)');
	const found = topic.match(regex);
	if (found && found[1] && /current|daily|hourly/.test(found[1]) ) {
		//console.log('setObservation: ', found[1], msg);
		weatherStore.setObservation(found[1], msg);
	}
}
