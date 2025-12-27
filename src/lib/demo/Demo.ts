import { controlStore } from '$lib/stores/LbControlStore.svelte';
import type { Control, AlarmClockEntries } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import structure from '$lib/demo/demoStructure.json';
import states from '$lib/demo/demoStates.json';
import userSettings from '$lib/demo/userSettings.json';
import notification from '$lib/demo/notifications.json';
import messageCenter from '$lib/demo/messageCenter.json';
import { format } from 'date-fns';

type IntervalMap = {
	[key: string]: NodeJS.Timeout;
}

/** Helper class to demonstrate LoxBuddy capabilities.
 *  This demo mimics a Smart Home and the controls. There is 
 *  no Miniserver required to test the functionalities
*/
export class Demo {
	private timedSwitchIntervalMap: IntervalMap = {};
	private jalousieIntervalMap: IntervalMap = {};
	private dimmerLastValue: {[key: string]: string} = {};
	private gateIntervalMap: IntervalMap = {};
	private daytimerIntervalMap: IntervalMap = {};
	private daytimerOldValue: {[key: string]: string} = {};
	private ircTimerIntervalMap: IntervalMap = {};
	private smokeAlarmIntervalMap: IntervalMap = {};
	private demoRunning = false;

	constructor() {
	}

	start() {
		if (this.demoRunning) return; // start demo Once

		console.info('TEST MODE: Use demo structure');
		this.demoRunning = true;

		let i = 0;
		let j = 0;
		let k = false; // used for InfoOnlyDigital
		let m = 0; // used for InfoOnlyAnalog
		const val = [ "0.0234", "0", "0", "0.500", "-0.400", "0", "2", "-2", "0"];
		const soc = [ "100", "80", "60", "40", "20", "0"];
		const fase = [ "0.1", "0.2", "0.3", "0.4", "-0.2", "-0.1"];

		// loadding of structure and states delayed to test uninitialized variables
		setTimeout( () => {
			controlStore.initStructure(structure, this);
		}, 100);

		setTimeout( () => {
			controlStore.setInitialStates(states);
			controlStore.userSettings = userSettings;
			controlStore.updateNotificationMap(notification);
		}, 200);

		// Meter
		setInterval(() => {
			controlStore.setState('__uuid_controls_pv_meter_states_actual', val[i]);
			controlStore.setState('__uuid_controls_battery_states_actual', val[2+i]);
			controlStore.setState('__uuid_controls_net_states_actual', val[4+i]);
			if (i==2) { i = 0; } else { i++; }
		}, 2000);

		// Meter (battery)
		setInterval(() => {
			controlStore.setState('__uuid_controls_battery_states_storage', soc[j]);
			if (j==5) { j = 0; } else { j++; }
		}, 1000);

		// InfoOnlyAnalog
		setInterval(() => {
			controlStore.setState('__uuid__controls_phase_1', fase[m]);
			if (m==5) { m = 0; } else { m++; }
		}, 2000);

		// InfoOnlyDigital
		setInterval(() => {
			controlStore.setState('__uuid__controls_heating_request', k ? "1": "0");
			k = !k;
		}, 1000);

		// Daytimer, set mode to today
		const today = format(new Date(), 'eeee');
		const obj = Object.entries(structure.operatingModes).find( e => e[1] === today );
		if (obj && obj[0]) {
			controlStore.setState('__uuid__controls_daytimer_states_mode', obj[0]);
		}
	}

	control(uuid: string, msg: string) {
		console.info('TEST control:', uuid, msg);
		let parentControl;
		let control: Control = controlStore.controls[uuid];
		if (!control) { // if no control found, check if the uuid is a subcontrol
			parentControl = controlStore.controlList.find( control => control.subControls && control.subControls[uuid])
			if (parentControl) {
				//console.log('parentControl', parentControl.uuidAction);
				control = parentControl.subControls[uuid];
			}
		}
		if (control) {
			this.action(control, msg, parentControl);
		} else {
			console.error('Control or subControl not found:', uuid);
		}
	}

	action(control: Control, msg: string, parentControl: Control | undefined) {
		switch (control.type) {
			case 'Switch' : this.switch(control, msg, parentControl); break;
			case 'TimedSwitch': this.timedSwitch(control, msg); break;
			case 'Jalousie': this.jalousie(control, msg); break;
			case 'ValueSelector': this.valueSelector(control, msg); break;
			case 'Radio': this.radio(control, msg); break;
			case 'Slider': this.slider(control, msg); break;
			case 'InfoOnlyDigital': this.infoOnlyDigital(control, msg); break;
			case 'LightControllerV2': this.lightControllerV2(control, msg); break;
			case 'Dimmer': this.dimmer(control, msg, parentControl); break;
			case 'ColorPickerV2': this.colorPickerV2(control, msg, parentControl); break;
			case 'Gate': this.gate(control, msg); break;
			case 'Alarm': this.alarm(control, msg); break;
			case 'AlarmClock': this.alarmClock(control, msg); break;
			case 'SmokeAlarm': this.smokeAlarm(control, msg); break;
			case 'IRoomController': this.ircv1(control, msg); break;
			case 'IRoomControllerV2': this.ircv2(control, msg); break;
			case 'Daytimer': this.daytimer(control, msg); break;
			case 'IRCDaytimer': this.daytimer(control, msg); break; /* reuse DayTimer */
			case 'IRCV2Daytimer': this.daytimer(control, msg); break; /* reuse DayTimer */
			case 'Pushbutton': break; /* no action */
			default: console.error('No TEST for Control', control.name, 'of type', control.type);
		}
	}

	switch(control: Control, msg: string, parentControl: Control | undefined) {
		const activeId = control.states.active;
		let val;
		if (msg == 'on') val = '1';
		if (msg == 'off') val = '0';
		controlStore.setState(activeId, val);
		if (parentControl && parentControl.type === 'LightControllerV2') {
			controlStore.setState(parentControl.states.activeMoodsNum, '-1'); // manual
		}
	}

	radio(control: Control, msg: string) {
		const activeOutputId = control.states.activeOutput;
		const val = msg =='reset' ? 0 : msg;
		controlStore.setState(activeOutputId, val);
	}

	dimmer(control: Control, msg: string, parentControl: Control | undefined) {
		const positionId = control.states.position;
		if (Number(msg) > 0) {
			this.dimmerLastValue[control.uuidAction] = msg; // store last value;
		}
		let val = msg;
		if (msg == 'off') val = '0'; 
		if (msg == 'on') val = this.dimmerLastValue[control.uuidAction];
		controlStore.setState(positionId, val);
		if (parentControl && parentControl.type === 'LightControllerV2') {
			controlStore.setState(parentControl.states.activeMoodsNum, '-1'); // manual
		}
	}

	colorPickerV2(control: Control, msg: string, parentControl: Control | undefined) {
		const colorId = control.states.color;
		controlStore.setState(colorId, msg);
		if (parentControl && parentControl.type === 'LightControllerV2') {
			controlStore.setState(parentControl.states.activeMoodsNum, '-1'); // manual
		}
	}

	valueSelector(control: Control, msg: string) {
		const valueId = control.states.value;
		controlStore.setState(valueId, msg);
	}

	slider(control: Control, msg: string) {
		const valueId = control.states.value;
		controlStore.setState(valueId, msg);
	}

	infoOnlyDigital(control: Control, msg: string) {
		const activeId = control.states.active;
		controlStore.setState(activeId, msg);
	}

	lightControllerV2(control: Control, msg: string) {
		const stateId = control.states.activeMoodsNum;
		const lights = Object.values(control.subControls);
		const val = msg.split('/');
		switch (val[1]) {
			case '778': { /* off */
				lights.forEach( light => {
					switch(light.type) {
						case 'Dimmer': controlStore.setState(light.states.position, '0'); break;
						case 'ColorPickerV2' : { 
							const hsv = this.getHsv(String(controlStore.getState(light.states.color)));
							controlStore.setState(light.states.color, `hsv(${hsv[0]},${hsv[1]},0)`);
							break; 
						}
						case 'Switch': controlStore.setState(light.states.active, '0'); break;
					}
				}); 
				break;
			}
			case '777': { /* on */
				lights.forEach( light => {
					switch(light.type) {
						case 'Dimmer': controlStore.setState(light.states.position, '100'); break;
						case 'ColorPickerV2' : { 
							const hsv = this.getHsv(String(controlStore.getState(light.states.color)));
							controlStore.setState(light.states.color, `hsv(${hsv[0]},${hsv[1]},100)`);
							break; 
						}
						case 'Switch': controlStore.setState(light.states.active, '1'); break;
					}
				});
				break;
			}
			case '1': { /* default */
				lights.forEach( light => {
					switch(light.type) {
						case 'Dimmer': controlStore.setState(light.states.position, '20'); break;
						case 'ColorPickerV2' : { 
							const hsv = this.getHsv(String(controlStore.getState(light.states.color)));
							controlStore.setState(light.states.color, `hsv(${hsv[0]},${hsv[1]},80)`);
							break; 
						}
						case 'Switch': controlStore.setState(light.states.active, '0'); break;
					}
				});
			}
		}
		controlStore.setState(stateId, val[1]);
	}

	gate(control: Control, msg: string) { 
		switch (msg) {
		 	case 'open': this.moveGate(control, 1); break;// 1 = open and 0 = closed
			case 'stop': clearInterval(this.gateIntervalMap[control.uuidAction]); break;
			case 'close': this.moveGate(control, 0); break;
			case 'partiallyOpen': this.moveGate(control, 0.5); break; // to 50%
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	moveGate(control: Control, endState: number) {
		if (this.gateIntervalMap[control.uuidAction]) {
			clearInterval(this.gateIntervalMap[control.uuidAction]);
		}
		const posId = control.states.position;
		let pos: number = Number(controlStore.getState(posId));
		const direction = Math.sign(endState-pos);
		this.gateIntervalMap[control.uuidAction] = setInterval(() => {
			if (pos <= 1 && pos >= 0 ) {
				pos += 0.1 * direction;
				if (pos>1) { pos = 1; clearInterval(this.gateIntervalMap[control.uuidAction]);}
				if (pos<0) { pos = 0; clearInterval(this.gateIntervalMap[control.uuidAction]);}
				if (Math.round(pos*10) == endState*10 ) { clearInterval(this.gateIntervalMap[control.uuidAction]);}
				controlStore.setState(posId, String(pos));
			} else {
				clearInterval(this.gateIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	jalousie(control: Control, msg: string) {
		switch (msg) {
			case 'down': this.startJalousie(control, 1); break;
			case 'DownOff': clearInterval(this.jalousieIntervalMap[control.uuidAction]); break;
			case 'up': this.startJalousie(control, -1); break;
			case 'UpOff': clearInterval(this.jalousieIntervalMap[control.uuidAction]); break;
			case 'FullDown': this.startJalousie(control, 1); break;
			case 'FullUp': this.startJalousie(control, -1); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startJalousie(control: Control, direction: number) {
		if (this.jalousieIntervalMap[control.uuidAction]) {
			clearInterval(this.jalousieIntervalMap[control.uuidAction]);
		}
		const positionId = control.states.position;
		let pos: number = Number(controlStore.getState(positionId));
		this.jalousieIntervalMap[control.uuidAction] = setInterval(() => {
			if (pos <= 1 && pos >= 0 ) {
				pos += 0.1 * direction;
				if (pos > 1) { pos = 1; clearInterval(this.jalousieIntervalMap[control.uuidAction]);}
				if (pos < 0) { pos = 0; clearInterval(this.jalousieIntervalMap[control.uuidAction]);}
				controlStore.setState(positionId, String(pos));
			} else {
				clearInterval(this.jalousieIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	timedSwitch(control: Control, msg: string) {
		const deactivationDelayId= control.states.deactivationDelay;
		let val: number = 0;
		switch (msg) {
			case 'on': clearInterval(this.timedSwitchIntervalMap[control.uuidAction]); val = -1; controlStore.setState(deactivationDelayId, String(val)); break;
			case 'off': clearInterval(this.timedSwitchIntervalMap[control.uuidAction]); val = 0; controlStore.setState(deactivationDelayId, String(val)); break;
			case 'pulse': this.startTimedSwitch(control); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startTimedSwitch(control: Control) {
		let deactivationDelayTotalId = controlStore.getState(control.states.deactivationDelayTotal);
		const stateId = control.states.deactivationDelay;
		clearInterval(this.timedSwitchIntervalMap[control.uuidAction]);
		this.timedSwitchIntervalMap[control.uuidAction] = setInterval(() => {
			if (deactivationDelayTotalId > 0) {
				deactivationDelayTotalId--;
				controlStore.setState(stateId, String(deactivationDelayTotalId));
			}
		}, 1000);
	}

	alarm(control: Control, msg: string) {
		const msgItems = msg.split('/');
		if (msg.includes('dismv/')) {
			switch (msgItems[1]) {
				case '0' : controlStore.setState(control.states.disabledMove, '0'); break;
				case '1' : controlStore.setState(control.states.disabledMove, '1'); break;
			}
			return;
		}
		if (msg == 'on') {
			controlStore.setState(control.states.armed, '1');
			return;
		}
		if (msg == 'off') {
			controlStore.setState(control.states.armed, '0');
			return;
		}
		if (msg.includes('delayedon/')) {
			setTimeout(() => {
				this.alarm(control, 'on/' + msgItems[1]);
			}, 2000);
			return;
		}
		if (msg.includes('on/')) {
			switch (msgItems[1]) {
				case '0' : controlStore.setState(control.states.armed, '1'); controlStore.setState(control.states.disabledMove, '1'); break;
				case '1' : controlStore.setState(control.states.armed, '1'); controlStore.setState(control.states.disabledMove, '0'); break;
			}
			return;
		}
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
	}

	alarmClock(control: Control, msg: string) {
		const entryListId = control.states.entryList;
		const nextEntryTimeId = control.states.nextEntryTime;
		const entryList = controlStore.getState(entryListId) as AlarmClockEntries; // note: proxy object!
		const msgItems = msg.split('/');
		if (msg.includes('entryList/put')) {
			if (entryList && entryList[msgItems[2]]) { // entry exists
				if (entryList[msgItems[2]].nightLight) { // alarm is nightlight
					entryList[msgItems[2]] = {
						name: msgItems[3],
						alarmTime: Number(msgItems[4]),
						isActive: msgItems[5] == '1' ? true : false,
						nightLight: true,
						daily: msgItems[6] == '1' ? true : false
					}
				} else { // other alarm clocks
					entryList[msgItems[2]] = {
						name: msgItems[3],
						alarmTime: Number(msgItems[4]),
						isActive: msgItems[5] == '1' ? true : false,
						nightLight: false,
						modes: msgItems[6].split(',').map(Number) // "1,2,3" -> [1,2,3]
					}
				}
			} else { // new entry
				entryList[msgItems[2]] = {
						name: msgItems[3],
						alarmTime: Number(msgItems[4]),
						isActive: msgItems[5] == '1' ? true : false,
						nightLight: false,
						modes: msgItems[6].split(',').map(Number) // "1,2,3" -> [1,2,3]
					}
			}
			controlStore.setState(nextEntryTimeId, String(new Date().valueOf()/1000 - 1230764400 + 3600)); // TODO
			return;
		}
		if (msg.includes('entryList/delete')) {
			if (entryList && entryList[msgItems[2]]) { // entry exists
				delete entryList[msgItems[2]];
			}
			return;
		}
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
	}

	smokeAlarm(control: Control, msg: string) {
		const msgItems = msg.split('/');
		if (msg.includes('servicemode/')) {
			this.smokeAlarmServiceMode(control, msgItems);
			return;
		}
	}

	smokeAlarmServiceMode(control: Control, msgItems: string[]) {
		let time = Number(msgItems[1]); // Override time given in seconds
		const timeServiceModeId = control.states.timeServiceMode;
		const levelId = control.states.level;
		if (!time) {
			clearInterval(this.smokeAlarmIntervalMap[control.uuidAction]);
			controlStore.setState(levelId, '0'); // 0 = no alarm
			controlStore.setState(timeServiceModeId, '0');
			return;
		}
		clearInterval(this.smokeAlarmIntervalMap[control.uuidAction]);
		this.smokeAlarmIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(levelId, '99'); // 99 = service mode
				controlStore.setState(timeServiceModeId, String(time));
			} else {
				controlStore.setState(levelId, '0'); // 0 = no alarm'
				controlStore.setState(timeServiceModeId, '0');
				clearInterval(this.smokeAlarmIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	ircv1(control: Control, msg: string) {
		const msgItems = msg.split('/');
		const overrideId = control.states.override;
		const ircDaytimer = Object.values(control.subControls);
		const valueId = ircDaytimer[0].states.value; // TODO select relevant DayTimer
		if (msg.includes('starttimer/')) {
			this.startIRCV1Timer(control, msgItems);
			return;
		}
		switch (msg) {
			case 'stoptimer': clearInterval(this.ircTimerIntervalMap[control.uuidAction]); controlStore.setState(overrideId, '0'); controlStore.setState(valueId, '0'); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startIRCV1Timer(control: Control, msgItems: string[]) {
		const modeId = controlStore.getState(control.states.mode);
		const isCooling = (modeId == 2 || modeId == 4 || modeId == 6);
		let time = Number(msgItems[2])*60; // Override time given in minutes
		const overrideId = control.states.override;
		this.daytimerOldValue = controlStore.getState(control.states.value);
		const ircDaytimer = Object.values(control.subControls);
		const ircDaytimerSelected = ircDaytimer.find( item => item.name == (isCooling ? 'Cooling' : 'Heating'));
		const valueId = ircDaytimerSelected?.states.value;
		const tempTargetId = control.states.tempTargetId;
		clearInterval(this.ircTimerIntervalMap[control.uuidAction]); /* stop time if still running */
		this.ircTimerIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(overrideId, String(time));
				controlStore.setState(valueId, String(msgItems[1]));
				controlStore.setState(tempTargetId, '23.3'); // TODO check via schedule
			} else {
				controlStore.setState(valueId, '0'); // TODO check schedule
				controlStore.setState(tempTargetId, '21.0'); // TODO check schedule
				clearInterval(this.ircTimerIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	ircv2(control: Control, msg: string) {
		const msgItems = msg.split('/');
		if (msg.includes('override/')) {
			this.startIRCV2Timer(control, msgItems);
			return;
		}
		switch (msg) {
			case 'stopOverride': this.stopIRCV2Timer(control); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startIRCV2Timer(control: Control, msgItems: string[]) {
		const selectedMode = Number(msgItems[1]);
		const currentMode = Number(controlStore.getState(control.states.currentMode));
		const isHeating = (currentMode == 1) || (currentMode == 4);
		const comfortTemperature = Number(controlStore.getState(control.states.comfortTemperature));
		const frostProtectTemperature = Number(controlStore.getState(control.states.frostProtectTemperature))
		const comfortTemperatureCool = Number(controlStore.getState(control.states.comfortTemperatureCool));
		const absentMaxOffset = Number(controlStore.getState(control.states.absentMaxOffset));
		let temp: number;
		switch (selectedMode) { /* mode */
			case 0: /* eco */ temp = (isHeating ? comfortTemperature : comfortTemperatureCool) - absentMaxOffset; break;
			case 1: /* comfort */ temp = (isHeating ? comfortTemperature : comfortTemperatureCool); break;
			case 2: /* build protect */ temp = frostProtectTemperature; break;
			case 3: /* manual */ temp = 22.2; break;
			case 4: /* off */ temp = frostProtectTemperature; break;
		}
		let time = Math.round((Number(msgItems[2])*1000 + utils.loxTimeRef - Date.now())/1000);
		const overrideEntries = [{ 
			start: String(Math.round((Date.now() - utils.loxTimeRef)/1000)),
			end: msgItems[2],
			reason: '0', /* TODO, now None */
			source: null,
			isTimer: true
		}];
		clearInterval(this.ircTimerIntervalMap[control.uuidAction]); /* stop time if still running */
		this.ircTimerIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(control.states.overrideEntries, overrideEntries);
				controlStore.setState(control.states.activeMode, msgItems[1]);
				controlStore.setState(control.states.tempTarget, String(temp)); // TODO check via schedule
			} else {
				this.stopIRCV2Timer(control);
			}
		}, 1000);
	}

	stopIRCV2Timer(control: Control) {
		const overrideOff = [{ 
			start: String(Math.round((Date.now() - utils.loxTimeRef)/1000)),
			end: String(Math.round((Date.now() - utils.loxTimeRef)/1000)),
			reason: '0', /* None */
			source: null,
			isTimer: false
		}];
		controlStore.setState(control.states.overrideEntries, overrideOff); // TODO check schedule
		controlStore.setState(control.states.tempTarget, '21.0'); // TODO check schedule
		clearInterval(this.ircTimerIntervalMap[control.uuidAction]);
	}

	daytimer(control: Control, msg: string) {
		const valueId = control.states.value;
		const overrideId = control.states.override;
		const msgItems = msg.split('/');
		if (msg.includes('startOverride/')) {
			this.startDaytimer(control, msgItems);
			return;
		}
		if (msg.includes('set/')) {
			this.setDayTimer(control, msgItems);
			return;
		}
		if (msg.includes('setc/')) { // IRCV1 cooling
			this.setDayTimer(control, msgItems);
			return;
		}
		switch (msg) {
			case 'stopOverride': {
				clearInterval(this.daytimerIntervalMap[control.uuidAction]); 
				controlStore.setState(overrideId, '0');
				controlStore.setState(valueId, String(this.daytimerOldValue));
				break;
			}
			default: {
				console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
			}
		}
	}

	startDaytimer(control: Control, msgItems: string[]) {
		let time = Number(msgItems[2]);
		const overrideId = control.states.override;
		this.daytimerOldValue = controlStore.getState(control.states.value);
		const valueId = control.states.value;
		clearInterval(this.daytimerIntervalMap[control.uuidAction]);
		this.daytimerIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(overrideId, String(time));
				controlStore.setState(valueId, String(msgItems[1]));
			} else {
				controlStore.setState(valueId, String(this.daytimerOldValue));
				clearInterval(this.daytimerIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	setDayTimer(control: Control, msgItems: string[]) {
		const entriesAndDefaultValueId = control.states.entriesAndDefaultValue;
		let entries = '{defValue: 0, entries: ' + msgItems[1] + ', entry: [\n';
		const modeList: string[] = [];
		for( let i = 0; i < Number(msgItems[1]); i++) {
			const item = msgItems[i+2].split(';');
			entries += '{mode: ' + item[0];
			entries += ', from: ' + utils.min2hours(Number(item[1]));
			entries += ', to: ' + utils.min2hours(Number(item[2]));
			entries += ', needActivate: ' + item[3];
			entries += ', value: ' + item[4];
			entries += '}\n';
			modeList.push(item[0]); // keep track of modes (may incl duplicates)
		}
		entries += '], uuid: 1}'; // TOOD replace by valid UUID
		this.setDayTimerModes(control, modeList);
		controlStore.setState(entriesAndDefaultValueId, entries);
	}

	setDayTimerModes(control: Control, modeList: string[]) {
		const modeListId = control.states.modeList;
		const opModes = controlStore.structure.operatingModes;
		const list = modeList.map( i => Number(i));
		const modes = list.filter((item, index) => list.indexOf(item) === index).sort();
		let modeListStr = "";
		let i = 0;
		modes.forEach( mode => {
			if (i>0) {
				modeListStr += ',';
			}
			modeListStr += String(i) + ':mode=' + String(mode) + ';name=\\\"' + opModes[String(mode)] + '\\\"';
			i++;
		});
		controlStore.setState(modeListId, modeListStr);
	}

	/**
	 * Dummy getFile in demo mode
	 */
	getFile(url: string) {
		console.log('TEST: getFile not yet implemented');
	}

	/**
	 * Dummy fetch in demo mode
	 */
	fetch(url: string) {
		console.log('TEST fetch:', url);
		switch (url) {
			case 'jdev/sps/io/__uuid_messageCenter/getEntries/2' : return this.createPromise(JSON.stringify(messageCenter)); // original miniserver response is a string, not an object
			case 'jdev/sps/io/__uuid__controls_intercom/securedDetails' : return this.createPromise(states.__uuid__controls_intercom_securedDetails);
			default: return this.createPromise(JSON.stringify({text: 'default reponse'}));
		}
	}

	/**
	 * disconnect demo mode
	 */
	disconnect() {
		controlStore.clearStructure();
		this.demoRunning = false;
	}

	private createPromise(msg: any) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(msg);
			}, 300);
		});
	}

	private getHsv(color: string) {
		const regex = new RegExp('hsv\\(([0-9]+),([0-9]+),([0-9]+)\\)');
		const found = color.match(regex);
		return found ? [found[1], found[2], found[3]] : []
	}
}
