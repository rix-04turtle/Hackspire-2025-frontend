import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Leaf, MapPin, Check } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
    "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
    "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function LocationPage() {
    const router = useRouter();
    const [location, setLocation] = useState({
        detecting: true,
        state: '',
        error: null,
        confirmed: false
    });
    const [showManualSelect, setShowManualSelect] = useState(false);

    useEffect(() => {
        detectLocation();
    }, []);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            setLocation({ ...location, detecting: true, error: null });
            navigator.geolocation.getCurrentPosition(
                async (position) => {
const YOUR_API_KEY = process.env.NEXT_PUBLIC_YOUR_API_KEY

                    try {
                        const response = await fetch(
                            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=${YOUR_API_KEY}&language=en`
                        );
                        const data = await response.json();
                        
                        if (data.results && data.results[0] && data.results[0].components) {
                            const locationData = data.results[0].components;
                            // Try to find the state from various possible fields
                            const state = locationData.state || 
                                        locationData.region || 
                                        locationData.province ||
                                        locationData.territory;

                            if (state) {
                                // Check if the detected state matches any Indian state
                                const matchedState = indianStates.find(
                                    s => s.toLowerCase() === state.toLowerCase() ||
                                        state.toLowerCase().includes(s.toLowerCase())
                                );

                                if (matchedState) {
                                    setLocation({
                                        detecting: false,
                                        state: matchedState,
                                        error: null,
                                        confirmed: false
                                    });
                                    return;
                                }
                            }
                        }
                        // If we reach here, we couldn't find a valid Indian state
                        setLocation({
                            detecting: false,
                            state: '',
                            error: 'Could not detect your state in India. Please select manually.',
                            confirmed: false
                        });
                        setShowManualSelect(true);
                    } catch (error) {
                        console.error('Error getting location details:', error);
                        setLocation({
                            detecting: false,
                            state: '',
                            error: 'Could not determine your state. Please select manually.',
                            confirmed: false
                        });
                        setShowManualSelect(true);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocation({
                        detecting: false,
                        state: '',
                        error: 'Location access denied. Please select manually.',
                        confirmed: false
                    });
                    setShowManualSelect(true);
                }
            );
        } else {
            setLocation({
                detecting: false,
                state: '',
                error: 'Geolocation is not supported by your browser. Please select manually.',
                confirmed: false
            });
            setShowManualSelect(true);
        }
    };

    const handleStateSelect = (event) => {
        const selectedState = event.target.value;
        setLocation({
            ...location,
            state: selectedState,
            error: null,
            confirmed: false
        });
    };

    const confirmLocation = () => {
        if (location.state) {
            localStorage.setItem('userState', location.state);
            // After confirming location, go to crop list page
            router.push('/crop-list');
        }
    };

    const handleManualSelect = () => {
        setShowManualSelect(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            {/* Header */}
            <div className="bg-green-800 p-4 text-white">
                <div className="container mx-auto flex items-center justify-center">
                    <Leaf className="h-6 w-6 mr-2" />
                    <h1 className="text-2xl font-bold">FarmAdvisor</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <Card className="p-6">
                        <div className="space-y-6">
                            <div className="text-center">
                                <MapPin className="h-12 w-12 mx-auto text-green-600 mb-4" />
                                <h2 className="text-2xl font-semibold text-green-800 mb-2">
                                    Location Setup
                                </h2>
                                <p className="text-gray-600">
                                    Help us provide location-specific farming advice
                                </p>
                            </div>
                            
                            {location.detecting ? (
                                <div className="text-center space-y-4">
                                    <div className="animate-pulse text-green-600">
                                        Detecting your location...
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Please allow location access when prompted
                                    </p>
                                </div>
                            ) : location.error ? (
                                <div className="text-center text-red-500 mb-4">
                                    {location.error}
                                </div>
                            ) : location.state && !showManualSelect ? (
                                <div className="text-center space-y-4">
                                    <p className="text-lg">
                                        We detected your state as:
                                        <br />
                                        <span className="font-semibold text-xl text-green-700">
                                            {location.state}
                                        </span>
                                    </p>
                                    <div className="space-y-3">
                                        <Button 
                                            className="w-full"
                                            onClick={confirmLocation}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Confirm Location
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={handleManualSelect}
                                        >
                                            Select Manually
                                        </Button>
                                    </div>
                                </div>
                            ) : null}

                            {showManualSelect && (
                                <div className="space-y-4">
                                    <Field>
                                        <FieldLabel htmlFor="state">Select your state</FieldLabel>
                                        <select
                                            id="state"
                                            value={location.state}
                                            onChange={handleStateSelect}
                                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Select a state...</option>
                                            {indianStates.sort().map((state) => (
                                                <option key={state} value={state}>
                                                    {state}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>
                                    {location.state && (
                                        <Button 
                                            className="w-full"
                                            onClick={confirmLocation}
                                        >
                                            Confirm Selection
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}