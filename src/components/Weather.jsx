import { useState, useEffect } from 'react';
import WeatherForecast from './WeatherForecast';

const Weather = () => {
    const [showForecast, setShowForecast] = useState(false);
    const [forecastData, setForecastData] = useState(null);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);

    useEffect(() => {
        // Get user's location when component mounts
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    // Fetch current weather immediately when we get location
                    fetchCurrentWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setError("Unable to get your location. Please enable location services.");
                }
            );
        } else {
            setError("Geolocation is not supported by your browser");
        }
    }, []);

    const fetchCurrentWeather = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.NEXT_PUBLIC_YOUR_API_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch current weather');
            const data = await response.json();
            setCurrentWeather(data);
        } catch (error) {
            console.error('Error fetching current weather:', error);
        }
    };

    const handleWeatherClick = async () => {
        if (!location) {
            setError("Location is not available");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather-forecast?lat=${location.latitude}&lon=${location.longitude}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch weather forecast');
            }
            
            const data = await response.json();
            setForecastData(data);
            setShowForecast(!showForecast); // Toggle forecast view
        } catch (error) {
            console.error('Error fetching forecast:', error);
            setError('Failed to load weather forecast. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full">
            <div 
                onClick={handleWeatherClick} 
                className={`cursor-pointer transform transition-all duration-300 ease-in-out ${showForecast ? 'scale-95' : 'hover:scale-105'}`}
            >
                <div className="p-6 bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-lg rounded-xl shadow-lg">
                    {currentWeather ? (
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {Math.round(currentWeather.main.temp)}°C
                                </h2>
                                <p className="text-blue-100 font-medium">
                                    {currentWeather.weather[0].main}
                                </p>
                                <p className="text-blue-200 text-sm mt-1">
                                    {currentWeather.name}
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <img 
                                    src={`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`}
                                    alt={currentWeather.weather[0].description}
                                    className="w-16 h-16"
                                />
                                <div className="text-center text-sm text-blue-100">
                                    <p>H: {Math.round(currentWeather.main.temp_max)}°</p>
                                    <p>L: {Math.round(currentWeather.main.temp_min)}°</p>
                                </div>
                            </div>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <p className="text-red-200 text-sm p-4">{error}</p>
                    ) : (
                        <p className="text-blue-100 text-center p-4">Loading weather data...</p>
                    )}
                </div>
            </div>
            
            <div className={`mt-4 transform transition-all duration-500 ease-in-out ${showForecast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                {forecastData && <WeatherForecast forecastData={forecastData} />}
            </div>
        </div>
    );
};

export default Weather;