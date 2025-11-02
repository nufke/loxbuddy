import LbUpDownDigital from '$lib/components/UpDownDigital/LbUpDownDigital.svelte';
import LbTextState from '$lib/components/TextState/LbTextState.svelte';
import LbInfoOnlyAnalog from '$lib/components/Info/LbInfoOnlyAnalog.svelte';
import LbInfoOnlyDigital from '$lib/components/Info/LbInfoOnlyDigital.svelte';
import LbInfoOnlyText from '$lib/components/Info/LbInfoOnlyText.svelte';
import LbJalousie from '$lib/components/Jalousie/LbJalousie.svelte';
import LbPushbutton from '$lib/components/PushButton/LbPushButton.svelte';
import LbRadio from '$lib/components/Radio/LbRadio.svelte';
import LbWebpage from '$lib/components/Webpage/LbWebpage.svelte';
import LbSlider from '$lib/components/Slider/LbSlider.svelte';
import LbSwitch from '$lib/components/Switch/LbSwitch.svelte';
import LbLightControllerV2 from '$lib/components/LightController/LbLightControllerV2.svelte';
import LbFronius from '$lib/components/Fronius/LbFronius.svelte';
import LbIntercom from '$lib/components/Intercom/LbIntercom.svelte';
import LbCentralLight from '$lib/components/LightController/LbCentralLight.svelte';
import LbAlarm from '$lib/components/Alarm/LbAlarm.svelte';
import LbIRoomController from '$lib/components/Irc/LbIrcV1.svelte';
import LbIRoomControllerV2 from '$lib/components/Irc/LbIrcV2.svelte';
import LbDaytimer from '$lib/components/Daytimer/LbDaytimer.svelte';
import LbSmokeAlarm from '$lib/components/SmokeAlarm/LbSmokeAlarm.svelte';
import LbCentralJalousie from '$lib/components/Jalousie/LbCentralJalousie.svelte';
import LbAlarmClock from '$lib/components/AlarmClock/LbAlarmClock.svelte';
import LbTimedSwitch from '$lib/components/TimedSwitch/LbTimedSwitch.svelte';
import LbPresenceDetector from '$lib/components/PresenceDetector/LbPresenceDetector.svelte';
import LbWindowMonitor from '$lib/components/WindowMonitor/LbWindowMonitor.svelte';
import LbValueSelector from '$lib/components/ValueSelector/LbValueSelector.svelte';
import LbMeter from '$lib/components/Meter/LbMeter.svelte';
import LbUnknownControl from '$lib/components/Common/LbUnknownControl.svelte';
import LbGate from '$lib/components/Gate/LbGate.svelte';
import LbDimmer from '$lib/components/Dimmer/LbDimmer.svelte';
import LbTracker from '$lib/components/Tracker/LbTracker.svelte';
import LbLoadManager from '$lib/components/LoadManager/LbLoadManager.svelte';
import { loxiconsPath } from '$lib/helpers/paths';

const componentList = [
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
	{ type: 'LoadManager', component: LbLoadManager, defaultIcon: '' }
];

export function getComponent(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.component : LbUnknownControl;
}

export function getDefaultIcon(type: string) {
	const comp = componentList.find((component) => component.type == type);
	return comp ? comp.defaultIcon : '';
}
