import OldBodyCropDoctor from '@/components/Rohan/OldCropDoctor'
import Head from 'next/head'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

const ImageUpload = () => {
    return (
        <>
            <Head>
                <title>Crop Doctor | Gemini</title>
            </Head>

            {/* Navigation Bar */}
            <nav className="bg-green-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                        <Leaf className="h-6 w-6" />
                        FarmAdvisor
                    </Link>
                    <div className="space-x-4">
                        <Link href="/indian-states" className="hover:text-green-200 transition-colors">Indian States</Link>
                        <Link href="/crops" className="hover:text-green-200 transition-colors">Crops</Link>
                        <Link href="/login" className="hover:text-green-200 transition-colors">Login</Link>
                        <Link href="/signup" className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            <OldBodyCropDoctor />
        </>
    )
}

export default ImageUpload