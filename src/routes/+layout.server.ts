import { env } from '$env/dynamic/private'

/**
 * Server side loading of data, used to get some non-private (!!)
 * environment variables
 */
export async function load() {
	const data = {
		env: env
	}
	return data; // WARNING  to not expose private envs !!
}
