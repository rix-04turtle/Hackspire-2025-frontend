import React, { useEffect, useState } from 'react';

// Simple weather component that uses Open-Meteo (no API key) and browser geolocation.
export default function Weather({ className = '' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchWeather(lat, lon) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );
        const data = await res.json();
        if (!mounted) return;
        if (data && data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
            winddir: data.current_weather.winddirection,
            weathercode: data.current_weather.weathercode,
          });
        } else {
          setError('No weather data available');
        }
      } catch (e) {
        setError('Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchWeather(lat, lon);
        },
        (err) => {
          setError('Location access denied. Allow location to show local weather.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported by this browser.');
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  function weatherDescription(code) {
    // Simplified mapping of weather codes from Open-Meteo
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow/Grains';
    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
  }

  return (
    // Allow parent to control width/placement via className prop
    <div className={`px-2 py-2 ${className}`}>
      <div className="w-full">
  <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between h-28">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4 4 4 0 00-4-4H7a4 4 0 00-4 4z" /></svg>
            </div>
            <div>
              <div className="text-sm text-gray-500">Local Weather</div>
              {loading ? (
                <div className="text-lg font-medium text-gray-700">Detecting...</div>
              ) : error ? (
                <div className="text-sm text-red-500">{error}</div>
              ) : weather ? (
                <div className="flex items-baseline gap-3">
                  <div className="text-2xl font-bold text-green-800">{Math.round(weather.temp)}°C</div>
                  <div className="text-sm text-gray-600">{weatherDescription(weather.weathercode)}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">No data</div>
              )}
            </div>
          </div>

          <div className="text-right text-sm text-gray-600">
            {weather && !loading && (
              <div>
                <div>Wind: {Math.round(weather.windspeed)} km/h</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
