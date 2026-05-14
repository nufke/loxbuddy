import { browser } from '$app/environment';
import '$lib/i18n'; // Import to initialize.
import { locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';
import { nl, enGB, de } from 'date-fns/locale';
import { setDefaultOptions, type Locale } from 'date-fns';
import { iconStore } from '$lib/stores/LbIconStore.svelte';

/**
 * Initialize locale, date formatting, and icon store on app load
 */
export const load: LayoutLoad = async () => {
	let localeSettings = localStorage.getItem('locale') || '';
	if (browser && localeSettings.length == 0) {
		localeSettings = window.navigator.language;
		localStorage.setItem('locale', localeSettings);
	}
	setDefaultOptions({ locale: getDateLocale(localeSettings) });
	await waitLocale();
	locale.set(localeSettings);

	// pre-load icons
	iconStore.registerIcons();
}

/**
 * Helper function to get the Locale based on the given string
 * @param locale Locale specified as string
 * @returns Locale as type
 */
function getDateLocale(locale: string): Locale {
	console.info('[routes] Webkit Locale:', locale);
	switch (locale) {
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
