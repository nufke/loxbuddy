import { env } from '$env/dynamic/private'

export async function load() {
	const data = {
		env: env
	}
  return data;
}
