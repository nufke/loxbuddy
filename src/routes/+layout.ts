import { browser } from '$app/environment';
import '$lib/i18n'; // Import to initialize.
import { locale, waitLocale } from 'svelte-i18n';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language);
	}
	await waitLocale();
}

// disable SSR
export const ssr = false;
