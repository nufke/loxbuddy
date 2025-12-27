import { format } from 'date-fns';
import fmt from 'sprintf-js';

class Utils {

	loxTimeRef = 1230764400000; // correction to epoch, Loxone calculates from 1-1-2009

	// input: h in [0,360] and s,v in [0-100] - output: r,g,b in [0-255,0-255,0-255]
	hsv2rgb(h_: number, s_: number, v_: number): number[] {
		const h = h_;
		const s = s_ / 100;
		const v = v_ / 100;
		const clampround = (num: number, a: number, b: number) => Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
		const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
		return [
			clampround(f(5) * 255, 0, 255),
			clampround(f(3) * 255, 0, 255),
			clampround(f(1) * 255, 0, 255)
		];
	}

	// input: r,g,b in [0-255,0-255,0-255], output: h in [0,360] and s,v in [0-100]
	rgb2hsv(r: number, g: number, b: number) {
		const rabs: number = r / 255;
		const gabs: number = g / 255;
		const babs: number = b / 255;
		let rr: number;
		let gg: number;
		let bb: number;
		let h: number = 0;
		let s: number;
		const v = Math.max(rabs, gabs, babs);
		const diff = v - Math.min(rabs, gabs, babs);
		const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
		if (diff == 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rr = diffc(rabs);
			gg = diffc(gabs);
			bb = diffc(babs);
			if (rabs === v) {
				h = bb - gg;
			} else if (gabs === v) {
				h = (1 / 3) + rr - bb;
			} else if (babs === v) {
				h = (2 / 3) + gg - rr;
			}
			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}
		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			v: Math.round(v * 100)
		};
	}

	isValidJSONObject(str: string) {
		let obj;
		try {
			obj = JSON.parse(str);
		} catch {
			return false;
		}
		if (typeof obj === 'object') {
			return true;
		} else {
			return false;
		}
	}

	hours2dec(time: string) {
		if (!time) return 0; // empty input
		if (!time.includes(':')) return 0; // invalid input
		const hhmm = time.split(':'); // HH:mm notation
		return Number((Number(hhmm[0]) + Number(hhmm[1]) / 60).toFixed(2));
	}

	hours2sec(time: string) {
		if (!time) return 0; // empty input
		if (!time.includes(':')) return 0; // invalid input
		const hhmm = time.split(':'); // HH:mm notation
		return Number((Number(hhmm[0]) * 3600 + Number(hhmm[1]) * 60));
	}

	hours2min(time: string) {
		if (!time) return 0; // empty input
		if (!time.includes(':')) return 0; // invalid input
		const hhmm = time.split(':'); // HH:mm notation
		return Number((Number(hhmm[0]) * 60 + Number(hhmm[1])));
	}

	dec2hours(i: number) {
		const hrs = Math.floor(i/3600);
		const min = Math.round((Number(i/3600)-hrs) * 60);
		return hrs + ':' + (min < 10 ? '0' + min : min);
	}

	min2hours(i: number) {
		const hrs = Math.floor(i/60);
		const min = i - (hrs * 60);
		return hrs + ':' + (min < 10 ? '0' + min : min);
	}
	
	isDST(d: Date) { // correction for daylight saving time
		const jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
		const jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
		return Math.max(jan, jul) !== d.getTimezoneOffset();
	}

	decTime2date(time: number) {
		const hrs = Math.floor(time/3600);
		const min = Math.round((Number(time/3600)-hrs) * 60);
		const date = new Date();
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hrs, min);
	}

	hours2date(time: string) {
		const hhmm = time.split(':'); // HH:mm notation
		const date = new Date();
		return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hhmm[0]), Number(hhmm[1]));
	}

	hours2hours(time: string, correction: boolean = false) { // enable HH:mm notation (avoid H:mm)
		if (!time) return ''; // empty input
		if (!time.includes(':')) return ''; // invalid input
		const hhmm = time.split(':'); // HH:mm notation
		const hrs = (Number(hhmm[0]) == 24 && correction) ? 0 : Number(hhmm[0]); // possible conversion 24:00 -> 00:00
		const min = Number(hhmm[1]);
		return fmt.sprintf('%02i:%02i', hrs, min); 
	}

	time2epoch(dateEpoch: number, time: string | undefined) {
		if (!time) return 0; // empty input
		if (!time.includes(':')) return 0; // empty or invalid input
		const hhmm = time.split(':'); // HH:mm:ss notation, we ignore seconds
		const date = new Date(dateEpoch);
		const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hhmm[0]), Number(hhmm[1]));
		return dayStart.valueOf();
	}

	epoch2TimeStr(epoch: number) {
		const date = new Date(epoch*1000);
		return format(date, "p");
	}

	epoch2TimeStrNextHour(epoch: number) {
		let date = new Date(epoch*1000);
		const ext = date.getMinutes() ? 1 : 0;
		date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + ext);
		return format(date, "p");
	}
	
	serialize(value: any): string {
		return JSON.stringify(value);
	}

	deserialize(item: string | null) {
		return item ? JSON.parse(item) : null;
	}
	
	extractEntries(s: string) {
		//console.log('raw entries', s);
		if (!s || s.length == 0) return;
		let _s: string = s;
		_s = s.replaceAll('}\n{', '},\n{');											// fix array
		_s = _s.replace(/([a-zA-Z]+)(: )/gm, '"$1"$2');					// key as string
		_s = _s.replace(/(: )([a-zA-Z\-\d:]+)/gm, ': "$2"');		// value as string
		return JSON.parse(_s);
	}

	extractDayModes(s: string) {
		const obj: any = {};
		const regex = /mode=(\d+);name=\\\"([a-z,A-Z,\s,/]+)/g;
		for (const match of s.matchAll(regex)) {
			obj[match[1]] = match[2];
		}
		return obj;
	}

	generateUuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
			const r = Math.random()*16|0, v = c === 'x' ? r : (r & 0x3|0x8);
			return v.toString(16);
		});
	}

}

export const utils = new Utils();
