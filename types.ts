
export interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  high: string;
  low: string;
  humidity: string;
  windSpeed: string;
  uvIndex: string;
  visibility: string;
  forecast: ForecastDay[];
  summary: string;
  sources: { title: string; uri: string }[];
}

export interface ForecastDay {
  day: string;
  temp: string;
  condition: string;
  icon: string;
}

export interface HourlyData {
  time: string;
  temp: number;
}
