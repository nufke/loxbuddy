import { controlStore } from '$lib/stores/LbControlStore.svelte';
import type { Control, AlarmClockEntries } from '$lib/types/models';
import { utils } from '$lib/helpers/Utils';
import structure from '$lib/test/demoStructure.json';
import states from '$lib/test/demoStates.json';
import userSettings from '$lib/test/userSettings.json';
import notification from '$lib/test/notifications.json';
import messageCenter from '$lib/test/messageCenter.json';

type IntervalMap = {
	[key: string]: NodeJS.Timeout;
}

class Test {
	private timedSwitchIntervalMap: IntervalMap = {};
	private jalousieIntervalMap: IntervalMap = {};
	private dimmerLastValue: {[key: string]: string} = {};
	private gateIntervalMap: IntervalMap = {};
	private daytimerIntervalMap: IntervalMap = {};
	private daytimerOldValue: {[key: string]: string} = {};
	private ircv1timerIntervalMap: IntervalMap = {};
	private smokeAlarmIntervalMap: IntervalMap = {};

	start() {
		console.info('TEST MODE: Use demo structure');
		let i = 0;
		let j = 0;
		let k = false; // used for InfoOnlyDigital
		let m = 0; // used for InfoOnlyAnalog
		const val = [ "0.0234", "0", "0", "0.500", "-0.400", "0", "2", "-2", "0"];
		const soc = [ "100", "80", "60", "40", "20", "0"];
		const fase = [ "0.1", "0.2", "0.3", "0.4", "-0.2", "-0.1"];

		// loadding of structure and states delayed to test uninitialized variables
		setTimeout( () => {
			controlStore.initStructure(structure);
		}, 100);

		setTimeout( () => {
			controlStore.setInitialStates(states);
			controlStore.userSettings = userSettings;
			controlStore.updateNotificationMap(notification);
		}, 2000);

		// Meter
		setInterval(() => {
			controlStore.setState("__uuid_controls_pv_meter_states_actual", val[i]);
			controlStore.setState("__uuid_controls_battery_states_actual", val[2+i]);
			controlStore.setState("__uuid_controls_net_states_actual", val[4+i]);
			if (i==2) { i = 0; } else { i++; }
		}, 2000);

		// Meter (battery)
		setInterval(() => {
			controlStore.setState("__uuid_controls_battery_states_storage", soc[j]);
			if (j==5) { j = 0; } else { j++; }
		}, 1000);

		// InfoOnlyAnalog
		setInterval(() => {
			controlStore.setState("__uuid__controls_phase_1", fase[m]);
			if (m==5) { m = 0; } else { m++; }
		}, 2000);

		// InfoOnlyDigital
		setInterval(() => {
			controlStore.setState("__uuid__controls_heating_request", k ? "1": "0");
			k = !k;
		}, 1000);
	}

	exec(uuid: string, msg: string) {
		let control: Control = controlStore.controls[uuid];
		if (!control) { // if no control found, check if the uuid is a subcontrol
			const parentControl = controlStore.controlList.find( control => control.subControls && control.subControls[uuid])
			if (parentControl) {
				control = parentControl.subControls[uuid];
			}
		}
		if (control) {
			this.action(control, msg);
		} else {
			console.error('Control or subControl not found:', uuid);
		}
	}

	action(control: Control, msg: string) {
		switch (control.type) {
			case 'Switch' : this.switch(control, msg); break;
			case 'TimedSwitch': this.timedSwitch(control, msg); break;
			case 'Jalousie': this.jalousie(control, msg); break;
			case 'ValueSelector': this.valueSelector(control, msg); break;
			case 'Radio': this.radio(control, msg); break;
			case 'Slider': this.slider(control, msg); break;
			case 'InfoOnlyDigital': this.infoOnlyDigital(control, msg); break;
			case 'LightControllerV2': this.lightControllerV2(control, msg); break;
			case 'Dimmer': this.dimmer(control, msg); break;
			case 'ColorPickerV2': this.colorPickerV2(control, msg); break;
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

	switch(control: Control, msg: string) {
		const stateId = control.states.active;
		let val;
		if (msg == 'on') val = '1';
		if (msg == 'off') val = '0';
		controlStore.setState(stateId, val);
	}

	radio(control: Control, msg: string) {
		const stateId = control.states.activeOutput;
		const val = msg =='reset' ? 0 : msg;
		controlStore.setState(stateId, val);
	}

	dimmer(control: Control, msg: string) {
		const stateId = control.states.position;
		if (Number(msg) > 0) {
			this.dimmerLastValue[control.uuidAction] = msg; // store last value;
		}
		let val = msg;
		if (msg == 'off') val = '0'; 
		if (msg == 'on') val = this.dimmerLastValue[control.uuidAction];
		controlStore.setState(stateId, val);
	}

	colorPickerV2(control: Control, msg: string) {
		const stateId = control.states.color;
		controlStore.setState(stateId, msg);
	}

	valueSelector(control: Control, msg: string) {
		const stateId = control.states.value;
		controlStore.setState(stateId, msg);
	}

	slider(control: Control, msg: string) {
		const stateId = control.states.value;
		controlStore.setState(stateId, msg);
	}

	infoOnlyDigital(control: Control, msg: string) {
		const stateId = control.states.active;
		controlStore.setState(stateId, msg);
	}

	lightControllerV2(control: Control, msg: string) {
		const stateId = control.states.activeMoodsNum;
		const val = msg.split('/');
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
		const posId = control.states.position;
		let pos: number = Number(controlStore.getState(posId));
		this.jalousieIntervalMap[control.uuidAction] = setInterval(() => {
			if (pos <= 1 && pos >= 0 ) {
				pos += 0.1 * direction;
				if (pos > 1) { pos = 1; clearInterval(this.jalousieIntervalMap[control.uuidAction]);}
				if (pos < 0) { pos = 0; clearInterval(this.jalousieIntervalMap[control.uuidAction]);}
				controlStore.setState(posId, String(pos));
			} else {
				clearInterval(this.jalousieIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	timedSwitch(control: Control, msg: string) {
		const stateId= control.states.deactivationDelay;
		let val: number = 0;
		switch (msg) {
			case 'on': clearInterval(this.timedSwitchIntervalMap[control.uuidAction]); val = -1; controlStore.setState(stateId, String(val)); break;
			case 'off': clearInterval(this.timedSwitchIntervalMap[control.uuidAction]); val = 0; controlStore.setState(stateId, String(val)); break;
			case 'pulse': this.startTimedSwitch(control); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startTimedSwitch(control: Control) {
		let val = controlStore.getState(control.states.deactivationDelayTotal);
		const stateId = control.states.deactivationDelay;
		clearInterval(this.timedSwitchIntervalMap[control.uuidAction]);
		this.timedSwitchIntervalMap[control.uuidAction] = setInterval(() => {
			if (val > 0) {
				val--;
				controlStore.setState(stateId, String(val));
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
		const timeServiceMode = control.states.timeServiceMode;
		const level = control.states.level;
		if (!time) {
			clearInterval(this.smokeAlarmIntervalMap[control.uuidAction]);
			controlStore.setState(level, '0'); // 0 = no alarm
			controlStore.setState(timeServiceMode, '0');
			return;
		}
		clearInterval(this.smokeAlarmIntervalMap[control.uuidAction]);
		this.smokeAlarmIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(level, '99'); // 99 = service mode
				controlStore.setState(timeServiceMode, String(time));
			} else {
				controlStore.setState(level, '0'); // 0 = no alarm'
				controlStore.setState(timeServiceMode, '0');
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
			case 'stoptimer': clearInterval(this.ircv1timerIntervalMap[control.uuidAction]); controlStore.setState(overrideId, '0'); controlStore.setState(valueId, '0'); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startIRCV1Timer(control: Control, msgItems: string[]) {
		const mode = controlStore.getState(control.states.mode);
		const isCooling = (mode == 2 || mode == 4 || mode == 6);
		let time = Number(msgItems[2])*60; // Override time given in minutes
		const overrideId = control.states.override;
		this.daytimerOldValue = controlStore.getState(control.states.value);
		const ircDaytimer = Object.values(control.subControls);
		const ircDaytimerSelected = ircDaytimer.find( item => item.name == (isCooling ? 'Cooling' : 'Heating'));
		const valueId = ircDaytimerSelected?.states.value;
		const tempTargetId = control.states.tempTargetId;
		clearInterval(this.ircv1timerIntervalMap[control.uuidAction]);
		this.ircv1timerIntervalMap[control.uuidAction] = setInterval(() => {
			if (time > 0) {
				time--;
				controlStore.setState(overrideId, String(time));
				controlStore.setState(valueId, String(msgItems[1]));
				controlStore.setState(tempTargetId, '23.3'); // TODO check via schedule
			} else {
				controlStore.setState(valueId, '0'); // TODO check schedule
				controlStore.setState(tempTargetId, '21.0'); // TODO check schedule
				clearInterval(this.ircv1timerIntervalMap[control.uuidAction]);
			}
		}, 1000);
	}

	ircv2(control: Control, msg: string) {
		// TODO
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
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
		const entriesId = control.states.entriesAndDefaultValue;
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
		controlStore.setState(entriesId, entries);
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
	 * Dummy fetch in test mode
	 */
	fetch(url: string) {
		console.log('TEST fetch:', url);
		switch (url) {
			case 'jdev/sps/io/__uuid_messageCenter/getEntries/2' : return this.createPromise(JSON.stringify(messageCenter)); // original miniserver response is a string, not an object
			case 'jdev/sps/io/__uuid__controls_intercom/securedDetails' : return this.createPromise(states.__uuid__controls_intercom_securedDetails);
			default: return this.createPromise(JSON.stringify({text: 'default reponse'}));
		}
	}

	private createPromise(msg: any) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(msg);
			}, 300);
		});
	}
}

export const test = new Test();
