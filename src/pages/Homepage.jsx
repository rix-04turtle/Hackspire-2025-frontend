import React from 'react';
import Link from 'next/link';
import { Leaf, Sun, Cloud, Droplets } from 'lucide-react';
import Weather from '@/components/Weather/Weather';
import RainProbability from '@/components/Rain/RainProbability';
import CropDoctor from '@/components/CropDoctor/CropDoctor';

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Navigation Bar */}
      <nav className="bg-green-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex flex-col">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6" />
              <span className="text-2xl font-bold">Agrivani</span>
            </div>
            <span className="text-sm text-green-200 ml-8">Growing Future Together</span>
          </Link>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-green-200 transition-colors">Login</Link>
            <Link href="/signup" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Two-column area: weather (left) + placeholder (right) */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex justify-start">
            {/* Constrain Weather width on the left via prop */}
            <Weather className="w-full md:w-80" />
          </div>

          <div>
            {/* Right-side panel: Rain probability for the user's location */}
            <div>
              <RainProbability className="w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Crop Doctor section inserted below the weather/rain panels */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <CropDoctor />
        </div>
      </div>

      {/* Features grid removed as requested */}

      {/* CTA removed */}

      {/* Footer removed per request */}
    </div>
  );
};

export default Homepage;
