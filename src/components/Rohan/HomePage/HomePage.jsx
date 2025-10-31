import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import Weather from './Weather';
import RainProbability from './RainProbability';
import CropDoctor from './CropDoctor';
import BottomNav from './BottomNav';
import ChatBot from './ChatBot';
import Script from 'next/script';

const Homepage = () => {
  return (
    <div 
      className="min-h-screen pb-16 relative"
      style={{
        backgroundImage: 'url("https://i.pinimg.com/originals/ef/0b/27/ef0b27eebc4ed0cce9617771c9256155.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="bg-gradient-to-r from-green-900/85 to-green-800/85 text-white shadow-lg sticky top-0 z-50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto flex justify-between items-center p-3">
            <Link href="/" className="group flex flex-col transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-green-400 to-green-500 p-1.5 rounded-lg shadow-lg 
                  group-hover:shadow-green-500/25 transition-all duration-500 ease-out transform 
                  group-hover:scale-110 group-hover:rotate-[-5deg]">
                  <Leaf className="h-5 w-5 text-white transform transition-transform duration-500 
                    group-hover:rotate-[5deg]" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                  from-white via-white to-green-200 transform transition-all duration-500 
                  group-hover:scale-105">
                  Agrivani
                </span>
              </div>
              <span className="text-sm text-green-200 ml-8 opacity-75 group-hover:opacity-100 
                transition-all duration-500 group-hover:translate-x-1">
                Growing Future Together
              </span>
            </Link>
            <div className="space-x-4 flex items-center">
              <Link 
                href="/login" 
                className="relative hover:text-green-200 transition-all duration-500 hover:scale-105 
                  text-green-100 group"
              >
                <span>Login</span>
                <span className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent 
                  via-green-200 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform 
                  duration-500 ease-out"></span>
              </Link>
              <Link 
                href="/signup" 
                className="relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 
                  hover:to-green-700 px-6 py-2.5 rounded-lg transition-all duration-500 ease-out 
                  hover:scale-[1.02] shadow-md hover:shadow-lg hover:shadow-green-500/25
                  font-medium border border-white/10 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/30 to-green-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative z-10">Sign Up</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 space-y-8 mt-6">
          {/* Weather and Rain Probability Section */}
          <section className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div 
                className="group bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-2xl 
                  shadow-xl p-6 transform transition-all duration-500 ease-out hover:shadow-2xl 
                  hover:shadow-green-500/10 hover:scale-[1.01] motion-safe:hover:-translate-y-0.5
                  border border-white/10 hover:border-green-200/30 relative overflow-hidden animate-fade-in"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 
                  group-hover:opacity-100 transition-all duration-700 ease-out" />
                <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent 
                  via-green-200/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                <div className="relative z-10">
                  <Weather className="w-full" />
                </div>
              </div>

              <div 
                className="group bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-2xl 
                  shadow-xl p-6 transform transition-all duration-500 ease-out hover:shadow-2xl 
                  hover:shadow-blue-500/10 hover:scale-[1.01] motion-safe:hover:-translate-y-0.5
                  border border-white/10 hover:border-blue-200/30 relative overflow-hidden animate-fade-in delay-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-0 
                  group-hover:opacity-100 transition-all duration-700 ease-out" />
                <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent 
                  via-blue-200/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                <div className="relative z-10">
                  <RainProbability className="w-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Crop Doctor Section */}
          <section className="max-w-6xl mx-auto">
            <div className="group bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-2xl 
              shadow-xl p-4 transform transition-all duration-500 ease-out hover:shadow-2xl 
              border border-white/10 hover:border-green-200/30 relative overflow-hidden animate-fade-in delay-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 opacity-0 
                group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent 
                via-green-200/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-green-200/50 
                  hover:scrollbar-thumb-green-300 scrollbar-track-transparent transition-colors duration-300">
                  <CropDoctor className="py-2" />
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Chatbot with improved positioning: TEMPORARILY DISABLED */}
        {/* <div className="fixed bottom-20 right-4 z-40 animate-fade-in-up delay-300">
          <div className="transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-500 ease-out">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl 
                blur opacity-30 group-hover:opacity-100 group-hover:blur-md transition-all duration-700 ease-out"></div>
              <div className="relative transform transition-transform duration-500 ease-out hover:scale-[1.01]">
                <ChatBot />
              </div>
            </div>
          </div>
        </div> */}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
      <elevenlabs-convai agent-id="agent_3501k8xn1jg6fsk8j9abme625s3e"></elevenlabs-convai>
      <Script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></Script>
    </div>
  );
};

export default Homepage;