import mqtt from 'mqtt';
import { store } from '$lib/stores/store.svelte';
import { Utils } from '$lib/helpers/utils';

let connected: boolean;
let serialNr: string;  // TODO support multiple miniservers
let topicPrefix = 'loxone'; // TODO configure prefix in GUI

export let mqttclient: any = null;

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

	mqttclient.on('error', (error: any) => {
		console.log('error.name', error.name);
		mqttclient.end();
		connected = false;
		//throw error
	});

	mqttclient.on('close', () => {
		console.log('MQTT disconnected');
		connected = false;
	});
}

const onConnect = () => {
	console.log('MQTT: connected\n');
	connected = true;
	const registerTopics = [
		topicPrefix + '/#'
	];

	registerTopics.forEach((topic) => {
		mqttclient.subscribe(topic, function (err: any) {
			if (err) {
				console.error(err);
			} else {
				console.log(`MQTT subscribed on topic '${topic}'`);
			}
		});
	});
};

//TODO check type of arguments
const onMessage = (topic: string, message: any) => {
	//console.log('MQTT: message received\n');
	const msg = message.toString();
	monitorStructure(topic, msg);
	monitorInitialStates(topic, msg);
	monitorSecuredDetails(topic, msg);
	monitorLastBellEventImages(topic, msg);
	monitorStates(topic, msg);
};

export async function reconnect() {
	mqttclient.reconnect();
}

export const publishTopic = (uuid: string, msg: string, retain: boolean = false) => {
	const qos = 1; // TODO add to configuration?
	if (connected && serialNr) {
		const topic = topicPrefix + '/' + serialNr + '/' + uuid + '/cmd';
		console.log('MQTT publish:', topic, msg);
		mqttclient.publish(topic, msg, { retain, qos });
	}
};

function monitorStructure(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/structure');
	const found = topic.match(regex);
	if (found && found[1]) {
		store.initStructure(JSON.parse(msg));
		serialNr = found[1];
		console.log('Miniserver registered: ', serialNr);
		console.log('Query all initial states for miniserver: ', serialNr);
		publishTopic('states', '1');
	}
}

function monitorInitialStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/states');
	const found = topic.match(regex);
	if (found && found[1]) {
		const regex2 = new RegExp(topicPrefix + '/' + found[1] + '/', 'g'); // TODO replace stored states at server 
		msg = msg.replace(regex2, '');
		store.setInitialStates(JSON.parse(msg))
	}
}

function monitorSecuredDetails(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/securedDetails');
	const found = topic.match(regex);
	if (found && found[1]) {
		let obj = JSON.parse(msg);
		store.setSecuredDetails(found[1].split('/')[1], obj);
	}
}

function monitorLastBellEventImages(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/lastBellEventImage/(.*)');
	const found = topic.match(regex);
	if (found && found[1] && found[2]) {
		const uuid = found[1].split('/')[1];
		const date = found[2];
		store.setLastBellEventImage(uuid, date, msg);
	}
}

function monitorStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.+)/(.*)');
	const found = topic.match(regex);
	if (found && found[1] && found[2]) {
		//console.log('setState: ', found[2], msg);
		let obj = Utils.isValidJSONObject(msg) ? JSON.parse(msg) : msg;
		store.setState(found[2], obj);
	}
}
