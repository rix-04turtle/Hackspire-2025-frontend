import LiveCropDoctor from '@/components/beta/CropDoctor/LiveCropDoctor'
import Head from 'next/head'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

const LiveCropDoctorPage = () => {
    return (
        <>
            <Head>
                <title>Live Crop Doctor | Agnivani</title>
                <meta name="description" content="Real-time AI-powered crop disease detection with Gemini Live API" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <LiveCropDoctor />
        </>
    )
}

export default LiveCropDoctorPage
