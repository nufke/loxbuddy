import { browser } from '$app/environment';
import '$lib/i18n'; // Import to initialize.
import { locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';
import { nl, enGB, de } from 'date-fns/locale'
import { setDefaultOptions } from 'date-fns'

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language);
		setDefaultOptions({ locale: getDateLocale(window.navigator.language) })
	}
	await waitLocale();
}

function getDateLocale(s: string) {
	console.log('Webkit Locale:', window.navigator.language);
	switch (window.navigator.language) {
		case 'nl':
		case 'nl-BE':
		case 'nl-NL': return nl;
		case 'en':
		case 'en-GB': return enGB;
		case 'de':
		case 'de-AT':
		case 'de-DE': return de;
		default: return enGB;
	};
}

// disable SSR
export const ssr = false;
