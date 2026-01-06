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
				body: '<path fill="none" id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 5.2148618 10.753731 c 0 -3.6778708 2.9815018 -6.6593672 6.6593712 -6.6593672 3.677869 0 6.659369 2.9814964 6.659369 6.6593672 0 3.313039 0.767678 5.235007 1.378121 6.289408 0.284226 0.492283 -0.06974 1.107892 -0.638188 1.109896 H 4.4749317 c -0.5676187 -0.0034 -0.9201646 -0.618322 -0.6363399 -1.109896 0.6095175 -1.054401 1.37627 -2.977295 1.37627 -6.289408 z M 3.3382141 6.3141513 C 4.1069733 4.8035854 5.2658774 3.5262044 6.694722 2.6145008 m 10.359021 0 c 1.428844 0.9117036 2.587748 2.1890846 3.35651 3.6996505 M 8.9080384 21.114605 h 5.9194406"/>'
			},
			'bell-check': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 11.843864 6.4671182 14.781675 9.404929 20.655911 3.53 M 18.27689 8.9935208 c 0.158594 0.5689104 0.243375 1.1685932 0.243375 1.7880772 0 3.305416 0.765913 5.222964 1.374952 6.274939 0.283572 0.49115 -0.06958 1.105344 -0.63672 1.107342 H 4.4939362 c -0.5663128 -0.0034 -0.9180478 -0.616899 -0.6348759 -1.107342 0.6081152 -1.051975 1.3731038 -2.970445 1.3731038 -6.274939 0 -3.6694104 2.9746432 -6.6440481 6.6440529 -6.6440481 M 8.916845 21.118636 h 5.905823" />'
			},
			'bell-stop': {
				body: '<path fill="none" id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 14.347261 3.35 2.803804 2.803806 m 0 0 2.803807 2.8038063 M 17.151065 6.153806 19.954872 3.35 m -2.803807 2.803806 -2.803804 2.8038063 m 4.207559 1.7830587 c 0 3.317632 0.768743 5.242267 1.380034 6.29813 0.284619 0.492966 -0.06984 1.109428 -0.639074 1.111434 H 4.4766534 c -0.5684059 -0.0034 -0.9214407 -0.61918 -0.6372224 -1.111434 0.6103628 -1.055863 1.3781786 -2.981423 1.3781786 -6.29813 0 -3.6829723 2.9856368 -6.6686038 6.6686064 -6.6686038 M 8.9159082 21.115912 h 5.9276498"/>'
			},
			'bell-time': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 18.536438 11.598167 c 0.113462 2.809956 0.801736 4.496207 1.358779 5.45837 0.283572 0.49115 -0.06958 1.105344 -0.63672 1.107342 H 4.4939362 c -0.5663128 -0.0034 -0.9180478 -0.616899 -0.6348759 -1.107342 0.6081152 -1.051975 1.3731038 -2.970445 1.3731038 -6.274939 0 -3.6694104 2.9746432 -6.6440481 6.6440529 -6.6440481 M 8.916845 21.118636 h 5.905823"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 17.25942 2.6378176 c -1.892853 0 -3.428565 1.5357114 -3.428565 3.4285647 0 1.8928533 1.535712 3.4285643 3.428565 3.4285643 1.892853 0 3.428565 -1.535711 3.428565 -3.4285643 0 -1.8928533 -1.535712 -3.4285647 -3.428565 -3.4285647 z" id="path1-7"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 17.25942 4.3754681 V 6.352096 h 1.476364" id="path2"/>'
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
				body: '<path fill="none" id="path1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 18.699152 17.182192 h 2.300106 M 18.699152 6.4430196 h 2.300106 M 12.568208 17.182192 H 15.62967 M 12.568208 6.4430196 H 15.62967 M 6.437262 17.182192 H 9.4987274 M 6.437262 6.4430196 H 9.4987274 M 4.8985157 3.3815542 h 0.00801 c 0.8480259 0 1.5307327 0.6827069 1.5307327 1.5307329 V 18.712925 c 0 0.848026 -0.6827068 1.530732 -1.5307327 1.530732 h -0.00801 c -0.8480259 0 -1.5307329 -0.682706 -1.5307329 -1.530732 V 4.9122871 c 0 -0.848026 0.682707 -1.5307329 1.5307329 -1.5307329 z m 12.2618873 0 h 0.008 c 0.848026 0 1.530732 0.6827069 1.530732 1.5307329 V 18.712925 c 0 0.848026 -0.682706 1.530732 -1.530732 1.530732 h -0.008 c -0.848026 0 -1.530732 -0.682706 -1.530732 -1.530732 V 4.9122871 c 0 -0.848026 0.682706 -1.5307329 1.530732 -1.5307329 z m -6.130944 0 h 0.008 c 0.848026 0 1.530733 0.6827069 1.530733 1.5307329 V 18.712925 c 0 0.848026 -0.682707 1.530732 -1.530733 1.530732 h -0.008 c -0.848024 0 -1.5307311 -0.682706 -1.5307311 -1.530732 V 4.9122871 c 0 -0.848026 0.6827071 -1.5307329 1.5307311 -1.5307329 z"></path>'
			},
			'solar-panel': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 4.9781105 15.975031 H 19.042269 M 8.9015333 19.615656 10.198408 13.568781 m 3.5625 0.0625 1.34375 6.03125 M 8.5591559 10.157662 c -3e-7 -1.8857757 1.5288351 -3.4144996 3.4147491 -3.4144999 1.885915 -1e-7 3.41475 1.528724 3.41475 3.4144999 M 11.996764 2.6461368 v 1.365896 M 4.4843156 10.157662 h 1.365896 m 12.2931034 0 h 1.365896 M 7.6572195 5.8176863 6.6908445 4.8521673 m 10.6113045 -5.92e-4 -0.965519 0.966375 m 5.128381 14.2424827 a 0.68295001 0.68295001 0 0 1 -0.589897 0.34148 H 3.1184126 A 0.68295001 0.68295001 0 0 1 2.520833 19.382612 L 5.9944878 13.236055 A 0.68295001 0.68295001 0 0 1 6.5920675 12.889461 H 17.400603 a 0.68295001 0.68295001 0 0 1 0.59758 0.346594 l 3.473654 6.146557 a 0.68295001 0.68295001 0 0 1 -0.0072 0.677821">></path'
			},
			'blinds-closed': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2"></path><path fill="none" stroke="currentColor" d="M 6.3333333 8.0000001 H 17.666667" stroke-width="1.5" id="path3"></path><path fill="none" stroke="currentColor" d="M 6.3333333 10.666667 H 17.666667" stroke-width="1.5" id="path4"></path><path fill="none" stroke="currentColor" d="M 6.3333333 13.333333 H 17.666667" stroke-width="1.5" id="path5"></path><path fill="none" stroke="currentColor" d="M 6.3333333 16 H 17.666667" stroke-width="1.5" id="path6"></path><path fill="none" stroke="currentColor" d="M 6.3333333 18.666667 H 17.666667" stroke-width="1.5" id="path7"></path><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999"></path>'
			},
			'blinds-half-closed': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2"></path><path fill="none" stroke="currentColor" d="M 6.3333333 8.0000001 H 17.666667" stroke-width="1.5" id="path3"></path><path fill="none" stroke="currentColor" d="M 6.3333333 10.666667 H 17.666667" stroke-width="1.5" id="path4"></path><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999"></path>'
			},
			'blinds-opened': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2"></path><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999"></path>'
			},
			'blinds-down': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2" /><path fill="none" stroke="currentColor" d="M 6.3333333 8.0000001 H 17.666667" stroke-width="1.5" id="path3" /><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999" /><path id="path4-9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 9.9182161 15.732343 12 17.695167 m 0 -6.066914 v 6.066914 M 14.081784 15.732343 12 17.695167" />'
 			},
			'blinds-up-down': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2" /><path fill="none" stroke="currentColor" d="M 6.3333333 8.0000001 H 17.666667" stroke-width="1.5" id="path3"/><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999" /><path id="path4-9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 9.9182164 16.267659 12 18.230483 M 14.081784 16.267659 12 18.230483" /><path id="path4-9-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 14.081784 13.323419 12 11.360595 M 9.918216 13.323419 12 11.360595" />'
			},
			'blinds-up': {
				body: '<path fill="none" stroke="currentColor" d="M 6.3333333 5.3333334 H 17.666667" stroke-width="1.5" id="path2" /><path fill="none" stroke="currentColor" d="M 6.3333333 8.0000001 H 17.666667" stroke-width="1.5" id="path3" /><path id="path9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 19 2.6666668 c 0.36819 0 0.666667 0.2984768 0.666667 0.6666666 m 0 17.3333336 c 0 0.36819 -0.298477 0.666666 -0.666667 0.666666 m -14.0000001 0 c -0.3681898 0 -0.6666666 -0.298476 -0.6666666 -0.666666 m 0 -17.3333336 c 0 -0.3681898 0.2984768 -0.6666666 0.6666666 -0.6666666 M 4.3333333 3.3333334 V 20.666667 M 5 21.333333 h 14 m 0.666667 -0.666666 V 3.3333334 M 19 2.6666668 H 4.9999999" /><path id="path4-9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 14.081784 13.591077 12 11.628253 m 0 6.066914 V 11.628253 M 9.9182162 13.591077 12 11.628253" />'
			},
			'garage': {
				body: '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M 20.243288 6.0024158 V 18.747584" id="path1" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 20.243288 6.0024158 H 3.756712" id="path2" /><path fill="none" stroke="currentColor" stroke-width="1.5" d="M 3.756712 18.747584 V 6.0024158" id="path3" /><path id="rect1" fill="none" stroke="currentColor" stroke-width="1.5" d="M 6.2921908 8.5524869 H 17.720444 V 9.9806826 H 6.2921908 Z" /><path id="rect2" fill="none" stroke="currentColor" stroke-width="1.5" d="M 6.2921906 12.571804 H 17.720444 V 14 H 6.2921906 Z"/><path id="rect3" fill="none" stroke="currentColor" stroke-width="1.5" d="M 6.2921906 16.5 H 17.720444 v 1.428196 H 6.2921906 Z"/>' 
			},
			'attic': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 21.56019 13.930007 12 6.8287854 M 2.4398102 13.930007 12 6.8287854"/><path id="rect4" fill="none" stroke="currentColor" stroke-width="1.5" d="m 17.490799,8.8790215 h 0.251766 v 0.746703 l -0.251766,-0.188361 z"/><rect fill="none" stroke="currentColor" stroke-width="1.5" id="rect1" width="11.985129" height="5.2012458" x="6.0074353" y="11.969969" />'
			},
			'home-sleep': {
				body: '<path fill="none" stroke="currentColor" stroke-width="1.5" d="M 15.524164 20.334572 H 3.2679869 V 10.729357 L 12 2.8705464 20.732013 10.729357 v 5.652306" id="path1"/><path  stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 17.732014 18.388475 h 2.999999 l -2.999999 3 h 2.999999 m -9.533457 -7.802974 h 4 l -3.999999 4 h 3.999999" id="path2" style="fill:none" />'
			},
			'garage-close': {
				body: '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 16.271646 19.75" id="path6" /><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 16.508289 18.986417" id="path4" /><path id="path9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m 16.984255 20.311272 h 3.573273 m -17.1150557 0 H 7.015745 m 0 0 v -9.298019 h 9.96851 v 9.298019 M 12 16.518319 9.478354 14.714036 M 12 16.518319 14.521646 14.714036 M 3.4424723 20.311272 V 9.405339 C 6.2605127 7.4680481 9.1150531 5.4645969 12.000714 3.6887139 14.851352 5.575166 17.590505 7.4744278 20.557528 9.405339 v 10.905933" />'
			},
			'garage-open': {
				body: '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 16.271646 19.75" id="path6" /><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 16.508289 18.986417" id="path4" /><path id="path10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 3.4424723 20.311272 H 20.557528 m -13.541783 0 v -9.298019 h 9.96851 v 9.298019 m -13.5417827 0 V 9.405339 C 6.2605127 7.4680481 9.1150531 5.4645969 12.000714 3.6887139 14.851352 5.575166 17.590505 7.4744278 20.557528 9.405339 V 20.311272 M 12 14.760121 9.478354 16.564404 M 12 14.760121 l 2.521646 1.804283" />'
			},
			'garage-car': {
				body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M 22 21 V 9.6099998 c 0 -1.3219996 0 -1.9839996 -0.344 -2.4959996 -0.344 -0.512 -0.953 -0.758 -2.17 -1.25 l -6 -2.42 c -0.734 -0.296 -1.1 -0.4440003 -1.486 -0.4440003 -0.386 0 -0.752 0.1480003 -1.486 0.4440003 l -6 2.42 c -1.217 0.492 -1.826 0.738 -2.17 1.25 C 2 7.6260002 2 8.2880002 2 9.6099998 V 21" id="path1" /><path id="path2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m 15.593964 17.403403 v 0.006 m -7.187903 -0.006 v 0.006 m -2.395967 -3.300455 1.197984 0.898488 1.054824 0.263556 q 0.143758 0.03594 0.290511 0.03594 h 6.893199 q 0.146753 0 0.290511 -0.03594 l 1.054825 -0.263556 1.197984 -0.898488 m -1e-6 4.146222 v 1.843697 c 0 0.27913 0 0.418695 -0.04552 0.52891 a 0.59899189 0.59899189 0 0 1 -0.324055 0.323455 c -0.110214 0.04612 -0.249779 0.04612 -0.528909 0.04612 -0.279131 0 -0.418696 0 -0.52891 -0.04552 a 0.59899189 0.59899189 0 0 1 -0.323456 -0.324054 c -0.04612 -0.110215 -0.04612 -0.24978 -0.04612 -0.52891 0 -0.27913 0 -0.418695 -0.04552 -0.52891 a 0.59899189 0.59899189 0 0 0 -0.324054 -0.323455 c -0.110215 -0.04612 -0.24978 -0.04612 -0.52891 -0.04612 h -6.58892 c -0.27913 0 -0.418695 0 -0.52891 0.04552 a 0.59899189 0.59899189 0 0 0 -0.323455 0.324054 c -0.04612 0.110215 -0.04612 0.24978 -0.04612 0.52891 0 0.27913 0 0.418695 -0.04552 0.52891 a 0.59899189 0.59899189 0 0 1 -0.32406 0.323455 c -0.110215 0.04612 -0.24978 0.04612 -0.52891 0.04612 -0.27913 0 -0.418695 0 -0.52891 -0.04552 A 0.59899189 0.59899189 0 0 1 6.056216 20.627777 c -0.04612 -0.110215 -0.04612 -0.24978 -0.04612 -0.52891 V 18.25517 c 0 -0.719988 0 -1.079982 0.103027 -1.419611 0.103026 -0.339628 0.30249 -0.639124 0.702018 -1.238116 L 7.20808 15.007436 7.78431 13.624963 c 0.446249 -1.072196 0.669673 -1.607695 1.122511 -1.909587 0.452838 -0.301891 1.032662 -0.301891 2.194706 -0.301891 h 1.796975 c 1.161446 0 1.741869 0 2.194707 0.301891 0.452837 0.301892 0.676261 0.83799 1.12251 1.909587 l 0.576231 1.382473 0.392938 0.590007 c 0.399528 0.598992 0.598992 0.898488 0.702019 1.238116 0.103026 0.339629 0.103026 0.699623 0.103026 1.419611" />'
			},
			'night-mode': {
				body: '<path id="path1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 8.6955981 4.4986844 A 8.8762369 8.8762369 0 0 0 8.2685523 7.2256617 c 0 4.9021473 3.9740887 8.8762363 8.8762377 8.8762363 a 8.8269244 8.8269244 0 0 0 3.517948 -0.724893 c -1.150458 3.568741 -4.498279 6.14926 -8.449192 6.14926 -4.9021479 0 -8.8762364 -3.974089 -8.8762364 -8.876237 0 -3.652571 2.2057449 -6.7893343 5.3582885 -8.1513436 z M 16.241339 10.93563 h 3.577556 M 18.030117 9.146852 v 3.577555 M 12.472239 4.2625125 h 3.577556 M 14.261017 2.473735 v 3.5775551" />'
			},
			'socket-eu': {
				body: '<g fill="none" id="g3"><circle cx="9.5018587" cy="12" r="1" fill="currentColor" id="circle2" /><circle cx="14.498141" cy="12" r="1" fill="currentColor" id="circle3" /><path id="rect3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 3.2065353 3.2065344 H 20.793465 V 20.793466 H 3.2065353 Z M 12 18 v -1.5 m 0 -9 V 6 m 6 6 a 6 6 0 0 1 -6 6 6 6 0 0 1 -6 -6 6 6 0 0 1 6 -6 6 6 0 0 1 6 6 z" /></g>'
			},
			'socket-uk': {
				body: '<g fill="none" id="g3"><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="m 18 12 a 6 6 0 0 1 -6 6 6 6 0 0 1 -6 -6 6 6 0 0 1 6 -6 6 6 0 0 1 6 6 z" id="path1" /><path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M 3.2065353 3.2065344 H 20.793465 V 20.793466 H 3.2065353 Z" id="path2" /><path id="path3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" d="m 12 8.155395 v 1.4571617 m 2.023797 4.1099073 h 1.268442 m -6.5844784 0 h 1.2684418" /></g>'
			},
			'ebike': {
				body: '<path fill="none" stroke="currentColor" d="m 5.8864374 19.766518 c 4.6579506 0 4.6579506 -6.986928 0 -6.986928 -4.6579506 0 -4.6579506 6.986928 0 6.986928 z m 12.2271256 0 c 4.65795 0 4.65795 -6.986928 0 -6.986928 -4.657951 0 -4.657951 6.986928 0 6.986928 z M 6.8734385 8.4127584 H 9.5519777 M 18.113563 16.273054 15.493464 7.5393923 H 14.249973 M 9.3799019 11.032857 5.9908317 16.116461 c -0.1894497 0.216414 0.047336 0.156818 0.1326159 0.156593 h 4.6168274 0.662329 c 0.431252 0.07845 1.022874 -1.231724 1.8314 -2.561454 0.523107 -0.860321 1.603129 -2.678743 1.986888 -2.678743 0.453829 0 0.687423 -9.3e-5 1.145939 0 z m 0 0 -1.7467323 -2.6200986" id="path1" stroke-width="1.5" stroke-linecap="round" /><path id="path2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="miter" d="m 20.561167 3.4787811 -1.873605 3.1226765 m 1.873605 -3.1226765 -1.873605 3.1226765 h 2.365784 L 19.17974 9.7241342" />'
			}
		},
		width: 24,
		height: 24
	});
}
