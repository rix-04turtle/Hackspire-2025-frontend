import React from 'react';

const WeatherForecast = ({ forecastData }) => {
    if (!forecastData || !forecastData.list) return null;

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 p-4 bg-white/20 backdrop-blur-md rounded-lg min-w-[640px]">
                {forecastData.list.map((day, index) => (
                    <div 
                        key={index} 
                        className="flex flex-col items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <p className="font-semibold text-sm mb-1">
                            {new Date(day.dt * 1000).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                        <img 
                            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                            alt={day.weather[0].description}
                            className="w-16 h-16"
                        />
                        <div className="flex gap-2 text-sm font-medium">
                            <span className="text-yellow-300">{Math.round(day.temp.max)}°</span>
                            <span className="text-blue-300">{Math.round(day.temp.min)}°</span>
                        </div>
                        <p className="text-sm mt-1">{day.weather[0].main}</p>
                        <div className="mt-2 text-xs text-gray-300">
                            <p>Humidity: {day.humidity}%</p>
                            <p>Wind: {Math.round(day.speed * 3.6)} km/h</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherForecast;
