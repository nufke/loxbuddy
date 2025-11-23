export type WeatherCurrentConditions = {
	time: number;												// epoch time
	location: string;										// location name
	conditions: string;									// description
	icon: string;
	airTemperature: number;
	stationPressure: number;
	relativeHumidity: number;
	windAverage: number;
	windDirection: number;							// angle
	uv?: number;
	feelsLike: number;
	lightingStrikeCount1h?: number;
	lightingStrikeDistance?: number;
	precipitationToday: number;
	solarRadiation: number;
	sunRise: string;										// hh:mm
	sunSet: string;											// hh:mm
};

export type WeatherDailyForecast = {
	time: number;											// epoch time (start of day)
	conditions: string;								// description
	icon: string;
	airTemperatureHigh: number;
	airTemperatureLow: number;
	precipitationProbability: number;	// percent
	sunRise?: string;									// hh:mm
	sunSet?: string;									// hh:mm
};

export type WeatherHourlyForecast = {
	time: number;											// epoch time (current time)
	date: number;											// epoch date (start of day)
	hour: number;											// hour (12=noon)
	conditions: string;								// description
	icon: string;
	airTemperature: number;
	precipitationProbability: number;	// percent
	windAverage: number;
	windDirection: number;						// angle
};

export type WeatherForecast = {
	daily: WeatherDailyForecast[];
	hourly: WeatherHourlyForecast[];
};

export type WeatherUnits = {
	unitsTemp: string;
	unitsWind: string;
	unitPrecipitation: string;
	unitPressure: string;
	unitBrightness: string;
	unitDistance: string;
};
