import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const lang = event.request.headers.get('accept-language')?.split(',')[0];
	if (lang) {
		const { locale } = await import('svelte-i18n');
		locale.set(lang);
	}
	return resolve(event);
}
