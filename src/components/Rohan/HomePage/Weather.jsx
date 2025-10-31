import React, { useEffect, useState } from 'react';
import { 
    Sun, 
    Cloud, 
    CloudDrizzle, 
    CloudRain, 
    CloudSnow, 
    CloudFog, 
    CloudLightning,
    Cloudy,
    CloudSun
} from 'lucide-react';

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
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
                );
                const data = await res.json();
                if (!mounted) return;
                if (data && data.current_weather) {
                    // Get current hour's humidity
                    const currentHour = new Date().getHours();
                    const currentHumidity = data.hourly.relativehumidity_2m[currentHour];

                    setWeather({
                        temp: data.current_weather.temperature,
                        windspeed: data.current_weather.windspeed,
                        winddir: data.current_weather.winddirection,
                        weathercode: data.current_weather.weathercode,
                        humidity: currentHumidity,
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

    function getWeatherInfo(code) {
        // Return both description and icon component for weather codes from Open-Meteo
        if (code === 0) return { description: 'Clear', icon: Sun, color: 'text-yellow-500' };
        if (code === 1) return { description: 'Mainly clear', icon: CloudSun, color: 'text-yellow-500' };
        if (code === 2) return { description: 'Partly cloudy', icon: CloudSun, color: 'text-gray-500' };
        if (code === 3) return { description: 'Overcast', icon: Cloudy, color: 'text-gray-500' };
        if (code >= 45 && code <= 48) return { description: 'Fog', icon: CloudFog, color: 'text-gray-400' };
        if (code >= 51 && code <= 57) return { description: 'Drizzle', icon: CloudDrizzle, color: 'text-blue-400' };
        if (code >= 61 && code <= 67) return { description: 'Rain', icon: CloudRain, color: 'text-blue-500' };
        if (code >= 71 && code <= 77) return { description: 'Snow', icon: CloudSnow, color: 'text-blue-200' };
        if (code >= 80 && code <= 82) return { description: 'Rain showers', icon: CloudRain, color: 'text-blue-600' };
        if (code >= 95 && code <= 99) return { description: 'Thunderstorm', icon: CloudLightning, color: 'text-yellow-600' };
        return { description: 'Unknown', icon: Cloud, color: 'text-gray-400' };
    }

    return (
        // Allow parent to control width/placement via className prop
        <div className={`px-2 py-2 ${className}`}>
            <div className="w-full">
                <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between h-28">
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                                <Cloud className="w-6 h-6 text-gray-400" />
                            </div>
                        ) : error ? (
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-red-400" />
                            </div>
                        ) : weather ? (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${getWeatherInfo(weather.weathercode).color.replace('text-', 'bg-').replace('500', '100').replace('600', '100').replace('400', '50')}`}>
                                {React.createElement(getWeatherInfo(weather.weathercode).icon, {
                                    className: `w-6 h-6 ${getWeatherInfo(weather.weathercode).color}`
                                })}
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-gray-500">Local Weather</div>
                            {loading ? (
                                <div className="text-lg font-medium text-gray-700">Detecting...</div>
                            ) : error ? (
                                <div className="text-sm text-red-500">{error}</div>
                            ) : weather ? (
                                <div className="flex items-baseline gap-3">
                                    <div className="text-2xl font-bold text-gray-800">{Math.round(weather.temp)}°C</div>
                                    <div className="text-sm text-gray-600">{getWeatherInfo(weather.weathercode).description}</div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600">No data</div>
                            )}
                        </div>
                    </div>

                    <div className="text-right text-sm text-gray-600">
                        {weather && !loading && (
                            <div className="space-y-1">
                                <div>Wind: {Math.round(weather.windspeed)} km/h</div>
                                <div>Humidity: {Math.round(weather.humidity)}%</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}