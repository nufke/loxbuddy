import LbAlarm from '$lib/components/Alarm/LbAlarm.svelte';
import LbAlarmClock from '$lib/components/AlarmClock/LbAlarmClock.svelte';
import LbCentralJalousie from '$lib/components/Jalousie/LbCentralJalousie.svelte';
import LbCentralLight from '$lib/components/LightController/LbCentralLight.svelte';
import LbDaytimer from '$lib/components/Daytimer/LbDaytimer.svelte';
import LbDimmer from '$lib/components/Dimmer/LbDimmer.svelte';
import LbFronius from '$lib/components/Fronius/LbFronius.svelte';
import LbGate from '$lib/components/Gate/LbGate.svelte';
import LbInfoOnlyAnalog from '$lib/components/Info/LbInfoOnlyAnalog.svelte';
import LbInfoOnlyDigital from '$lib/components/Info/LbInfoOnlyDigital.svelte';
import LbInfoOnlyText from '$lib/components/Info/LbInfoOnlyText.svelte';
import LbIntercom from '$lib/components/Intercom/LbIntercom.svelte';
import LbIRoomControllerV1 from '$lib/components/Irc/LbIrcV1.svelte';
import LbIRoomControllerV2 from '$lib/components/Irc/LbIrcV2.svelte';
import LbJalousie from '$lib/components/Jalousie/LbJalousie.svelte';
import LbLoadManager from '$lib/components/LoadManager/LbLoadManager.svelte';
import LbLightControllerV2 from '$lib/components/LightController/LbLightControllerV2.svelte';
import LbMeter from '$lib/components/Meter/LbMeter.svelte';
import LbPresenceDetector from '$lib/components/PresenceDetector/LbPresenceDetector.svelte';
import LbPushbutton from '$lib/components/PushButton/LbPushButton.svelte';
import LbRadio from '$lib/components/Radio/LbRadio.svelte';
import LbSlider from '$lib/components/Slider/LbSlider.svelte';
import LbSmokeAlarm from '$lib/components/SmokeAlarm/LbSmokeAlarm.svelte';
import LbSwitch from '$lib/components/Switch/LbSwitch.svelte';
import LbTextState from '$lib/components/TextState/LbTextState.svelte';
import LbTimedSwitch from '$lib/components/TimedSwitch/LbTimedSwitch.svelte';
import LbTracker from '$lib/components/Tracker/LbTracker.svelte';
import LbUnknownControl from '$lib/components/Common/LbUnknownControl.svelte';
import LbUpDownDigital from '$lib/components/UpDownDigital/LbUpDownDigital.svelte';
import LbValueSelector from '$lib/components/ValueSelector/LbValueSelector.svelte';
import LbWebpage from '$lib/components/Webpage/LbWebpage.svelte';
import LbWindowMonitor from '$lib/components/WindowMonitor/LbWindowMonitor.svelte';
import { loxiconsPath } from '$lib/helpers/paths';

const componentList = [
	{ type: 'Alarm', component: LbAlarm, defaultIcon: loxiconsPath + 'IconsFilled/shield-2.svg' },
	{ type: 'AlarmClock', component: LbAlarmClock, defaultIcon: loxiconsPath + 'IconsFilled/alarm-clock.svg' },
	{ type: 'CentralJalousie', component: LbCentralJalousie, defaultIcon: '' },
	{ type: 'CentralLightController', component: LbCentralLight, defaultIcon: '' },
	{ type: 'Daytimer', component: LbDaytimer, defaultIcon: '/icons/svg/calendar-clock.svg' },
	{ type: 'Dimmer', component: LbDimmer, defaultIcon: '' },
	{ type: 'Fronius', component: LbFronius, defaultIcon: '' },
	{ type: 'Gate', component: LbGate, defaultIcon: '' },
	{ type: 'InfoOnlyAnalog', component: LbInfoOnlyAnalog, defaultIcon: '' },
	{ type: 'InfoOnlyDigital', component: LbInfoOnlyDigital, defaultIcon: '' },
	{ type: 'InfoOnlyText', component: LbInfoOnlyText, defaultIcon: '' },
	{ type: 'Intercom', component: LbIntercom, defaultIcon: '' },
	{ type: 'IRoomController', component: LbIRoomControllerV1, defaultIcon: '' },
	{ type: 'IRoomControllerV2', component: LbIRoomControllerV2, defaultIcon: '' },
	{ type: 'Jalousie', component: LbJalousie, defaultIcon: loxiconsPath + 'IconsFilled/blinds-half-closed.svg' },
	{ type: 'LightControllerV2', component: LbLightControllerV2, defaultIcon: '' },
	{ type: 'LoadManager', component: LbLoadManager, defaultIcon: '' },
	{ type: 'Meter', component: LbMeter, defaultIcon: '' },
	{ type: 'Pushbutton', component: LbPushbutton, defaultIcon: '' },
	{ type: 'Radio', component: LbRadio, defaultIcon: '' },
	{ type: 'Slider', component: LbSlider, defaultIcon: '' },
	{ type: 'SmokeAlarm', component: LbSmokeAlarm, defaultIcon: '/icons/svg/flame.svg' },
	{ type: 'Switch', component: LbSwitch, defaultIcon: '' },
	{ type: 'TextState', component: LbTextState, defaultIcon: '' },
	{ type: 'Tracker', component: LbTracker, defaultIcon: '' },
	{ type: 'UpDownDigital', component: LbUpDownDigital, defaultIcon: '' },
	{ type: 'ValueSelector', component: LbValueSelector, defaultIcon: '' },
	{ type: 'Webpage', component: LbWebpage, defaultIcon: loxiconsPath + 'IconsFilled/globe-3.svg' },
	{ type: 'WindowMonitor', component: LbWindowMonitor, defaultIcon: '/icons/svg/pull-door.svg' },
	{ type: 'TimedSwitch', component: LbTimedSwitch, defaultIcon: '' },
	{ type: 'PresenceDetector', component: LbPresenceDetector, defaultIcon: loxiconsPath + 'IconsFilled/presence.svg' }
];

export function getComponent(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.component : LbUnknownControl;
}

export function getDefaultIcon(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.defaultIcon : '';
}
