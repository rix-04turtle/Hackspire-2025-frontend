import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

const cropImages = {
    'Rice': '/crops/rice.jpg',
    'Wheat': '/crops/wheat.jpg',
    'Maize': '/crops/maize.jpg',
    'Total Pulses': '/crops/pulses.jpg',
    'Sugarcane': '/crops/sugarcane.jpg',
    'Cotton': '/crops/cotton.jpg',
    'Groundnut': '/crops/groundnut.jpg',
    'Rapeseed & Mustard': '/crops/mustard.jpg',
    'Soybean': '/crops/soybean.jpg',
    'Total Oil Seeds': '/crops/oilseeds.jpg',
    'Jute': '/crops/jute.jpg',
    'Bajra': '/crops/bajra.jpg',
    'Jowar': '/crops/jowar.jpg',
    'Ragi': '/crops/ragi.jpg',
    // Add more crop images as needed
    'default': '/crops/default-crop.jpg'
};

export default function CropListPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [crops, setCrops] = useState([]);
    const [stateName, setStateName] = useState('');
    const [selectedCrops, setSelectedCrops] = useState(new Set());

    useEffect(() => {
        async function loadData() {
            try {
                const state = localStorage.getItem('userState');
                if (!state) {
                    router.push('/location');
                    return;
                }
                setStateName(state);

                const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
                const stateBody = {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stateName: state.trim() })
                };

                setLoading(true);
                const [viewAllRes, stateRes] = await Promise.all([
                    fetch(`${BASE_URL}/crops/get-all`),
                    fetch(`${BASE_URL}/indian-states/get-crops`, stateBody)
                ]);

                const [viewAllData, stateData] = await Promise.all([
                    viewAllRes.json(),
                    stateRes.json()
                ]);

                // Basic response checks
                if (!viewAllRes.ok || viewAllData.status !== "success") {
                    throw new Error('Failed to fetch all crops');
                }
                if (!stateRes.ok) {
                    throw new Error('Failed to fetch state crops');
                }

                // Get crops from nested data array
                const allCrops = viewAllData.data || [];
                const stateCropIds = stateData.crops || [];

                if (!allCrops.length || !stateCropIds.length) {
                    setCrops([]);
                    setLoading(false);
                    return;
                }

                // Create lookup by _id
                const cropsById = {};
                allCrops.forEach(crop => {
                    if (crop._id) {
                        cropsById[crop._id] = crop;
                    }
                });

                // Map state crop IDs to crop objects
                const mapped = stateCropIds
                    .map(cropId => {
                        const matched = cropsById[cropId];
                        if (!matched) return null;

                        return {
                            id: matched._id,
                            crop: matched.name,
                            image: matched.image || cropImages[matched.name] || cropImages.default,
                            production: 0 // Since production data isn't provided in the example
                        };
                    })
                    .filter(Boolean); // Remove null entries

                setCrops(mapped);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Failed to load crops');
                setLoading(false);
            }
        }

        loadData();
    }, [router]);

    const toggleCropSelection = (cropName) => {
        const newSelection = new Set(selectedCrops);
        if (newSelection.has(cropName)) {
            newSelection.delete(cropName);
        } else {
            newSelection.add(cropName);
        }
        setSelectedCrops(newSelection);
    };

    const handleProceed = () => {
        if (selectedCrops.size > 0) {
            localStorage.setItem('selectedCrops', JSON.stringify(Array.from(selectedCrops)));
            router.push('/home'); // or wherever you want to go next
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading crop data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                    <button
                        onClick={() => router.push('/location')}
                        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
                    >
                        Return to Location Selection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Popular Crops in {stateName}
                    </h1>
                    <p className="text-gray-600">
                        Select the crops you're interested in growing
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Sorted by production volume
                    </p>
                </div>

                {/* Crop List in Rows */}
                <div className="space-y-4 mb-20">
                    {crops.map((item, index) => (
                        <Card
                            key={item.id || (item.crop + index)}
                            className={`
                overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedCrops.has(item.crop) ? 'ring-2 ring-green-500' : ''}
              `}
                            onClick={() => toggleCropSelection(item.crop)}
                        >
                            <div className="flex items-center p-4">
                                {/* Left: Image */}
                                <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.image || cropImages.default}
                                        alt={item.crop}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Middle: Crop Name and Production */}
                                <div className="ml-4 flex-grow">
                                    <h3 className="font-semibold text-gray-900 text-lg">{item.crop}</h3>
                                    <p className="text-sm text-gray-600">
                                        Production: {item.production.toFixed(2)} Lakh Tonnes
                                    </p>
                                </div>

                                {/* Right: Selection Indicator */}
                                <div className="ml-4 flex-shrink-0">
                                    {selectedCrops.has(item.crop) ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {selectedCrops.size} crops selected
                        </div>
                        <div className="space-x-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/location')}
                            >
                                Change Location
                            </Button>
                            <Button
                                onClick={handleProceed}
                                disabled={selectedCrops.size === 0}
                            >
                                Continue with Selected Crops
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}