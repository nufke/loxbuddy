import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export class Utils {

	// input: h in [0,360] and s,v in [0-100] - output: r,g,b in [0-255,0-255,0-255]
	static hsv2rgb(h_: number, s_: number, v_: number): number[] {
		const h = h_;
		const s = s_ / 100;
		const v = v_ / 100;
		const clampround = (num: number, a: number, b: number) => Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
		let f = (n: any, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
		return [
			clampround(f(5) * 255, 0, 255),
			clampround(f(3) * 255, 0, 255),
			clampround(f(1) * 255, 0, 255)
		];
	}

	// input: r,g,b in [0-255,0-255,0-255], output: h in [0,360] and s,v in [0-100]
	static rgb2hsv(r: number, g: number, b: number) {
		let rabs: number;
		let gabs: number;
		let babs: number;
		let rr: number;
		let gg: number;
		let bb: number;
		let h: any;
		let s: number;
		let v: number;
		let diff;
		let diffc;
		let percentRoundFn: number;
		rabs = r / 255;
		gabs = g / 255;
		babs = b / 255;
		v = Math.max(rabs, gabs, babs),
			diff = v - Math.min(rabs, gabs, babs);
		diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
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

	static isValidJSONObject(str: string) {
		let obj;
		try {
			obj = JSON.parse(str);
		} catch (e) {
			return false;
		}
		if (typeof obj === 'object') return true;
		else false;
	}

	static hours2dec(t:string) {
		let hhmm = t.split(':'); // HH:mm notation
		return Number((Number(hhmm[0]) + Number(hhmm[1]) / 60).toFixed(2));
	}

	static dec2hours(i: number) {
		let hrs = Math.floor(i/3600);
		let min = Math.round((Number(i/3600)-hrs) * 60);
		return hrs + ':' + min;
	}

	static isDST(d: Date) { // correction for daylight saving time
    let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
    let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== d.getTimezoneOffset();    
	}

	static time2epoch(dateEpoch: number, time: string) {
		let hhmm = time.split(':'); // HH:mm notation
		let date = new Date(dateEpoch);
		let dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), Number(hhmm[0]), Number(hhmm[1]));
		return dayStart.valueOf();
	}

	static epoch2TimeStr(epoch: number) {
		const date = new Date(epoch*1000);
		const time = Utils.isDST(date) ? new Date(epoch*1000 - 3600000) : date;
		return format(time, "p",{locale: nl});
	}

}
