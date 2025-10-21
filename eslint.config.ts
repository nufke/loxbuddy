import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: globals.browser }
	},
	tseslint.configs.recommended,
	globalIgnores([
		"!node_modules/", // unignore `node_modules/` directory
		"node_modules/*", // ignore its content
		"dist/**/*", // ignore the `dist/` directory
		"dist/*",		// ignore all contents under `dist/` directory
		".svelte-kit/*", // ignore all contents under `svelte-kit/` directory
	]),
]);
