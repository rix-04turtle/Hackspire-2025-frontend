import React from 'react';
import { Video, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function LiveCropDoctorPromo({ className = '' }) {
    const router = useRouter();
    
    return (
        <div className={`px-2 ${className}`}>
            <div 
                onClick={() => router.push('/live-crop-doctor')} 
                className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-lg p-4 cursor-pointer hover:shadow-2xl transition-all transform hover:scale-[1.02] relative overflow-hidden"
            >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                
                {/* Content */}
                <div className="relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                        <Sparkles className="w-3 h-3 text-yellow-300" />
                        <span className="text-xs font-semibold text-white">NEW</span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Live Crop Doctor
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            </h3>
                            <p className="text-sm text-blue-100">Real-time AI Analysis with Gemini Live</p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-white">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm">Live video analysis as you show your crops</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Video className="w-4 h-4" />
                            <span className="text-sm">Instant disease detection & diagnosis</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm">Voice conversation with AI expert</span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <span className="text-white font-semibold">Try Live Mode Now</span>
                        <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}
