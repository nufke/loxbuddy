import { store } from '$lib/stores/store.svelte';
import type { Control } from '$lib/types/models';
import demo from '$lib/test/demo.json';
import states from '$lib/test/states.json';

class Test {

	_timer: any = {};
	_jalousie: any = {};

	start() {
		console.log('TEST MODE: Use demo structure');
		store.initStructure(demo);
		store.setInitialStates(states);
		let i = 0;
		let j = 0;
		let val = [ "0.0234", "0", "0", "0.500", "-0.400", "0", "2", "-2", "0"];
		let soc = [ "100", "80", "60", "40", "20", "0"];
		
		setInterval(() => {
			store.setState("__uuid_controls_PV_meter_states_actual", val[i]);
			store.setState("__uuid_controls_Batterij_states_actual", val[2+i]);
			store.setState("__uuid_controls_Net_states_actual", val[4+i]);
			if (i==2) { i = 0; } else { i++; }
		}, 2000);

		setInterval(() => {
			store.setState("__uuid_controls_Batterij_states_storage", soc[j]);
			if (j==5) { j = 0; } else { j++; }
		}, 1000);

	}

	exec(uuid: string, topic: string, msg: string) {
		let control = store.controls[uuid];
		//console.log('control', control);
		if (control) {
			this.action(control, uuid, msg);
		}
	}
	
	action(control: Control, uuid: string, msg: string) {
		switch (control.type) {
			case 'Switch' : this.switch(control, msg); break;
			case 'TimedSwitch': this.timedSwitch(control, msg); break;
			case 'Jalousie': this.jalousie(control, msg); break;
		}
	}

	switch(control: Control, msg: string) {
		let state = control.states.active;
		let val;
		if (msg == 'on') val = '1';
		if (msg == 'off') val = '0';
		store.setState(state, val);
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
				if (pos>1) { pos = 1; clearInterval(this._jalousie[control.uuidAction]);}
				if (pos<0) { pos = 0; clearInterval(this._jalousie[control.uuidAction]);}
				store.setState(posId, String(pos));
			} else {
				clearInterval(this._jalousie[control.uuidAction]);
			}}, 1000);
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