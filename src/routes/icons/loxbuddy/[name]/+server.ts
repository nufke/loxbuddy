import type { RequestHandler } from './$types';
import { getIcon } from '@iconify/svelte';
import { registerCustomIcons } from '$lib/helpers/registerIcons';
import { error } from '@sveltejs/kit';

registerCustomIcons();

export const GET: RequestHandler = ({ params, url }) => {
	const name = params.name.replace(/\.svg$/, '');
	const icon = getIcon(`loxbuddy:${name}`);

	if (!icon) error(404, `Icon loxbuddy:${name} not found`);

	const { body, width: iconWidth = 24, height: iconHeight = 24, left = 0, top = 0 } = icon;

	const heightParam = Number(url.searchParams.get('height'));
	const color = url.searchParams.get('color');

	const renderHeight = heightParam > 0 ? heightParam : iconHeight;
	const renderWidth = Math.round((iconWidth / iconHeight) * renderHeight);

	const svgBody = color ? body.replace(/currentColor/g, color) : body;
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${iconWidth} ${iconHeight}" width="${renderWidth}" height="${renderHeight}">${svgBody}</svg>`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
