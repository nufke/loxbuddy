import LbUpDownDigital from '$lib/components/lb-up-down-digital.svelte';
import LbTextState from '$lib/components/lb-text-state.svelte';
import LbInfoOnlyAnalog from '$lib/components/lb-info-only-analog.svelte';
import LbInfoOnlyDigital from '$lib/components/lb-info-only-digital.svelte';
import LbInfoOnlyText from '$lib/components/lb-info-only-text.svelte';
import LbJalousie from '$lib/components/lb-jalousie.svelte';
import LbPushbutton from '$lib/components/lb-pushbutton.svelte';
import LbRadio from '$lib/components/lb-radio.svelte';
import LbWebpage from '$lib/components/lb-webpage.svelte';
import LbSlider from '$lib/components/lb-slider.svelte';
import LbSwitch from '$lib/components/lb-switch.svelte';
import LbLightControllerV2 from '$lib/components/lb-lightcontroller-v2.svelte';
import LbFronius from '$lib/components/lb-fronius.svelte';
import LbUnknown from '$lib/components/lb-unknown.svelte';

let componentList = [
	{ format: 'UpDownDigital', component: LbUpDownDigital },
	{ format: 'TextState', component: LbTextState },
	{ format: 'InfoOnlyAnalog', component: LbInfoOnlyAnalog },
	{ format: 'InfoOnlyDigital', component: LbInfoOnlyDigital },
	{ format: 'InfoOnlyText', component: LbInfoOnlyText },
	{ format: 'Radio', component: LbRadio },
	{ format: 'Pushbutton', component: LbPushbutton },
	{ format: 'Webpage', component: LbWebpage },
	{ format: 'Slider', component: LbSlider },
	{ format: 'Switch', component: LbSwitch },
	{ format: 'Jalousie', component: LbJalousie },
	{ format: 'LightControllerV2', component: LbLightControllerV2 },
	{ format: 'Fronius', component: LbFronius }
];

export function getComponent(name: string) {
	const comp = componentList.find((type) => type.format == name);
	return comp ? comp.component : LbUnknown;
}
