import React, { useEffect, useState } from 'react';

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

  function badgeColor(p) {
    if (p >= 75) return 'bg-red-600 text-white';
    if (p >= 40) return 'bg-yellow-400 text-black';
    return 'bg-green-200 text-green-800';
  }

  return (
    <div className={`px-2 py-2 ${className}`}>
      <div className="w-full">
        {/* Compact card with fixed height to match weather card */}
        <div className="bg-white p-4 rounded-lg shadow h-28 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-green-900">Rain Probability</h3>
            {loading ? (
              <div className="text-sm text-gray-600">Detecting location...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : stats ? (
              <div className="mt-1 text-sm text-gray-700">
                <div>Max: <span className="font-semibold">{stats.max}%</span></div>
                <div>Avg: <span className="font-medium">{stats.avg}%</span></div>
              </div>
            ) : null}
          </div>

          <div className="text-right">
            {/* Simple badge showing overall risk */}
            {stats && (
              <div className={`px-3 py-1 rounded-full text-sm ${badgeColor(stats.max)}`}>{stats.max}%</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
