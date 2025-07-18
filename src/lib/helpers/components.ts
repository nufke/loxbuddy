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
import LbIntercom from '$lib/components/lb-intercom.svelte';
import LbCentralLight from '$lib/components/lb-central-light.svelte';
import LbAlarm from '$lib/components/lb-alarm.svelte';
import LbIRoomController from '$lib/components/lb-iroomcontroller.svelte';
import LbIRoomControllerV2 from '$lib/components/lb-iroomcontroller-v2.svelte';
import LbDaytimer from '$lib/components/lb-daytimer.svelte';
import LbSmokeAlarm from '$lib/components/lb-smoke-alarm.svelte';
import LbCentralJalousie from '$lib/components/lb-central-jalousie.svelte';
import LbAlarmClock from '$lib/components/lb-alarm-clock.svelte';
import LbTimedSwitch from '$lib/components/lb-timed-switch.svelte';
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
	{ format: 'Fronius', component: LbFronius },
	{ format: 'Intercom', component: LbIntercom },
	{ format: 'CentralLightController', component: LbCentralLight },
	{ format: 'Alarm', component: LbAlarm },
	{ format: 'IRoomController', component: LbIRoomController },
	{ format: 'IRoomControllerV2', component: LbIRoomControllerV2 },
	{ format: 'Daytimer', component: LbDaytimer },
	{ format: 'SmokeAlarm', component: LbSmokeAlarm },
	{ format: 'CentralJalousie', component: LbCentralJalousie },
	{ format: 'AlarmClock', component: LbAlarmClock },
	{ format: 'TimedSwitch', component: LbTimedSwitch }
];

export function getComponent(name: string) {
	const comp = componentList.find((type) => type.format == name);
	return comp ? comp.component : LbUnknown;
}
