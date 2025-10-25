import LoxClient from 'svelte-lox-client';
import { store } from '$lib/stores/store.svelte';
import { utils } from '$lib/helpers/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let loxWsClient: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const msConnect = async (env: any) => {

	loxWsClient = new LoxClient(env.MS_HOST, env.MS_USERNAME, env.MS_PASSWORD, env.APP_ID);

	// subscribe to basic events
	loxWsClient.on('connected', () => {
		console.info('LoxClient connected to Miniserver');
		store.updateHostUrl(env.MS_HOST);
		store.updateCredentials(env.MS_USERNAME + ':' + env.MS_PASSWORD);
	});

	loxWsClient.on('disconnected', () => {
		console.info('LoxClient disconnected from Miniserver');
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	loxWsClient.on('error', (error: any) => {
		console.error(`LoxClient error: ${error.message}`, error);
	});

	// initiate connection
	console.info('LoxClient connecting to miniserver...');
	await loxWsClient.connect();

	// get structure file
	console.info('LoxClient: Get structure file...');
	const structure = await loxWsClient.getStructureFile();
	store.initStructure(structure);

	loxWsClient.parseStructureFile();

	// initiates streaming of all events
	await loxWsClient.enableUpdates();

	// subscribe to value updates
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	loxWsClient.on("event_value", (event: any) => {
		store.setState(event.detail.uuid.stringValue, event.detail.value);
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	loxWsClient.on("event_text", (event: any) => {
		if (event.detail.uuid.stringValue == '0f5aea9c-030a-7bdf-ffff9fbd670c23f7')
			console.log('now');
		const text = event.detail.text;
		const objOrText = utils.isValidJSONObject(text) ? JSON.parse(text) : text;
		store.setState(event.detail.uuid.stringValue, objOrText);
	});
};

export const msControl = async (uuid: string, value: string) => {
	if (store.isTest) {
		console.info('TEST msControl:', uuid, value);
		//test.exec(uuid, topic, msg);
	} else {
		console.info('LoxClient msControl:', uuid, value);
		await loxWsClient.control(uuid, value);
	}
}
