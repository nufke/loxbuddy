import { env } from '$env/dynamic/private'

export async function load() {
	const data = {
		mqtt: {
			MQTT_HOSTNAME: env.MQTT_HOSTNAME,
			MQTT_PORT: env.MQTT_PORT,
			MQTT_USERNAME: env.MQTT_USERNAME,
			MQTT_PASSWORD: env.MQTT_PASSWORD
		}
	}
  return data;
}
