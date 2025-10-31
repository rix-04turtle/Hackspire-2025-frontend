"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const BodyCropsPage = () => {

  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCrops = async () => {
    setLoading(true);


    const API = `${BASE_URL}/crops/get-all`
    try {
      const response = await fetch(API);
      if (!response.ok) {
        throw new Error('Failed to fetch crops');
      }
      const data = await response.json();
      setCrops(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">
            All Crops
          </h1>
          <Button onClick={fetchCrops} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}

        <Table>
          <TableCaption>A list of all available crops.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Crop</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crops.map((crop) => (
              <TableRow key={crop._id}>
                <TableCell className="font-medium">{crop.name}</TableCell>
                <TableCell>{crop.description || ''}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </main>
    </div>
  )
}

export default BodyCropsPage