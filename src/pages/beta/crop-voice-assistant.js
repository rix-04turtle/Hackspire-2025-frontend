import VoiceAssistant from '@/components/beta/CropDoctor/VoiceAssistant'
import Head from 'next/head'
import Link from 'next/link'
import { Leaf, Radio } from 'lucide-react'

const CropVoiceAssistant = () => {
    return (
        <>
            <Head>
                <title>Voice Assistant | Crop Doctor AI</title>
                <meta name="description" content="Talk to AI assistant about your crop health - Voice-only mode for farmers" />
            </Head>

            {/* Navigation Bar */}
            <nav className="bg-green-800 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Leaf className="h-6 w-6" />
                        <div>
                            <div className="text-xl font-bold">Agnivani</div>
                            <div className="text-xs text-green-200">Growing a Sustainable Future</div>
                        </div>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2 bg-green-700 px-3 py-2 rounded-lg">
                            <Radio className="h-4 w-4 text-green-300 animate-pulse" />
                            <span className="text-sm font-medium">Voice Mode</span>
                        </div>
                        <Link href="/beta/image-upload" className="hover:text-green-200 transition-colors">Crop Doctor</Link>
                        <Link href="/login" className="hover:text-green-200 transition-colors">Login</Link>
                    </div>
                </div>
            </nav>

            <VoiceAssistant />
        </>
    )
}

export default CropVoiceAssistant
