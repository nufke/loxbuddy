import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { inlineSvg } from '@svelte-put/inline-svg/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	]
});
