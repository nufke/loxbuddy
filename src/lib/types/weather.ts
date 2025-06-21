export type WeatherCurrentConditions = {
	time: number;								// Date
	location: string;
	conditions: string;					// description
	icon: string;
	airTemperature: number;
	stationPressure: number;
	relativeHumidity: number;
	windAverage: number;
	windDirection: number;			// angle
	uv: number;
	feelsLike: number;
	lightingStrikeCount1h: number;
	lightingStrikeDistance: number;
	precipitationToday: number;
	sunRise: string;						// hh:mm
	sunSet: string;							// hh:mm
};

export type WeatherDailyForecast = {
	time: number;								// epoch
	conditions: string;					// description
	icon: string;
	sunRise: string;						// hh:mm
	sunSet: string;							// hh:mm
	airTemperatureHigh: number;
	airTemperatureLow: number;
	precipitationProbability: number;	// percent
};

export type WeatherHourlyForecast = {
	time: number;								// epoch
	conditions: string;					// description
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
