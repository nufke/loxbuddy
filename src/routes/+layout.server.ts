import { env } from '$env/dynamic/private'

export async function load() {
	const data = {
		test: (env.TEST == "1") ? true : false,
		mqtt: {
			MQTT_HOSTNAME: env.MQTT_HOSTNAME,
			MQTT_PORT: env.MQTT_PORT,
			MQTT_USERNAME: env.MQTT_USERNAME,
			MQTT_PASSWORD: env.MQTT_PASSWORD,
			MQTT_TOPIC: env.MQTT_TOPIC
		},
		miniserver: {
			MS_HOST: env.MS_HOST,
			MS_USERNAME: env.MS_USERNAME,
			MS_PASSWORD: env.MS_PASSWORD,
			APP_ID: env.APP_ID
		}
	}
  return data;
}
