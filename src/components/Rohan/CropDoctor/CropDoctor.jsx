import React from 'react';
import { Camera, Upload, Search, Microscope, Leaf, ThumbsUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CropDoctor = () => {
    const steps = [
        {
            icon: <Camera className="w-8 h-8" />,
            title: "Capture Image",
            description: "Take a clear photo of the affected plant leaf or area",
            color: "bg-green-500"
        },
        {
            icon: <Upload className="w-8 h-8" />,
            title: "Upload",
            description: "Upload the image to our advanced AI system",
            color: "bg-blue-500"
        },
        {
            icon: <Search className="w-8 h-8" />,
            title: "Analysis",
            description: "Our AI analyzes the image for disease patterns",
            color: "bg-purple-500"
        },
        {
            icon: <Microscope className="w-8 h-8" />,
            title: "Diagnosis",
            description: "Get detailed diagnosis of plant health issues",
            color: "bg-orange-500"
        },
        {
            icon: <Leaf className="w-8 h-8" />,
            title: "Treatment",
            description: "Receive customized treatment recommendations",
            color: "bg-teal-500"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
                        AI-Powered Crop Doctor
                    </h1>
                    <p className="text-green-600 text-lg max-w-2xl mx-auto">
                        Your intelligent assistant for plant disease diagnosis and treatment recommendations
                    </p>
                </div>

                {/* Process Flow */}
                <div className="space-y-6 mb-12">
                    {steps.map((step, index) => (
                        <div 
                            key={index}
                            className="flex items-center group"
                        >
                            <div className={`relative flex-none ${index !== steps.length - 1 ? 'after:content-[""] after:absolute after:w-0.5 after:bg-green-200 after:h-24 after:left-1/2 after:top-full after:-translate-x-1/2' : ''}`}>
                                <div className={`${step.color} text-white p-4 rounded-full shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    {step.icon}
                                </div>
                            </div>
                            <div className="ml-6 bg-white rounded-xl p-6 shadow-md flex-grow transform transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                    <div className="mb-6">
                        <ThumbsUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Ready to Diagnose Your Crops?
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Start the diagnosis process now and get expert recommendations for your plant health issues.
                        </p>
                    </div>
                    <Link 
                        href="/beta/image-upload" 
                        className="inline-flex items-center bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors group"
                    >
                        Start Diagnosis
                        <ChevronRight className="ml-2 w-5 h-5 transform transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Features List */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-800 mb-2">Fast Results</h3>
                        <p className="text-gray-600 text-sm">Get instant AI-powered analysis of your crop's health condition</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-800 mb-2">Expert Advice</h3>
                        <p className="text-gray-600 text-sm">Receive detailed treatment recommendations from agricultural experts</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-semibold text-gray-800 mb-2">Multiple Crops</h3>
                        <p className="text-gray-600 text-sm">Support for various crop types and common plant diseases</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropDoctor;
