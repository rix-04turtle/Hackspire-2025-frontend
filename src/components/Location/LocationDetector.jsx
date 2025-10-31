import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldLabel,
} from "@/components/ui/field";

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

export default function LocationDetector({ onStateChange } = {}) {
    const [location, setLocation] = useState({
        detecting: true,
        state: '',
        error: null
    });
    const [showStateSelect, setShowStateSelect] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Use reverse geocoding to get state information
                        const response = await fetch(
                            `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=b9c1717d836e441393453261f7eb8020&language=en`
                        );
                        const data = await response.json();
                        
                        if (data.results && data.results[0]) {
                            const state = data.results[0].components.state;
                            setLocation({
                                detecting: false,
                                state: state || '',
                                error: null
                            });
                        } else {
                            throw new Error('Location not found');
                        }
                    } catch (error) {
                        console.error('Error getting location details:', error);
                        setLocation({
                            detecting: false,
                            state: '',
                            error: 'Could not determine your state. Please select manually.'
                        });
                        setShowStateSelect(true);
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setLocation({
                        detecting: false,
                        state: '',
                        error: 'Location access denied. Please select your state manually.'
                    });
                    setShowStateSelect(true);
                }
            );
        } else {
            setLocation({
                detecting: false,
                state: '',
                error: 'Geolocation is not supported by your browser. Please select your state manually.'
            });
            setShowStateSelect(true);
        }
    }, []);

    const handleStateChange = (event) => {
        setLocation({
            ...location,
            state: event.target.value,
            error: null
        });
        if (typeof onStateChange === 'function') onStateChange(event.target.value);
    };

    const handleManualSelect = () => {
        setShowStateSelect(true);
    };

    // notify parent when location.state changes (e.g., from reverse geocode)
    useEffect(() => {
        if (location.state && typeof onStateChange === 'function') {
            onStateChange(location.state);
        }
    }, [location.state]);

    return (
        <Card className="p-6">
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-center">Your Location</h2>
                
                {location.detecting ? (
                    <div className="text-center text-gray-600">
                        Detecting your location...
                    </div>
                ) : location.error ? (
                    <div className="text-center text-red-500">
                        {location.error}
                    </div>
                ) : location.state && !showStateSelect ? (
                    <div className="text-center">
                        <p className="mb-4">You are in <span className="font-semibold">{location.state}</span></p>
                        <Button 
                            variant="outline" 
                            onClick={handleManualSelect}
                        >
                            Change State
                        </Button>
                    </div>
                ) : null}

                {showStateSelect && (
                    <Field>
                        <FieldLabel htmlFor="state">Select your state</FieldLabel>
                        <select
                            id="state"
                            value={location.state}
                            onChange={handleStateChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a state...</option>
                            {indianStates.sort().map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </Field>
                )}
            </div>
        </Card>
    );
}