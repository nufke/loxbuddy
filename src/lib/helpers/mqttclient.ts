import mqtt from 'mqtt';
import { structure, state, securedDetails, bellImages } from '$lib/stores/stores';

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
		topicPrefix + '/+/states',
		topicPrefix + '/+/structure',
		topicPrefix + '/#',
		topicPrefix + '/+/securedDetails',
		topicPrefix + '/+/lastBellEventImage/#'
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
	monitorLastBellEventImage(topic, msg);
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
		structure.set(JSON.parse(msg));
		serialNr = found[1];
		console.log('Miniserver registered', serialNr);
	}
}

function monitorInitialStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/states');
	const found = topic.match(regex);
	if (found && found[1]) {
		const regex2 = new RegExp(topicPrefix + '/' + found[1] + '/', 'g'); // TODO replace stored states at server 
		msg = msg.replace(regex2, '');
		state.set(JSON.parse(msg))
	}
}

function monitorSecuredDetails(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/securedDetails');
	const found = topic.match(regex);
	if (found && found[1]) {
		console.log('monitorSecuredDetails', found[1],msg);
		securedDetails.update((state) => state = { ...state, [found[1].split('/')[1]]: JSON.parse(msg) });
	}
}

function monitorLastBellEventImage(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/lastBellEventImage/(.*)');
	const found = topic.match(regex);
	if (found && found[1] && found[2]) {
		bellImages.update((state) => { 
			let events = state && state[found[1].split('/')[1]] ? state[found[1].split('/')[1]] : null;
			state = { ...state, [found[1].split('/')[1]]: { ...events, [found[2]]: msg }}; 
			return state;
		});
	}
}

function monitorStates(topic: string, msg: string) {
	const regex = new RegExp(topicPrefix + '/(.*)/(.*)');
	const found = topic.match(regex);
	if (found && found[1] && found[2]) {
		state.update((state) => state = { ...state, [found[2]]: msg });
	}
}
