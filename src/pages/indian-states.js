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
import UpdateStateDialog from '../components/Admin/UpdateStateDialog';
import UpdateCropsDialog from '../components/Admin/UpdateCropsDialog';

import { RefreshCw } from "lucide-react";
import BodyIndianStates from '@/components/Admin/BodyIndianStates';

const IndianStates = () => {


    return (
        <>
            <Head>
                <title>Indian States and Crops</title>
                <meta name="description" content="A list of Indian states and their major crops." />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <BodyIndianStates />

        </>
    );
};

export default IndianStates;