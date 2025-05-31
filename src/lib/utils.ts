export class Utils {

	// input: h in [0,360] and s,v in [0-100] - output: r,g,b in [0-255,0-255,0-255]
	static hsv2rgb(h_: number, s_: number, v_: number): number[] {                              
		const h = h_;
		const s = s_ / 100;
		const v = v_ / 100;
		const clampround = (num: number, a: number, b: number) => Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
  	let f = (n, k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);
		return [
			clampround(f(5) * 255, 0, 255),
			clampround(f(3) * 255, 0, 255),
			clampround(f(1) * 255, 0, 255)
		];
	} 

	static hsv2rgb_old2(h_: number, s_: number, v_: number): number[] {
    const h = h_;
		const s = s_ / 100;
		const v = v_ / 100;
		
		let r, g, b, i, f, p, q, t;

		i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
		];
}

	static hsv2rgb_old(h_: number, s_: number, v_: number): number[] {
		const clampround = (num: number, a: number, b: number) => Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
		const h = h_ / 60;
		const s = s_ / 100;
		const v = v_ / 100;
		const i = Math.floor(h);
		const f = h - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);
		const mod = i % 6;
		const r = [v, q, p, p, t, v][mod];
		const g = [t, v, v, q, p, p][mod];
		const b = [p, p, t, v, v, q][mod];
		return [
			clampround(r * 255, 0, 255),
			clampround(g * 255, 0, 255),
			clampround(b * 255, 0, 255)
		];
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

}
