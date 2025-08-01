import { store } from '$lib/stores/store.svelte';
import type { Control, AlarmClockEntry } from '$lib/types/models';
import { utils } from '$lib/helpers/utils';
import demo from '$lib/test/demo.json';
import states from '$lib/test/states.json';
import { format } from 'date-fns';

class Test {

	_timedSwitch: any = {};
	_jalousie: any = {};
	_dimmer: any = {}
	_gate: any = {}

	start() {
		console.log('TEST MODE: Use demo structure');
		let i = 0;
		let j = 0;
		let k = false; // used for InfoOnlyDigital
		let m = 0; // used for InfoOnlyAnalog
		let val = [ "0.0234", "0", "0", "0.500", "-0.400", "0", "2", "-2", "0"];
		let soc = [ "100", "80", "60", "40", "20", "0"];
		let fase = [ "0.1", "0.2", "0.3", "0.4", "-0.2", "-0.1"];

		// loadding of structure and states delayed to test uninitialized variables
		setTimeout( () => {
			store.initStructure(demo);
		}, 100);

		setTimeout( () => {
			store.setInitialStates(states);
		}, 5000);

		// Meter
		setInterval(() => {
			store.setState("__uuid_controls_PV_meter_states_actual", val[i]);
			store.setState("__uuid_controls_Batterij_states_actual", val[2+i]);
			store.setState("__uuid_controls_Net_states_actual", val[4+i]);
			if (i==2) { i = 0; } else { i++; }
		}, 2000);

		// Meter (battery)
		setInterval(() => {
			store.setState("__uuid_controls_Batterij_states_storage", soc[j]);
			if (j==5) { j = 0; } else { j++; }
		}, 1000);

		// InfoOnlyAnalog
		setInterval(() => {
			store.setState("__uuid__controls_Fase_1", fase[m]);
			if (m==5) { m = 0; } else { m++; }
		}, 2000);

		// InfoOnlyDigital
		setInterval(() => {
			store.setState("__uuid__controls_Aanvraag_warmte", k ? "1": "0");
			k = !k;
		}, 1000);
	}

	exec(uuid: string, topic: string, msg: string) {
		let control = store.controls[uuid];
		if (!control) {
			let subControl = uuid.split('/');
			if (subControl && subControl[0] && store.controls[subControl[0]]) {
				control = store.controls[subControl[0]].subControls[uuid];
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
			case 'IRoomController': this.irc(control, msg); break;
			default: console.error('No TEST for Control', control.name, 'of type', control.type);
		}
	}

	switch(control: Control, msg: string) {
		let stateId = control.states.active;
		let val;
		if (msg == 'on') val = '1';
		if (msg == 'off') val = '0';
		store.setState(stateId, val);
	}

	radio(control: Control, msg: string) {
		let stateId = control.states.activeOutput;
		let val = msg =='reset' ? 0 : msg;
		store.setState(stateId, val);
	}

	dimmer(control: Control, msg: string) {
		let stateId = control.states.position;
		if (Number(msg) > 0) {
			this._dimmer[control.uuidAction] = msg; // store last value;
		}
		let val = msg;
		if (msg == 'off') val = '0'; 
		if (msg == 'on') val = this._dimmer[control.uuidAction];
		store.setState(stateId, val);
	}

	colorPickerV2(control: Control, msg: string) {
		let stateId = control.states.color;
		store.setState(stateId, msg);
	}

	valueSelector(control: Control, msg: string) {
		let stateId = control.states.value;
		store.setState(stateId, msg);
	}

	slider(control: Control, msg: string) {
		let stateId = control.states.value;
		store.setState(stateId, msg);
	}

	infoOnlyDigital(control: Control, msg: string) {
		let stateId = control.states.active;
		store.setState(stateId, msg);
	}

	lightControllerV2(control: Control, msg: string) {
		let stateId = control.states.activeMoodsNum;
		let val = msg.split('/');
		store.setState(stateId, val[1]);
	}

	gate(control: Control, msg: string) { 
		switch (msg) {
		 	case 'open': this.moveGate(control, 1); break;// 1 = open and 0 = closed
			case 'stop': clearInterval(this._gate[control.uuidAction]); break;
			case 'close': this.moveGate(control, 0); break;
			case 'partiallyOpen': this.moveGate(control, 0.5); break; // to 50%
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	moveGate(control: Control, endState: number) {
		if (this._gate[control.uuidAction]) {
			clearInterval(this._gate[control.uuidAction]);
		}
		let posId = control.states.position;
		let pos: number = Number(store.getState(posId));
		let direction = Math.sign(endState-pos);
		this._gate[control.uuidAction] = setInterval(() => {
			if (pos <= 1 && pos >= 0 ) {
				pos += 0.1 * direction;
				if (pos>1) { pos = 1; clearInterval(this._gate[control.uuidAction]);}
				if (pos<0) { pos = 0; clearInterval(this._gate[control.uuidAction]);}
				if (Math.round(pos*10) == endState*10 ) { clearInterval(this._gate[control.uuidAction]);}
				store.setState(posId, String(pos));
			} else {
				clearInterval(this._gate[control.uuidAction]);
			}
		}, 1000);
	}

	jalousie(control: Control, msg: string) {
		switch (msg) {
			case 'down': this.startJalousie(control, 1); break;
			case 'DownOff': clearInterval(this._jalousie[control.uuidAction]); break;
			case 'up': this.startJalousie(control, -1); break;
			case 'UpOff': clearInterval(this._jalousie[control.uuidAction]); break;
			case 'FullDown': this.startJalousie(control, 1); break;
			case  'FullUp': this.startJalousie(control, -1); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startJalousie(control: Control, direction: number) {
		if (this._jalousie[control.uuidAction]) {
			clearInterval(this._jalousie[control.uuidAction]);
		}
		let posId = control.states.position;
		let pos: number = Number(store.getState(posId));
		this._jalousie[control.uuidAction] = setInterval(() => {
			if (pos <= 1 && pos >= 0 ) {
				pos += 0.1 * direction;
				if (pos > 1) { pos = 1; clearInterval(this._jalousie[control.uuidAction]);}
				if (pos < 0) { pos = 0; clearInterval(this._jalousie[control.uuidAction]);}
				store.setState(posId, String(pos));
			} else {
				clearInterval(this._jalousie[control.uuidAction]);
			}
		}, 1000);
	}

	timedSwitch(control: Control, msg: string) {
		let stateId= control.states.deactivationDelay;
		let val: number = 0;
		switch (msg) {
			case 'on': clearInterval(this._timedSwitch[control.uuidAction]); val = -1; store.setState(stateId, String(val)); break;
			case 'off': clearInterval(this._timedSwitch[control.uuidAction]); val = 0; store.setState(stateId, String(val)); break;
			case 'pulse': this.startTimedSwitch(control); break;
			default: console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
		}
	}

	startTimedSwitch(control: Control) {
		let val = store.getState(control.states.deactivationDelayTotal);
		let stateId = control.states.deactivationDelay;
		clearInterval(this._timedSwitch[control.uuidAction]);
		this._timedSwitch[control.uuidAction] = setInterval(() => {
			if (val > 0) {
				val--;
				store.setState(stateId, String(val));
			}
		}, 1000);
	}

	alarm(control: Control, msg: string) {
		let msgItems = msg.split('/');
		if (msg.includes('dismv/')) {
			switch (msgItems[1]) {
				case '0' : store.setState(control.states.disabledMove, '0'); break;
				case '1' : store.setState(control.states.disabledMove, '1'); break;
			}
			return;
		}
		if (msg == 'on') {
			store.setState(control.states.armed, '1');
			return;
		}
		if (msg == 'off') {
			store.setState(control.states.armed, '0');
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
				case '0' : store.setState(control.states.armed, '1'); store.setState(control.states.disabledMove, '1'); break;
				case '1' : store.setState(control.states.armed, '1'); store.setState(control.states.disabledMove, '0'); break;
			}
			return;
		}
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
	}

	alarmClock(control: Control, msg: string) {
		let entryListId = control.states.entryList;
		let nextEntryTimeId = control.states.nextEntryTime;
		let entryList = store.getState(entryListId);
		let msgItems = msg.split('/');
		if (msg.includes('entryList/put')) {
			if (entryList && entryList[msgItems[2]]) { // entry exists
				console.log('TODO entry exists')
			} else { // new entry
				let newEntry: AlarmClockEntry = this.alarmClockAddEntry();
				let size = entryList ? Object.keys(entryList).length : -1;
				if (size == -1) {
					entryList = {};
				}
				entryList[size+1] = newEntry;
				store.setState(nextEntryTimeId, String(new Date().valueOf()/1000 - 1230764400 + 3600)); // TODO
				store.setState(entryListId, entryList);
			}
			return;
		}
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
	}

	alarmClockAddEntry() {
		let day = format(new Date(), 'eeee');
		let opModes = store.structure.operatingModes;
		let idx = Object.keys(opModes).find( (key) => opModes[key].toLowerCase() == day);
		let date = new Date();
		let entry: AlarmClockEntry = {
			name: 'Alarm clock',
			alarmTime: utils.hours2sec(format(date, 'p')),
			isActive: true,
			modes: [Number(idx)], 
			nightLight: false,
			daily: false
		};
		return entry;
	}

	irc(control: Control, msg: string) {
		let msgItems = msg.split('/');
		console.error('Command', msg, 'not found for Control', control.uuidAction, control.type);
	}
}

export const test = new Test();