
import React, { useState, useEffect, useCallback } from 'react';
import { getWeatherData, generateWeatherImage } from './services/geminiService';
import { WeatherData } from './types';
import WeatherCard from './components/WeatherCard';
import WeatherChart from './components/WeatherChart';

const App: React.FC = () => {
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [bgImage, setBgImage] = useState('https://picsum.photos/1920/1080?nature');
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (searchCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherData(searchCity);
      setWeatherData(data);
      
      // Update background based on condition
      const imageUrl = await generateWeatherImage(data.condition, searchCity);
      setBgImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather('London');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeather(city);
    }
  };

  return (
    <div 
      className="weather-bg relative min-h-screen text-white flex flex-col"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header / Search */}
      <header className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-50 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
            <i className="fa-solid fa-cloud-bolt text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">SkyCast <span className="text-blue-500">AI</span></h1>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input 
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-medium placeholder-slate-400"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
          >
            GO
          </button>
        </form>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {loading ? (
          <div className="col-span-12 flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-xl font-medium animate-pulse">Syncing with atmospheric satellites...</p>
          </div>
        ) : error ? (
          <div className="col-span-12 glass p-8 rounded-3xl text-center">
            <i className="fa-solid fa-triangle-exclamation text-5xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold mb-2">Observation Failed</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button 
              onClick={() => fetchWeather('London')}
              className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : weatherData ? (
          <>
            {/* Main Weather Hero */}
            <section className="lg:col-span-8 flex flex-col gap-8">
              <div className="glass p-8 md:p-12 rounded-[2rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                   <i className={`fa-solid ${weatherData.condition.toLowerCase().includes('rain') ? 'fa-cloud-showers-heavy' : weatherData.condition.toLowerCase().includes('cloud') ? 'fa-cloud' : 'fa-sun'} text-[12rem] -rotate-12`}></i>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-slate-400 font-bold tracking-widest uppercase mb-4">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{weatherData.location}</span>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-8 mb-8">
                    <h2 className="text-8xl md:text-9xl font-black tracking-tighter">
                      {weatherData.temperature.split(' ')[0]}
                    </h2>
                    <div className="flex flex-col">
                      <span className="text-3xl md:text-4xl font-bold text-blue-400">{weatherData.condition}</span>
                      <span className="text-xl text-slate-400">High: {weatherData.high} • Low: {weatherData.low}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <WeatherCard label="Humidity" value={weatherData.humidity} icon="fa-solid fa-droplet" />
                    <WeatherCard label="Wind" value={weatherData.windSpeed} icon="fa-solid fa-wind" />
                    <WeatherCard label="UV Index" value={weatherData.uvIndex} icon="fa-solid fa-sun" />
                    <WeatherCard label="Visibility" value={weatherData.visibility} icon="fa-solid fa-eye" />
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Temperature Trend</h3>
                  <div className="flex gap-2">
                    <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">HOURLY</span>
                    <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold cursor-not-allowed">WEEKLY</span>
                  </div>
                </div>
                <WeatherChart />
              </div>
            </section>

            {/* Sidebar / AI Summary */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-blue-600 p-8 rounded-[2rem] shadow-2xl shadow-blue-600/30">
                <div className="flex items-center gap-2 mb-6">
                  <i className="fa-solid fa-bolt-lightning text-xl"></i>
                  <h3 className="text-xl font-bold uppercase tracking-tight">AI Insights</h3>
                </div>
                <div className="text-lg leading-relaxed font-medium text-blue-50">
                   {weatherData.summary.split('\n').map((line, i) => (
                     <p key={i} className="mb-4 last:mb-0">{line}</p>
                   ))}
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem] flex-1">
                <h3 className="text-xl font-bold mb-6">Grounded Sources</h3>
                <div className="space-y-4">
                  {weatherData.sources.length > 0 ? weatherData.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                    >
                      <div className="text-xs text-blue-400 font-bold mb-1 uppercase tracking-wider">Reference {i + 1}</div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2">{source.title}</div>
                      <div className="text-[10px] text-slate-500 mt-2 truncate italic">{source.uri}</div>
                    </a>
                  )) : (
                    <div className="text-slate-500 italic text-center p-8">Searching reliable networks...</div>
                  )}
                </div>
              </div>
            </aside>
          </>
        ) : (
          <div className="col-span-12 flex items-center justify-center h-96">
            <p className="text-slate-400 text-xl font-medium">Please enter a location to begin...</p>
          </div>
        )}
      </main>

      <footer className="p-10 border-t border-white/5 mt-auto text-center text-slate-500 text-sm">
        <p>© 2024 SkyCast AI • Powered by Gemini Flash 3.0 • Real-time Grounded Search</p>
      </footer>
    </div>
  );
};

export default App;
