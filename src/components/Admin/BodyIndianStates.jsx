"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import UpdateStateDialog from './UpdateStateDialog';
import UpdateCropsDialog from './UpdateCropsDialog';

import { RefreshCw } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const BodyIndianStates = () => {

    const [states, setStates] = useState([]);
    const [crops, setCrops] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {

        setLoading(true);
        try {
            const [statesResponse, cropsResponse] = await Promise.all([
                fetch(`${BASE_URL}/indian-states/get-all`),
                fetch(`${BASE_URL}/crops/get-all`)
            ]);

            if (!statesResponse.ok || !cropsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const statesData = await statesResponse.json();
            const cropsData = await cropsResponse.json();

            const cropsMap = new Map(cropsData.data.map(crop => [crop._id, crop.name]));

            setStates(statesData.data);
            setCrops(cropsMap);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStateName = (stateId, newName) => {
        setStates(states.map(state => state._id === stateId ? { ...state, name: newName } : state));
    };

    const handleUpdateStateCrops = (stateId, newCrops) => {
        setStates(states.map(state => state._id === stateId ? { ...state, crops: newCrops } : state));
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head>
                <title>Indian States and Crops</title>
                <meta name="description" content="A list of Indian states and their major crops." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-center">
                        Indian States and Crops
                    </h1>
                    <Button onClick={fetchData} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>

                {loading && <p className="text-center">Loading...</p>}
                {error && <p className="text-center text-red-500">Error: {error}</p>}

                <Table>
                    <TableCaption>A list of Indian states and their major crops.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>State</TableHead>
                            <TableHead>Crops</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {states.map((state) => (
                            <TableRow key={state._id}>
                                <TableCell className="font-medium">{state.name}</TableCell>
                                <TableCell>{Array.isArray(state.crops) ? state.crops.map(cropId => crops.get(cropId) || 'Unknown Crop').join(', ') : 'No crops listed'}</TableCell>
                                <TableCell>
                                    <UpdateStateDialog state={state} onUpdate={handleUpdateStateName}>
                                        <Button variant="outline">Edit State</Button>
                                    </UpdateStateDialog>
                                    <UpdateCropsDialog state={state} crops={crops} onUpdate={handleUpdateStateCrops}>
                                        <Button variant="outline" className="ml-2">Update Crops</Button>
                                    </UpdateCropsDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main>
        </div>
    )
}

export default BodyIndianStates