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
import LbPresenceDetector from '$lib/components/lb-presence-detector.svelte';
import LbWindowMonitor from '$lib/components/lb-window-monitor.svelte';
import LbValueSelector from '$lib/components/lb-value-selector.svelte';
import LbMeter from '$lib/components/lb-meter.svelte';
import LbUnknown from '$lib/components/lb-unknown.svelte';
import LbGate from '$lib/components/lb-gate.svelte';
import LbDimmer from '$lib/components/lb-dimmer.svelte';
import LbTracker from '$lib/components/lb-tracker.svelte';
import { loxiconsPath } from '$lib/helpers/paths';

let componentList = [
	{ type: 'UpDownDigital', component: LbUpDownDigital, defaultIcon: '' },
	{ type: 'TextState', component: LbTextState, defaultIcon: '' },
	{ type: 'InfoOnlyAnalog', component: LbInfoOnlyAnalog, defaultIcon: '' },
	{ type: 'InfoOnlyDigital', component: LbInfoOnlyDigital, defaultIcon: '' },
	{ type: 'InfoOnlyText', component: LbInfoOnlyText, defaultIcon: '' },
	{ type: 'Radio', component: LbRadio, defaultIcon: '' },
	{ type: 'Pushbutton', component: LbPushbutton, defaultIcon: '' },
	{ type: 'Webpage', component: LbWebpage, defaultIcon: loxiconsPath + 'IconsFilled/globe-3.svg' },
	{ type: 'Slider', component: LbSlider, defaultIcon: '' },
	{ type: 'Switch', component: LbSwitch, defaultIcon: '' },
	{ type: 'Jalousie', component: LbJalousie, defaultIcon: loxiconsPath + 'IconsFilled/blinds-half-closed.svg' },
	{ type: 'LightControllerV2', component: LbLightControllerV2, defaultIcon: '' },
	{ type: 'Fronius', component: LbFronius, defaultIcon: '' },
	{ type: 'Intercom', component: LbIntercom, defaultIcon: '' },
	{ type: 'CentralLightController', component: LbCentralLight, defaultIcon: '' },
	{ type: 'Alarm', component: LbAlarm, defaultIcon: loxiconsPath + 'IconsFilled/shield-2.svg' },
	{ type: 'IRoomController', component: LbIRoomController, defaultIcon: '' },
	{ type: 'IRoomControllerV2', component: LbIRoomControllerV2, defaultIcon: '' },
	{ type: 'Daytimer', component: LbDaytimer, defaultIcon: '/icons/svg/calendar-clock.svg' },
	{ type: 'SmokeAlarm', component: LbSmokeAlarm, defaultIcon: '/icons/svg/flame.svg' },
	{ type: 'CentralJalousie', component: LbCentralJalousie, defaultIcon: '' },
	{ type: 'AlarmClock', component: LbAlarmClock, defaultIcon: loxiconsPath + 'IconsFilled/alarm-clock.svg' },
	{ type: 'TimedSwitch', component: LbTimedSwitch, defaultIcon: '' },
	{ type: 'PresenceDetector', component: LbPresenceDetector, defaultIcon: loxiconsPath + 'IconsFilled/presence.svg' },
	{ type: 'WindowMonitor', component: LbWindowMonitor, defaultIcon: '/icons/svg/pull-door.svg' },
	{ type: 'ValueSelector', component: LbValueSelector, defaultIcon: '' },
	{ type: 'Meter', component: LbMeter, defaultIcon: '' },
	{ type: 'Gate', component: LbGate, defaultIcon: '' },
	{ type: 'Dimmer', component: LbDimmer, defaultIcon: '' },
	{ type: 'Tracker', component: LbTracker, defaultIcon: '' },
	
];

export function getComponent(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.component : LbUnknown;
}

export function getDefaultIcon(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.defaultIcon : '';
}
