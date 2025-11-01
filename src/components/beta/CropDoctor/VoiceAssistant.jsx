import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { GoogleGenAI } from '@google/genai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
    Loader2, 
    ArrowLeft, 
    Leaf, 
    Mic, 
    MicOff, 
    Volume2, 
    VolumeX, 
    Radio,
    AlertCircle,
    Info,
    MessageSquare
} from 'lucide-react'

const VoiceAssistant = () => {
    const router = useRouter()
    const [initialAnalysis, setInitialAnalysis] = useState(null)
    const [language, setLanguage] = useState('English')
    
    // Voice states
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [error, setError] = useState(null)
    const [statusMessage, setStatusMessage] = useState('Tap microphone to start speaking')
    
    // Conversation history
    const [conversationHistory, setConversationHistory] = useState([])
    
    // Audio refs
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const audioPlayerRef = useRef(null)
    const streamRef = useRef(null)

    // Initialize with analysis data
    useEffect(() => {
        const analysisData = sessionStorage.getItem('cropAnalysis')
        const selectedLang = sessionStorage.getItem('selectedLanguage')
        
        if (!analysisData) {
            router.push('/beta/image-upload')
            return
        }

        const analysis = JSON.parse(analysisData)
        setInitialAnalysis(analysis)
        setLanguage(selectedLang || 'English')

        // Prepare crop context for voice assistant
        const contextSummary = `Analyzing ${analysis.cropName}. Health status: ${analysis.healthStatus}. Confidence: ${analysis.confidence}.`
        setStatusMessage(`Ready! Say: "What's wrong with my ${analysis.cropName}?"`)
        
    }, [router])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecording()
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause()
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    const startRecording = async () => {
        try {
            setError(null)
            setStatusMessage('Listening... Speak now')

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true
                } 
            })
            
            streamRef.current = stream

            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            })
            
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                await processAudioWithGemini(audioBlob)
            }

            mediaRecorder.start()
            setIsRecording(true)

        } catch (err) {
            console.error('Error accessing microphone:', err)
            setError('Could not access microphone. Please grant permission.')
            setStatusMessage('Microphone access denied')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            setStatusMessage('Processing your question...')
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            
            // Stop all tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
        }
    }

    const processAudioWithGemini = async (audioBlob) => {
        setIsProcessing(true)
        setError(null)

        try {
            // Step 1: Convert audio blob to base64
            const reader = new FileReader()
            reader.readAsDataURL(audioBlob)
            
            reader.onloadend = async () => {
                try {
                    const base64Audio = reader.result.split(',')[1] // Remove data URL prefix

                    // Initialize Gemini AI
                    const ai = new GoogleGenAI({ 
                        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
                    })

                    // Step 2: Build context-aware prompt
                    let contextPrompt = `You are a specialized Crop Doctor AI assistant for farmers. Your ONLY purpose is to help with farming, crops, plants, agriculture, and related topics.

IMPORTANT RULES:
1. ONLY answer questions related to: crops, farming, agriculture, plant diseases, pests, soil health, fertilizers, pesticides, irrigation, weather impacts on crops, crop cultivation, harvesting, seeds, fruits, vegetables, and general farming practices.
2. If the user asks about ANYTHING else (like general knowledge, entertainment, sports, politics, etc.), politely decline and remind them you can only help with crop and farming-related queries.
3. Always respond in ${language} language.
4. Be helpful, friendly, and provide accurate agricultural advice.
5. Keep responses concise for voice interaction - aim for 2-3 sentences max unless detailed explanation is needed.
6. Use simple language suitable for farmers with varying literacy levels.
`

                    if (initialAnalysis) {
                        contextPrompt += `\n\nPrevious Crop Analysis:
Crop: ${initialAnalysis.cropName}
Health Status: ${initialAnalysis.healthStatus}
Confidence: ${initialAnalysis.confidence}`
                        
                        if (initialAnalysis.issues) {
                            contextPrompt += `\nIssues: ${JSON.stringify(initialAnalysis.issues)}`
                        }
                        if (initialAnalysis.treatments) {
                            contextPrompt += `\nRecommended Treatments: ${JSON.stringify(initialAnalysis.treatments)}`
                        }
                    }

                    if (conversationHistory && conversationHistory.length > 0) {
                        contextPrompt += `\n\nConversation History:\n${conversationHistory.slice(-4).join('\n')}`
                    }

                    contextPrompt += `\n\nPlease listen to the farmer's audio question and provide a helpful response.`

                    // Step 3: Send audio to Gemini for understanding
                    setStatusMessage('Understanding your question...')
                    
                    const audioResult = await ai.models.generateContent({
                        model: 'gemini-2.0-flash-exp',
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    {
                                        inlineData: {
                                            mimeType: 'audio/webm',
                                            data: base64Audio
                                        }
                                    },
                                    {
                                        text: contextPrompt
                                    }
                                ]
                            }
                        ]
                    })

                    const textResponse = audioResult.text

                    // Update conversation history
                    setConversationHistory(prev => [
                        ...prev,
                        `Farmer asked about farming`,
                        `Assistant: ${textResponse.substring(0, 100)}...`
                    ])

                    // Step 4: Generate audio response using Gemini TTS
                    setStatusMessage('Generating voice response...')
                    
                    const ttsResult = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-preview-tts',
                        contents: `Say in a friendly, clear, and helpful voice in ${language}: ${textResponse}`,
                        config: {
                            responseModalities: ['AUDIO'],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: 'Kore' // Clear, firm voice suitable for instructions
                                    }
                                }
                            }
                        }
                    })

                    // Extract audio data from response
                    const audioResponse = ttsResult.candidates?.[0]?.content?.parts?.[0]?.inlineData

                    if (audioResponse && audioResponse.data) {
                        // Play the audio response
                        await playAudioResponse(audioResponse.data, audioResponse.mimeType || 'audio/wav')
                    } else {
                        throw new Error('No audio data in response')
                    }

                    setStatusMessage('Tap microphone to ask another question')
                    setIsProcessing(false)

                } catch (innerError) {
                    console.error('Error in audio processing:', innerError)
                    setError(innerError.message || 'Failed to process your question. Please try again.')
                    setStatusMessage('Error occurred. Please try again.')
                    setIsProcessing(false)
                }
            }

            reader.onerror = () => {
                setError('Failed to read audio file')
                setStatusMessage('Error occurred. Please try again.')
                setIsProcessing(false)
            }

        } catch (err) {
            console.error('Error processing audio:', err)
            setError(err.message || 'Failed to process your question. Please try again.')
            setStatusMessage('Error occurred. Please try again.')
            setIsProcessing(false)
        }
    }

    const playAudioResponse = async (audioData, mimeType) => {
        try {
            setIsPlaying(true)
            setStatusMessage('Playing response...')

            // Gemini returns raw PCM audio data in base64
            // We need to convert it to a playable format
            
            // Decode base64 to binary
            const binaryString = atob(audioData)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            // Create a WAV file header (PCM, 24kHz, 16-bit, mono)
            const sampleRate = 24000
            const numChannels = 1
            const bitsPerSample = 16
            const byteRate = sampleRate * numChannels * bitsPerSample / 8
            const blockAlign = numChannels * bitsPerSample / 8
            const dataSize = bytes.length

            // WAV header
            const wavHeader = new Uint8Array(44)
            const view = new DataView(wavHeader.buffer)

            // "RIFF" chunk descriptor
            view.setUint32(0, 0x52494646, false) // "RIFF"
            view.setUint32(4, 36 + dataSize, true) // file size - 8
            view.setUint32(8, 0x57415645, false) // "WAVE"

            // "fmt " sub-chunk
            view.setUint32(12, 0x666d7420, false) // "fmt "
            view.setUint32(16, 16, true) // subchunk size
            view.setUint16(20, 1, true) // audio format (1 = PCM)
            view.setUint16(22, numChannels, true) // number of channels
            view.setUint32(24, sampleRate, true) // sample rate
            view.setUint32(28, byteRate, true) // byte rate
            view.setUint16(32, blockAlign, true) // block align
            view.setUint16(34, bitsPerSample, true) // bits per sample

            // "data" sub-chunk
            view.setUint32(36, 0x64617461, false) // "data"
            view.setUint32(40, dataSize, true) // data size

            // Combine header and audio data
            const wavFile = new Uint8Array(44 + dataSize)
            wavFile.set(wavHeader, 0)
            wavFile.set(bytes, 44)

            // Create blob and URL
            const audioBlob = new Blob([wavFile], { type: 'audio/wav' })
            const audioUrl = URL.createObjectURL(audioBlob)

            // Play audio
            const audio = new Audio(audioUrl)
            audioPlayerRef.current = audio

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl)
                setIsPlaying(false)
                setStatusMessage('Tap microphone to ask another question')
            }

            audio.onerror = (e) => {
                console.error('Audio playback error:', e)
                URL.revokeObjectURL(audioUrl)
                setIsPlaying(false)
                setError('Error playing audio response')
                setStatusMessage('Could not play audio')
            }

            await audio.play()

        } catch (err) {
            console.error('Error playing audio:', err)
            setIsPlaying(false)
            setError('Could not play audio response')
        }
    }

    const handleMicButtonClick = () => {
        if (isRecording) {
            stopRecording()
        } else if (!isProcessing && !isPlaying) {
            startRecording()
        }
    }

    if (!initialAnalysis) {
        return (
            <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-green-50 to-green-100">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-green-700 hover:text-green-800 hover:bg-green-100"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={() => router.push('/beta/crop-chatbot')}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            Switch to Text Chat
                        </Button>
                    </div>
                    
                    <Card className="bg-white border-green-200 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Radio className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-green-800">
                                            Voice Assistant Mode
                                        </CardTitle>
                                        <CardDescription className="text-green-600 mt-1">
                                            Talk to AI about {initialAnalysis.cropName}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="text-sm">
                                    {language}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Info Alert */}
                <Alert className="mb-6 border-blue-300 bg-blue-50">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>How to use:</strong> Tap the microphone button, ask your farming question in {language}, then tap again to stop. The AI will respond with voice guidance.
                    </AlertDescription>
                </Alert>

                {/* Voice Interaction Card */}
                <Card className="shadow-2xl border-green-200 mb-6">
                    <CardContent className="p-8">
                        {/* Status Display */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                {isRecording && (
                                    <div className="flex gap-1">
                                        <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1 h-8 bg-red-500 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                )}
                                {isProcessing && <Loader2 className="h-6 w-6 animate-spin text-green-600" />}
                                {isPlaying && <Volume2 className="h-6 w-6 text-green-600 animate-pulse" />}
                            </div>
                            
                            <p className="text-lg font-medium text-gray-800 mb-1">
                                {statusMessage}
                            </p>
                            
                            {conversationHistory.length > 0 && (
                                <p className="text-sm text-gray-500">
                                    {conversationHistory.length / 2} questions asked
                                </p>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <Alert className="mb-6 border-red-300 bg-red-50">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Microphone Button */}
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={handleMicButtonClick}
                                disabled={isProcessing || isPlaying}
                                className={`
                                    relative w-32 h-32 rounded-full transition-all duration-300 transform
                                    ${isRecording 
                                        ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-2xl' 
                                        : 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-xl'
                                    }
                                    ${(isProcessing || isPlaying) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    active:scale-95
                                `}
                            >
                                {isRecording ? (
                                    <MicOff className="h-16 w-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                ) : (
                                    <Mic className="h-16 w-16 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                                
                                {/* Pulse animation ring */}
                                {isRecording && (
                                    <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                                )}
                            </button>
                        </div>

                        {/* Instructions */}
                        <div className="text-center text-sm text-gray-600">
                            <p className="mb-2">
                                {isRecording 
                                    ? '🔴 Recording... Tap again to stop' 
                                    : isProcessing
                                    ? '⏳ Processing your question...'
                                    : isPlaying
                                    ? '🔊 Listen to the response...'
                                    : '🎤 Tap to start recording'
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Crop Info Card */}
                <Card className="border-green-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                            <Leaf className="h-5 w-5" />
                            Current Crop Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 font-medium">Crop Type</p>
                                <p className="text-gray-800">{initialAnalysis.cropName}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Health Status</p>
                                <p className="text-gray-800">{initialAnalysis.healthStatus}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Confidence</p>
                                <p className="text-gray-800">{initialAnalysis.confidence}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Mode</p>
                                <p className="text-gray-800">Voice Only</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Example Questions */}
                <Card className="mt-6 border-green-200 bg-green-50">
                    <CardHeader>
                        <CardTitle className="text-md text-green-800">Example Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li>• "What treatment should I apply for this disease?"</li>
                            <li>• "How can I prevent this problem in future?"</li>
                            <li>• "When should I harvest this crop?"</li>
                            <li>• "What fertilizer is best for this crop?"</li>
                            <li>• "How much water does this crop need?"</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default VoiceAssistant
