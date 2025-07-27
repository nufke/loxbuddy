import { store } from '$lib/stores/store.svelte';
import type { Control } from '$lib/types/models';
import demo from '$lib/test/demo.json';
import states from '$lib/test/states.json';

class Test {

	_timer: any = {};
	_jalousie: any = {};
	_dimmer: any = {}
	_gate: any = {}
	
	start() {
		console.log('TEST MODE: Use demo structure');
		store.initStructure(demo);
		store.setInitialStates(states);
		let i = 0;
		let j = 0;
		let k = false; // used for InfoOnlyDigital
		let m = 0; // used for InfoOnlyAnalog
		let val = [ "0.0234", "0", "0", "0.500", "-0.400", "0", "2", "-2", "0"];
		let soc = [ "100", "80", "60", "40", "20", "0"];
		let fase = [ "0.1", "0.2", "0.3", "0.4", "-0.2", "-0.1"];
		
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
			if (subControl[0]) {
				control = store.controls[subControl[0]].subControls[uuid];
			}
		}
		if (control) {
			this.action(control, msg);
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
			default: console.log('control not tested ', control.name, ' of type', control.type);
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
		if (msg == 'open') this.moveGate(control, 1); // 1 = open and 0 = closed
		if (msg == 'stop') clearInterval(this._gate[control.uuidAction]);
		if (msg == 'close') this.moveGate(control, 0);
		if (msg == 'partiallyOpen') this.moveGate(control, 0.5); // to 50%
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
		if (msg == 'down') this.startJalousie(control, 1);
		if (msg == 'DownOff') clearInterval(this._jalousie[control.uuidAction]);
		if (msg == 'up') this.startJalousie(control, -1);
		if (msg == 'UpOff') clearInterval(this._jalousie[control.uuidAction]);
		if (msg == 'FullDown') this.startJalousie(control, 1);
		if (msg == 'FullUp') this.startJalousie(control, -1);
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
		let state = control.states.deactivationDelay;
		let initDelay = store.getState(control.states.deactivationDelayTotal);

		let val: number = 0;
		switch (msg) {
			case 'on': clearInterval(this._timer[state]); val = -1; store.setState(state, String(val)); break;
			case 'off': clearInterval(this._timer[state]); val = 0; store.setState(state, String(val)); break;
			case 'pulse': { val = initDelay; clearInterval(this._timer[state]);
											this._timer[state] = setInterval(() => {
												if (val>0) {
													val--;
													store.setState(state, String(val));
												}}, 1000);
											break;
										}
		}
	}
}

export const test = new Test();