import { addCollection } from '@iconify/svelte';

/**
 * Register LoxBuddy icons using Iconify API
 */
export function registerIcons() {

	// add 14x14 icons
	addCollection({
		prefix: 'loxbuddy',
		icons: {
			'table-lamp': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M6.5 3V1.5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1V3a4 4 0 0 0-2 3.5h8a4 4 0 0 0-2-3.5"/><path d="M6.5 1.5H8a4 4 0 0 1 4 4v8m1.5 0h-6"/></g>'
			},
			'clean-broom-wipe': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1"><path d="M3.932 7.962L6.922.6m4.183 12.79h2.28m-3.553-2.47h2.28M8.376 8.462h2.28"/><path stroke-linejoin="round" d="M6.421 10.217c0-1.392-1.398-2.133-2.33-2.232c-2.642-.28-3.521 2.03-3.473 3.969c.022.868.815 1.435 1.684 1.435h6.543c-.466 0-2.424-.94-2.424-3.172"/></g>'
			},
			'square-clock': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M7 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8"/><path d="M7 5.5V7h1.5"/><path d="M12.5.5h-11a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-11a1 1 0 0 0-1-1"/></g>'
			},
			'serving-dome-hand': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M6.066 4.312c0-.91.335-1.78.93-2.423A3.06 3.06 0 0 1 9.237.885c.842 0 1.648.36 2.243 1.004a3.57 3.57 0 0 1 .93 2.423m-6.978 0c2.868.317 4.53.33 7.613 0M.854 6.37l.713-.045a8 8 0 0 1 2.448.227l1.184.299c.643.161 1.07.77 1.001 1.43v0A1.335 1.335 0 0 1 4.638 9.46l-1.117-.2l3.938.706l4.078-.968a1.25 1.25 0 0 1 1.498.897v0a1.25 1.25 0 0 1-.738 1.48L9.035 12.7a7 7 0 0 1-4.97.113L.682 11.615" stroke-width="1"></path>'
			},
			'politics-speech': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M7 3.77A1.604 1.604 0 1 0 7 .564A1.604 1.604 0 0 0 7 3.77M1.959 6.979H12.04m-9.165 0l.459 6.416m7.791-6.416l-.459 6.416M7 8.59l.59 1.195l1.318.192l-.954.93l.225 1.313L7 11.6l-1.18.62l.226-1.313l-.954-.93l1.318-.192zM10 7a3 3 0 0 0-6 0" stroke-width="1"></path>'
			},
			'toilet-man-woman-1': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M.747 7.693a2.445 2.445 0 0 1 2.395-2.938v0a2.445 2.445 0 0 1 2.394 2.938l-.892 4.333a1.534 1.534 0 0 1-1.502 1.224v0a1.534 1.534 0 0 1-1.503-1.224zm9.44-2.938c-1.193 0-1.885.75-2.377 1.778c-.351.736-.576 1.683-.676 2.56c-.062.549.388.997.94.997h.352l.31 1.926a1.467 1.467 0 0 0 2.898 0l.31-1.926h.355c.553 0 1.003-.448.941-.997c-.1-.877-.324-1.824-.676-2.56c-.492-1.028-1.184-1.778-2.377-1.778"/><path d="M3.142 4.755c1.28 0 2.002-.721 2.002-2.002C5.144 1.47 4.423.75 3.142.75C1.86.75 1.14 1.47 1.14 2.753c0 1.28.72 2.002 2.002 2.002m7.045 0c1.281 0 2.002-.721 2.002-2.002c0-1.282-.72-2.002-2.002-2.002s-2.002.72-2.002 2.002c0 1.28.72 2.002 2.002 2.002"/></g>'
			},
			'webcam-video': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.82 3.75L10 5V3.5a1 1 0 0 0-1-1H1.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1V9l2.82 1.25a.5.5 0 0 0 .68-.47V4.22a.5.5 0 0 0-.68-.47" stroke-width="1"></path>'
			},
			'pool-ladder': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M13.5 13.5H13a2 2 0 0 1-2-2a2 2 0 0 1-4 0a2 2 0 0 1-4 0a2 2 0 0 1-2 2H.5m2-11a2 2 0 1 1 4 0v7m3-9a2 2 0 0 1 2 2v7m-5-5h5m-5 3h5" stroke-width="1"></path>'
			},
			'store-2': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M1.5 8.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8.5M13 6H1a.5.5 0 0 1-.5-.5v-2l1.22-2.45a1 1 0 0 1 .9-.55h8.76a1 1 0 0 1 .9.55L13.5 3.5v2a.5.5 0 0 1-.5.5M8 8.5v5M1.5 10H8M.5 3.5h13" stroke-width="1"></path>'
			},
			'database-refresh': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M6 4.74c3.038 0 5.5-.95 5.5-2.12S9.038.5 6 .5S.5 1.45.5 2.62S2.962 4.74 6 4.74M11.5 6V2.62"/><path d="M.5 2.62v6.76c0 1.043 1.94 1.877 4.5 2.076"/><path d="M6 8.08C3 8.12.5 7.17.5 6m12.9 5.369l-.841.635l-.636-.84"/><path d="M12.512 11.941q.212-.402.272-.879a2.58 2.58 0 0 0-3.52-2.706M7.045 10.17l.84-.635l.637.84"/><path d="M7.932 9.599a2.58 2.58 0 0 0 3.25 3.585"/></g>'
			},
			'spray-paint': {
				body: `<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.5 4.5h-4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1M3.5 2v2.5m5-3l5-1m-5 3l5 1M2.5 2h2" stroke-width="1"></path>`
			},
			'volume-down': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M3 5H1.5c-.545 0-1 .455-1 1v2c0 .545.455 1 1 1H3l3.91 2.81c.645.447 1.573-.024 1.59-.81V3A.954.954 0 0 0 7 2.19zm7.5 2h3" stroke-width="1"></path>'
			},
			'volume-level-high': {
				body: '<path fill="none" stroke-width="1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M12.495 10.5a6.9 6.9 0 0 0 1-3.5a6.9 6.9 0 0 0-1-3.5m-1.995 2c.348.42.526.955.5 1.5a2.2 2.2 0 0 1-.5 1.5M3 5H1.5c-.545 0-1 .455-1 1v2c0 .545.455 1 1 1H3l3.91 2.81c.645.447 1.573-.024 1.59-.81V3A.954.954 0 0 0 7 2.19z"></path>'
			},
			'volume-mute': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m13.5 5.5l-3 3m0-3l3 3M3 5H1.5c-.545 0-1 .455-1 1v2c0 .545.455 1 1 1H3l3.91 2.81c.645.447 1.573-.024 1.59-.81V3A.954.954 0 0 0 7 2.19z" stroke-width="1"></path>'
			},
			'volume-min': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="m 10.5 3.9723113 c 0.348 0.42 0.526 0.955 0.5 1.5 0.02497 0.5446848 -0.153209 1.0792373 -0.5 1.5 m -7.5 -3.5 H 1.5 c -0.545 0 -1 0.455 -1 1 v 2 c 0 0.545 0.455 1 1 1 H 3 l 3.91 2.8099997 c 0.645 0.447 1.573 -0.024 1.59 -0.8099997 v -8 C 8.5230033 0.68839776 7.6428701 0.21312586 7 0.66231126 Z" stroke-width="1" id="path1"></path>'
			},
			'database-remove': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"><path d="M13.5 9L9 13.5M9 9l4.5 4.5M6 4.74c3.038 0 5.5-.95 5.5-2.12S9.038.5 6 .5S.5 1.45.5 2.62S2.962 4.74 6 4.74m5.5 2.76V2.62"/><path d="M.5 2.62v6.76c0 1.17 2.44 2.11 5.5 2.12"/><path d="M6 8.12C3 8.12.5 7.17.5 6"/></g>'
			},
			'volume-up': {
				body: '<path id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M 3 5 H 1.5 c -0.545 0 -1 0.455 -1 1 v 2 c 0 0.545 0.455 1 1 1 H 3 l 3.91 2.81 C 7.555 12.257 8.483 11.786 8.5 11 V 3 C 8.5230033 2.2160865 7.6428701 1.7408146 7 2.19 Z m 7.5 2 h 3 M 12 5.5 v 3"></path>'
			},
			'screwdriver-wrench': {
				body: '<path fill="none" stroke="currentColor" stroke-width="1"  d="M8.428 13.265H2.806v6.13a2.81 2.81 0 0 0 5.622 0zm-2.81-.097V8.01m1.028-.012H4.592L3.266 6.187l.785-3.68h3.137l.784 3.68zm7.693-2.472l.002-3.21a5.167 5.167 0 0 0 .196 9.488v8.42a1.934 1.934 0 1 0 3.868 0v-8.42a5.168 5.168 0 0 0 .196-9.489l.002 3.211a2.132 2.132 0 1 1-4.264 0Z"></path>'
			},
			'letter-a': {
				body: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1" stroke-linejoin="round" id="g2"><path d="M 2.0803456 13.262052 5.6746454 2.9170029 c 0.375093 -0.8816496 0.836213 -2.18297313 1.287837 -2.17903743 0.669073 0.00492 0.97546 1.07702753 1.39239 2.17903743 0.304401 0.8046089 3.5647816 10.3450491 3.5647816 10.3450491 m -7.8586556 -4.9285102 5.787481 -0.061" id="path2"/></g>'
			}
		},
		width: 14,
		height: 14
	});

	// add 24x24 icons
	addCollection({
		prefix: 'loxbuddy',
		icons: {
			'bell-ringing': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 3.8944768 10.647955 c 0 -4.4765597 3.628966 -8.1055192 8.1055232 -8.1055192 4.476556 0 8.10552 3.6289595 8.10552 8.1055192 0 4.032498 0.934387 6.371843 1.677395 7.655217 0.345948 0.599188 -0.08489 1.348483 -0.776777 1.350921 H 2.9938632 C 2.3029802 19.649941 1.8738753 18.901496 2.2193355 18.303172 2.961216 17.019798 3.8944768 14.679328 3.8944768 10.647955 Z M 1.6102955 5.2442732 C 2.5459989 3.4056721 3.9565711 1.8508945 5.6957041 0.74120498 m 12.6085909 0 C 20.043427 1.8508945 21.454 3.4056721 22.389705 5.2442732 M 8.3896652 23.258799 h 7.2049088"></path>'
			},
			'bell-check': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 11.960531 5.3844319 15.544563 8.9684636 22.710937 1.801245 M 19.80861 8.4665592 c 0.193479 0.6940519 0.29691 1.4256449 0.29691 2.1813958 0 4.032498 0.934387 6.371843 1.677395 7.655217 0.345948 0.599188 -0.08489 1.348483 -0.776777 1.350921 H 2.9938632 C 2.3029802 19.649941 1.8738753 18.901496 2.2193355 18.303172 2.961216 17.019798 3.8944768 14.679328 3.8944768 10.647955 3.8944768 6.1713953 7.5234428 2.5424358 12 2.5424358 M 8.3896652 23.258799 h 7.2049088"></path>'
			},
			'bell-stop': {
				body: '<path fill="none" id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 14.991338 1.6647813 3.407953 3.4079554 m 0 0 3.407956 3.4079556 M 18.399291 5.0727367 21.807247 1.6647813 m -3.407956 3.4079554 -3.407953 3.4079556 m 5.114182 2.1672627 c 0 4.032498 0.934387 6.371843 1.677395 7.655217 0.345948 0.599188 -0.08489 1.348483 -0.776777 1.350921 H 2.9938632 C 2.3029802 19.649941 1.8738753 18.901496 2.2193355 18.303172 2.961216 17.019798 3.8944768 14.679328 3.8944768 10.647955 3.8944768 6.1713953 7.5234428 2.5424358 12 2.5424358 M 8.3896652 23.258799 h 7.2049088"></path>'
			},
			'automatic-circle': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 7.0803459 17.2509 10.674645 6.9058503 c 0.375093 -0.881649 0.836213 -2.1829728 1.287837 -2.179037 0.669073 0.0049 0.97546 1.077027 1.39239 2.179037 0.304401 0.804609 3.564782 10.3450497 3.564782 10.3450497 m -7.8586561 -4.92851 5.7874811 -0.061 M 22 12 A 10 10 0 0 1 12 22 10 10 0 0 1 2 12 10 10 0 0 1 12 2 10 10 0 0 1 22 12 Z"></path>'
			},
			'arrows-left-right-open': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 12 16.97339 V 7 m 3 0 5 5 -5 5 M 9 7 4 12 9 17"></path>'
			},
			'arrows-left-right-close': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 12 16.823603 V 6.9811674 M 4 17 9 12 4 7 m 16 10 -5 -5 5 -5"></path>'
			},
			'radiator': {
				body: '<path fill="none" id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 18.699152,17.182192 h 2.300106 M 18.699152,6.4430196 h 2.300106 M 12.568208,17.182192 H 15.62967 M 12.568208,6.4430196 H 15.62967 M 6.437262,17.182192 H 9.4987274 M 6.437262,6.4430196 H 9.4987274 M 4.8985157,3.3815542 h 0.00801 c 0.8480259,0 1.5307327,0.6827069 1.5307327,1.5307329 V 18.712925 c 0,0.848026 -0.6827068,1.530732 -1.5307327,1.530732 h -0.00801 c -0.8480259,0 -1.5307329,-0.682706 -1.5307329,-1.530732 V 4.9122871 c 0,-0.848026 0.682707,-1.5307329 1.5307329,-1.5307329 z m 12.2618873,0 h 0.008 c 0.848026,0 1.530732,0.6827069 1.530732,1.5307329 V 18.712925 c 0,0.848026 -0.682706,1.530732 -1.530732,1.530732 h -0.008 c -0.848026,0 -1.530732,-0.682706 -1.530732,-1.530732 V 4.9122871 c 0,-0.848026 0.682706,-1.5307329 1.530732,-1.5307329 z m -6.130944,0 h 0.008 c 0.848026,0 1.530733,0.6827069 1.530733,1.5307329 V 18.712925 c 0,0.848026 -0.682707,1.530732 -1.530733,1.530732 h -0.008 c -0.848024,0 -1.5307311,-0.682706 -1.5307311,-1.530732 V 4.9122871 c 0,-0.848026 0.6827071,-1.5307329 1.5307311,-1.5307329 z"></path>'
			},
			'solar-panel': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 4.9781105 16.59375 H 19.042269 M 8.9015333 20.234375 10.198408 14.1875 m 3.5625 0.0625 1.34375 6.03125 M 8.5591559 10.776381 c -3e-7 -1.8857763 1.5288351 -3.4145002 3.4147491 -3.4145005 1.885915 -10e-8 3.41475 1.528724 3.41475 3.4145005 M 11.996764 3.2648552 v 1.365896 M 4.4843156 10.776381 h 1.365896 m 12.2931034 0 h 1.365896 M 7.6572195 6.4364047 6.6908445 5.4708857 m 10.6113045 -5.92e-4 -0.965519 0.966375 m 5.128381 14.2424833 a 0.68295001 0.68295001 0 0 1 -0.589897 0.34148 H 3.1184126 A 0.68295001 0.68295001 0 0 1 2.520833 20.001331 L 5.9944878 13.854774 A 0.68295001 0.68295001 0 0 1 6.5920675 13.50818 H 17.400603 a 0.68295001 0.68295001 0 0 1 0.59758 0.346594 l 3.473654 6.146557 a 0.68295001 0.68295001 0 0 1 -0.0072 0.677821"></path'
			}
		},
		width: 24,
		height: 24
	});
}
