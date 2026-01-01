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

class LbControl {
	private controlList = [
		{ type: 'Alarm', control: LbAlarm, defaultIcon: 'IconsFilled/shield-2.svg' },
		{ type: 'AlarmClock', control: LbAlarmClock, defaultIcon: 'IconsFilled/alarm-clock.svg' },
		{ type: 'CentralJalousie', control: LbCentralJalousie, defaultIcon: '' },
		{ type: 'CentralLightController', control: LbCentralLight, defaultIcon: '' },
		{ type: 'Daytimer', control: LbDaytimer, defaultIcon: 'lucide-thin:calendar-days' },
		{ type: 'Dimmer', control: LbDimmer, defaultIcon: '' },
		{ type: 'Fronius', control: LbFronius, defaultIcon: '' },
		{ type: 'Gate', control: LbGate, defaultIcon: '' },
		{ type: 'InfoOnlyAnalog', control: LbInfoOnlyAnalog, defaultIcon: '' },
		{ type: 'InfoOnlyDigital', control: LbInfoOnlyDigital, defaultIcon: '' },
		{ type: 'InfoOnlyText', control: LbInfoOnlyText, defaultIcon: '' },
		{ type: 'Intercom', control: LbIntercom, defaultIcon: '' },
		{ type: 'IRoomController', control: LbIRoomControllerV1, defaultIcon: '' },
		{ type: 'IRoomControllerV2', control: LbIRoomControllerV2, defaultIcon: '' },
		{ type: 'Jalousie', control: LbJalousie, defaultIcon: 'IconsFilled/blinds-half-closed.svg' },
		{ type: 'LightControllerV2', control: LbLightControllerV2, defaultIcon: '' },
		{ type: 'LoadManager', control: LbLoadManager, defaultIcon: '' },
		{ type: 'Meter', control: LbMeter, defaultIcon: '' },
		{ type: 'Pushbutton', control: LbPushbutton, defaultIcon: '' },
		{ type: 'Radio', control: LbRadio, defaultIcon: '' },
		{ type: 'Slider', control: LbSlider, defaultIcon: '' },
		{ type: 'SmokeAlarm', control: LbSmokeAlarm, defaultIcon: 'IconsFilled/alarm-1.svg' },
		{ type: 'Switch', control: LbSwitch, defaultIcon: '' },
		{ type: 'TextState', control: LbTextState, defaultIcon: '' },
		{ type: 'Tracker', control: LbTracker, defaultIcon: '' },
		{ type: 'UpDownDigital', control: LbUpDownDigital, defaultIcon: '' },
		{ type: 'ValueSelector', control: LbValueSelector, defaultIcon: '' },
		{ type: 'Webpage', control: LbWebpage, defaultIcon: 'IconsFilled/globe-3.svg' },
		{ type: 'WindowMonitor', control: LbWindowMonitor, defaultIcon: 'IconsFilled/window-state-open-1.svg' },
		{ type: 'TimedSwitch', control: LbTimedSwitch, defaultIcon: '' },
		{ type: 'PresenceDetector', control: LbPresenceDetector, defaultIcon: 'IconsFilled/presence.svg' }
	];

	getControl(type: string) {
		const comp = this.controlList.find((control) => control.type == type);
		return comp ? comp.control : LbUnknownControl;
	}

	getDefaultIcon(type: string) {
		const comp = this.controlList.find((control) => control.type == type);
		return comp ? comp.defaultIcon : '';
	}
}

export const lbControl = new LbControl();
