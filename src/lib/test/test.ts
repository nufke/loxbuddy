import { store } from '$lib/stores/store.svelte';
import type { Control } from '$lib/types/models';
import demo from '$lib/test/demo.json';
import states from '$lib/test/states.json';

class Test {

	timer: any = {};

	start() {
		console.log('TEST MODE: Use demo structure');
		store.initStructure(demo);
		store.setInitialStates(states);
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
		}
	}

	switch(control: Control, msg: string) {
		let state = control.states.active;
		let val;
		if (msg == 'on') val = '1';
		if (msg == 'off') val = '0';
		store.setState(state, val);
	}
	
	timedSwitch(control: Control, msg: string) {
		let state = control.states.deactivationDelay;
		let initDelay = store.getState(control.states.deactivationDelayTotal);

		let val: number = 0;
		switch (msg) {
			case 'on': clearInterval(this.timer[state]); val = -1; store.setState(state, String(val)); break;
			case 'off': clearInterval(this.timer[state]); val = 0; store.setState(state, String(val)); break;
			case 'pulse': { val = initDelay; clearInterval(this.timer[state]);
											this.timer[state] = setInterval(() => {
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