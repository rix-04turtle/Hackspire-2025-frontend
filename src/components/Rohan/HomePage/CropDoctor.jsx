import React from 'react';
import { Leaf, Upload, Camera, Stethoscope, Pill } from 'lucide-react';
import { useRouter } from 'next/router';

export default function CropDoctor({ className = '' }) {
    const router = useRouter();
    
    return (
        <div className={`px-2 ${className}`}>
            <div 
                onClick={() => router.push('/beta/image-upload')} 
                className="bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Crop Doctor</h3>
                        <p className="text-xs text-gray-600">AI-Powered Crop Disease Detection</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Upload Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Camera className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Quick Capture</h3>
                        <p className="text-xs text-gray-600">Upload photos for instant analysis</p>
                    </div>

                    {/* Diagnosis Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Smart Diagnosis</h3>
                        <p className="text-xs text-gray-600">AI-powered disease detection</p>
                    </div>

                    {/* Treatment Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <Pill className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Treatment Plan</h3>
                        <p className="text-xs text-gray-600">Get personalized solutions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}