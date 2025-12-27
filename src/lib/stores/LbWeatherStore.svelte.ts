import { SvelteMap } from 'svelte/reactivity';
import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast, WeatherCodes, SolarRadiationClass } from '$lib/types/weather';
import * as SunCalc from 'suncalc';
import { utils } from '$lib/helpers/Utils';

const LoxWeatherCodes: WeatherCodes = {
	1: ['Clear', 'clear'],
	2: ['Bright', 'clear'],
	3: ['Bright', 'clear'],
	4: ['Bright', 'clear'],
	5: ['Bright', 'clear'],
	6: ['Bright', 'clear'],
	7: ['Partly cloudy', 'partly-cloudy'],
	8: ['Partly cloudy', 'partly-cloudy'],
	9: ['Partly cloudy', 'partly-cloudy'],
	10: ['Partly cloudy', 'partly-cloudy'],
	11: ['Partly cloudy', 'partly-cloudy'],
	12: ['Partly cloudy', 'partly-cloudy'],
	13: ['Clear', 'clear'],
	14: ['Bright', 'clear'],
	15: ['Bright', 'clear'],
	16: ['Fog', 'fog'],
	17: ['Fog', 'fog'],
	18: ['Fog', 'fog'],
	19: ['Very cloudy', 'cloudy'],
	20: ['Very cloudy', 'cloudy'],
	21: ['Very cloudy', 'cloudy'],
	22: ['Overcast', 'overcast'],
	23: ['Rain', 'rain'],
	24: ['Snow', 'snow'],
	25: ['Heavy rain', 'rain'],
	26: ['Heavy snow', 'snow'],
	27: ['Heavy thunderstorm', 'thunderstorms'],
	28: ['Thunderstorm', 'thunderstorms'],
	29: ['Heavy snow showers', 'snow'],
	30: ['Heavy thunderstorm', 'thunderstorms'],
	31: ['Light rain showers', 'rain'],
	32: ['Light snow showers', 'snow'],
	33: ['Light rain', 'rain'],
	34: ['Light snow showers', 'snow'],
	35: ['Sleet', 'sleet']
}

const solarRadiationClass: SolarRadiationClass = {
	0: '0 - 20%',
	1: '20 - 40%',
	2: '40 - 60%',
	3: '60 - 100%',
}
/**
 * LbWeatherStore to store current weather conditions and waether forecast
 * It fetches weather data in Lox-specific format from a given weatherUrl.
 */
class LbWeatherStore {
	observations = new SvelteMap<string, string>();
	current: WeatherCurrentConditions = $derived({});
	daily: WeatherDailyForecast[] = $derived([]);
	hourly: WeatherHourlyForecast[] = $derived([]);
	days = $state(0);

	id: string = '';
	name: string = '';
	longitude: string = '';
	latitude: string = '';
	height: string = '';
	country: string = '';
	timezone: string = '';
	utcDelta: string = '';
	sunrise: string = '';
	sunset: string = '';

	constructor() {
	}

	getObservation(id: string) {
		return this.observations.get(id);
	}

	setObservation(key: string, data: string) {
		const item = $state(data);
		this.observations.set(key, item);
	}

	startWeatherForecast(url: string) {
		if (!url.length) {
			console.info('[LbWeatherStore] No weatherforecast since weatherUrl is empty');
			return;
		}
		this.fetchWeatherForecast(url); 
		setInterval( () => {
			this.fetchWeatherForecast(url);
		}, 1000 * 60 * 5); // fetch weather forecast every 5 minutes
	}

	fetchWeatherForecast(url: string) {
		console.info('[LbWeatherStore] Fetch weather forecast');
		fetch(url)
		.then(response => response.text())
		.then(data => this.grabWeatherData(data));
	}

	grabWeatherData(data: string) {
		const regex = new RegExp('<station>(.*)</station>', 's');
		const found = data.match(regex);
		let list: string[];
		if (found && found[1]) {
			list = found[1].split('\n');
			this.processCurrent(list);
			this.processHourly(list);
			this.processDaily();
		}
	}

	processCurrent(list: string[]) {
		const station = list[1].replace(/\t/g,'').split(';');
		const current = list[2].replace(/\t/g,'').split(';');
		this.id = station[0];
		this.name = station[1];
		this.longitude = station[2];
		this.latitude = station[3];
		this.height = station[4];
		this.country = station[5];
		this.timezone = station[6];
		this.utcDelta = station[7].slice(3).replace('.', ':'); // transform to +HH:mm notation
		this.sunrise = station[8];
		this.sunset = station[9];
		const dateArr = current[0].split('.');
		const dateStr = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}T${current[2]}:00:00.000${this.utcDelta}`; // format YYYY-MM-DDTHH:mm:ss.sss+HH:mm
		const moon = SunCalc.getMoonIllumination(new Date());

		this.current = {
			time: new Date(dateStr).valueOf(),
			conditions: LoxWeatherCodes[current[17]][0],
			icon: LoxWeatherCodes[current[17]][1], 
			location: station[1],
			airTemperature: Math.round(Number(current[3])),
			stationPressure: Math.round(Number(current[14])),
			relativeHumidity: Math.round(Number(current[15])),
			windAverage: Math.round(Number(current[5])),
			windDirection: Math.round(Number(current[6]))+180,
			feelsLike: Math.round(Number(current[4])),
			precipitationToday: Math.round(Number(current[11])),
			solarRadiation: this.calcSolarRadiationClass(Number(current[18])),
			sunRise: station[8],
			sunSet: station[9],
			moonPhase: moon.phase,
			moonPercent: Math.round((moon.fraction*100)*10)/10
		}
		//console.debug('[LbWeatherStore] current observation', this.current);
	}

	calcSolarRadiationClass(radiation: number) {
		const percent100 = 1376; // 100% = 1376 W/m2
		if (radiation < percent100/5) return solarRadiationClass[0]; 
		if (radiation < (percent100/5)*2) return solarRadiationClass[1];
		if (radiation < (percent100/5)*3) return solarRadiationClass[2];
		return solarRadiationClass[4];
	}

	processHourly(list: string[]) {
		const temp: WeatherHourlyForecast[] = [];
		let dayCount = 0;
		let prevDay = '';
		for(let i = 2; i < list.length-1; i++) {
			const hour = list[i].replace(/\t/g,'').split(';');
			const dateArr = hour[0].split('.');
			const timeStr = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}T${hour[2]}:00:00.000${this.utcDelta}`;
			const dateStr = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}T00:00:00.000${this.utcDelta}`;
			if (prevDay != dateArr[0]) {
				dayCount++;
				prevDay = dateArr[0];
			}
			const item: WeatherHourlyForecast = {
				time: new Date(timeStr).valueOf(),
				date: new Date(dateStr).valueOf(),
				hour: Number(hour[2]),
				conditions: LoxWeatherCodes[Number(hour[17])][0],
				icon: LoxWeatherCodes[(Number(hour[17]))][1], 
				airTemperature: Math.round(Number(hour[3])),
				precipitationProbability: Math.round(Number(hour[12])),
				windAverage: Math.round(Number(hour[5])),
				windDirection: Math.round(Number(hour[6]))+180,
			};
			if (item.time) temp.push(item)
		}
		this.hourly = temp;
		this.days = dayCount;
		//console.debug('[LbWeatherStore] hourly forecast', this.hourly, dayCount)
	}

	processDaily() {
		const temp: WeatherDailyForecast[] = []; 
		const startDate = this.hourly[0].date;
		for(let i = 1; i <= this.days; i++) {
			const hours = this.hourly.filter(h => h.date == startDate + (i-1) * 24 * 3600 * 1000 );
			const noon = hours.find( n => n.hour == 12);
			const sunTime = hours.length ? SunCalc.getTimes(new Date(hours[0].date + 12 * 3600 * 1000), Number(this.latitude), Number(this.longitude)) : null;
			if (hours.length) {
				const item: WeatherDailyForecast = {
					time: hours[0].date,
					conditions: noon ? noon.conditions : hours[0].conditions,
					icon: noon ? noon.icon : hours[0].icon,
					airTemperatureHigh: Math.max(...hours.map( h => h.airTemperature)),
					airTemperatureLow: Math.min(...hours.map( h => h.airTemperature)),  
					precipitationProbability: Math.max(...hours.map( h => h.precipitationProbability)),
					sunRise: sunTime ? utils.epoch2TimeStr(sunTime.sunrise.valueOf()/1000) : '',
					sunSet: sunTime ? utils.epoch2TimeStr(sunTime.sunset.valueOf()/1000) : ''
				};
				if (item.time) temp.push(item);
			}
		}
		this.daily = temp;
		//console.debug('[LbWeatherStore] daily forecast', this.daily)
	}
}

export const weatherStore = new LbWeatherStore();
