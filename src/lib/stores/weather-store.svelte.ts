import { SvelteMap } from 'svelte/reactivity';
import type { WeatherCurrentConditions, WeatherDailyForecast, WeatherHourlyForecast } from '$lib/types/weather';

let weatherIcons: any = {
	wind: 'wind',
	tstorms: 'thunderstorms',
	sunny: 'clear',
	snow: 'snow',
	sleet: 'sleet',
	rain: 'rain',
	partlysunny: 'partly-cloudy',
	partlycloudy: 'partly-cloudy',
	overcast: 'overcast',
	mostlysunny: 'mostly-clear',
	mostlycloudy: 'overcast',
	hazy: 'haze',
	fog: 'fog',
	flurries: 'flurries',
	cloudy: 'overcast',
	clear: 'clear',
	chancetstorms: 'thunderstorms',
	chancesnow: 'snow',
	chancesleet: 'sleet',
	chancerain: 'rain',
	chanceflurries: 'flurries'
}

let weatherCodes: any = {
	1: 'Clear',
	2: 'Partly cloudy',
	3: 'Mostly cloudy',
	4: 'Cloudy',
	5: 'Hazy',
	6: 'Foggy',
	7: 'Very hot',
	8: 'Very cold',
	9: 'Blowing snow',
	10: 'Showers possible',
	11: 'Showers',
	12: 'Rain likely',
	13: 'Rain',
	14: 'Thunderstorms possible',
	15: 'Thunderstorms',
	16: 'Flurry',
	18: 'Flurries possible',
	19: 'Sleet',
	20: 'Snow possible',
	21: 'Snow',
	22: 'Windy',
	23: 'Rain and snow',
	26: 'Rain and snow',
	28: 'Light rain and snow ',
	29: 'Rain and snow',
}

class WeatherStore {
  observations = new SvelteMap();
	current: WeatherCurrentConditions = $derived(this.processCurrent()); //WeatherCurrentConditions
	daily: WeatherDailyForecast[] = $derived(this.processDaily());
  hourly: WeatherHourlyForecast[] = $derived(this.processHourly());

	constructor() {
  }

	processCurrent() {
		let current = String(this.observations.get('current'));
		let field = current.split('|');
		let item = {
			time: new Date(String(field[1])).valueOf(),
			conditions: weatherCodes[field[28]],
			icon: weatherIcons[field[27]], 
			location: String(field[5]),
			airTemperature: Math.round(Number(field[11])),
			stationPressure: Math.round(Number(field[19])),
			relativeHumidity: Math.round(Number(field[13])),
			windAverage: Math.round(Number(field[16])),
			windDirection: Math.round(Number(field[15]))+180,
			uv: Math.round(Number(field[24])),
			feelsLike: Math.round(Number(field[12])),
			lightingStrikeCount1h: 0, // TODO not in weather forecast?
			lightingStrikeDistance: 25, // TODO not in weather forecast?
			precipitationToday: Math.round(Number(field[26])),
			solarRadiation: Math.round(Number(field[22])),
			sunRise: String(Number(field[34])) + ':' + String(field[35]),
			sunSet: String(Number(field[36])) + ':' + String(field[37])
		}
		//console.log('current', item, field, field[1] );
		return item;
	}

	processDaily() {
		let temp: WeatherDailyForecast[] = [];
		let daily = String(this.observations.get('daily'));
		let days = daily.split('\n');
		days.forEach(day => {
			let field = day.split('|');
			let item: WeatherDailyForecast = {
				time: Number(field[1])*1000,
				conditions: weatherCodes[field[26]],
				icon: weatherIcons[field[25]], 
				sunRise:  String(Number(field[33])) + ':' + String(field[34]),
				sunSet: String(Number(field[35])) + ':' + String(field[36]),
				airTemperatureHigh: Math.round(Number(field[11])),
				airTemperatureLow: Math.round(Number(field[12])),
				precipitationProbability: Math.round(Number(field[13])),
			};
			if (item.time) temp.push(item);
		});
		//console.log("days", daily, days);
		return temp;
	}

	processHourly() {
		let temp: WeatherHourlyForecast[] = [];
		let hourly = String(this.observations.get('hourly'));
		let hours = hourly.split('\n');
		hours.forEach(hour => {
			let field = hour.split('|');
			let item: WeatherHourlyForecast = {
				time: Number(field[1])*1000,
				conditions: String(field[29]),
				icon: weatherIcons[field[28]], 
				airTemperature: Math.round(Number(field[11])),
				precipitationProbability: Math.round(Number(field[26])),
				windAverage: Math.round(Number(field[17])),
				windDirection: Math.round(Number(field[16]))+180,
			};
			if (item.time) temp.push(item);
		});
		//console.log("hourly", hourly, hours);
		return temp;
	}

	getObservation(id: string) {
		return this.observations.get(id);
	}

	setObservation(key: string, data: any) {
		let item = $state(data);
		this.observations.set(key, item);
	}
}

export const weatherStore = new WeatherStore();
