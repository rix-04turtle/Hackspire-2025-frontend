import React, { useEffect, useState } from 'react';
import { CloudRainWind, CloudDrizzle, Cloud, CloudSun, Droplets } from 'lucide-react';

// Shows rain probability for the next 24 hours using Open-Meteo's hourly precipitation_probability
export default function RainProbability({ className = '' }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function fetchRain(lat, lon) {
            try {
                // Request hourly precipitation_probability for next 48 hours to be safe
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation_probability&forecast_days=2&timezone=auto`;
                const res = await fetch(url);
                const data = await res.json();

                if (!mounted) return;

                if (data && data.hourly && data.hourly.precipitation_probability) {
                    // Use first 24 hours of values
                    const probs = data.hourly.precipitation_probability.slice(0, 24);
                    const max = Math.max(...probs);
                    const avg = Math.round(probs.reduce((s, v) => s + v, 0) / probs.length);
                    // Find hour index with max
                    const maxIndex = probs.indexOf(max);

                    setStats({ max, avg, probs, maxIndex, timezone: data.timezone || '' });
                } else {
                    setError('No precipitation data available');
                }
            } catch (e) {
                setError('Failed to fetch rain probability');
            } finally {
                setLoading(false);
            }
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchRain(pos.coords.latitude, pos.coords.longitude),
                () => {
                    setError('Location access denied. Allow location to see rain probability.');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation not supported');
            setLoading(false);
        }

        return () => {
            mounted = false;
        };
    }, []);

    function getRainInfo(probability) {
        if (probability >= 75) {
            return {
                icon: CloudRainWind,
                color: 'text-blue-600',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-800',
                label: 'High chance of rain'
            };
        }
        if (probability >= 40) {
            return {
                icon: CloudDrizzle,
                color: 'text-blue-500',
                bgColor: 'bg-blue-50',
                textColor: 'text-blue-700',
                label: 'Moderate chance'
            };
        }
        if (probability >= 20) {
            return {
                icon: Cloud,
                color: 'text-gray-500',
                bgColor: 'bg-gray-50',
                textColor: 'text-gray-700',
                label: 'Low chance'
            };
        }
        return {
            icon: CloudSun,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-700',
            label: 'Unlikely to rain'
        };
    }

    return (
        <div className={`px-2 py-2 ${className}`}>
            <div className="w-full">
                <div className="bg-white p-4 rounded-lg shadow h-28 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {loading ? (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                                <Droplets className="w-6 h-6 text-gray-400" />
                            </div>
                        ) : error ? (
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-red-400" />
                            </div>
                        ) : stats ? (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRainInfo(stats.max).bgColor}`}>
                                {React.createElement(getRainInfo(stats.max).icon, {
                                    className: `w-6 h-6 ${getRainInfo(stats.max).color}`
                                })}
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                        
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">Rain Probability</h3>
                                {stats && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRainInfo(stats.max).bgColor} ${getRainInfo(stats.max).textColor}`}>
                                        {stats.max}%
                                    </span>
                                )}
                            </div>
                            {loading ? (
                                <div className="text-sm text-gray-600">Detecting location...</div>
                            ) : error ? (
                                <div className="text-sm text-red-500">{error}</div>
                            ) : stats ? (
                                <div className="text-sm text-gray-600">{getRainInfo(stats.max).label}</div>
                            ) : null}
                        </div>
                    </div>

                    {stats && !loading && (
                        <div className="text-right">
                            <div className="text-xs text-gray-500">24hr Average</div>
                            <div className={`text-sm font-medium ${getRainInfo(stats.avg).textColor}`}>
                                {stats.avg}%
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}