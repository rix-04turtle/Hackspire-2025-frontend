/**
 * LiveCropDoctor Component
 * 
 * Real-time crop disease detection using Gemini Live API
 * 
 * Features:
 * - Live video streaming from camera/webcam
 * - Real-time AI analysis of crops via Gemini 2.5 Flash Native Audio
 * - Bidirectional audio/video communication with AI
 * - Voice conversation with AI assistant
 * - Instant disease detection and treatment recommendations
 * - Quick question prompts for common queries
 * 
 * How it works:
 * 1. Connects to Gemini Live API via WebSocket
 * 2. Streams video frames (1 FPS) and audio to Gemini
 * 3. Gemini analyzes the live feed in real-time
 * 4. Returns text and audio responses
 * 5. User can ask questions via text or voice
 * 
 * Technology:
 * - Gemini 2.5 Flash Native Audio Preview model
 * - WebSocket for real-time bidirectional communication
 * - Web Audio API for audio processing
 * - Canvas API for video frame capture
 * - MediaDevices API for camera/microphone access
 */

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useGeminiLive } from './hooks/useGeminiLive'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
    Loader2, 
    Video,
    VideoOff,
    Mic,
    MicOff,
    AlertCircle,
    CheckCircle2,
    Info,
    Camera,
    MessageSquare,
    Activity,
    Leaf,
    ArrowLeft,
    SwitchCamera,
    RefreshCw
} from 'lucide-react'

const LiveCropDoctor = () => {
    const router = useRouter()
    
    const {
        isConnected,
        isStreaming,
        isListening,
        error,
        transcript,
        analysisResult,
        availableDevices,
        selectedVideoDevice,
        videoRef,
        connect,
        disconnect,
        startStreaming,
        stopStreaming,
        sendMessage,
        switchCamera,
        getDevices
    } = useGeminiLive()

    const [userMessage, setUserMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [showCameraMenu, setShowCameraMenu] = useState(false)

    useEffect(() => {
        // Auto-connect on mount
        if (!isConnected && !isInitialized) {
            handleConnect()
            setIsInitialized(true)
        }

        return () => {
            if (isConnected) {
                disconnect()
            }
        }
    }, [])

    // No need for videoDisplayRef - use videoRef directly from hook

    // Track transcript changes
    useEffect(() => {
        if (transcript) {
            setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                
                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = transcript
                    return newMessages
                } else {
                    return [...prev, { role: 'assistant', content: transcript }]
                }
            })
        }
    }, [transcript])

    const handleConnect = async () => {
        const systemInstruction = `You are an expert agricultural AI assistant specializing in real-time crop health analysis. 
        
        You are viewing a live video feed of crops or plants. Your tasks:
        
        1. IDENTIFY: Determine the crop/plant type and variety if visible
        2. ANALYZE: Assess the health status in real-time
        3. DETECT: Look for:
           - Diseases (fungal, bacterial, viral)
           - Pest infestations
           - Nutrient deficiencies (yellowing, spots, discoloration)
           - Environmental stress (wilting, burning, frost damage)
           - Physical damage
        4. DIAGNOSE: Provide specific disease/pest names
        5. RECOMMEND: Give actionable treatment steps
        
        Format your responses clearly:
        - Start with what you see
        - Identify any issues
        - Provide severity level (mild/moderate/severe)
        - Give specific treatment recommendations
        - Suggest preventive measures
        
        Be conversational, friendly, and use simple language suitable for farmers.
        Respond to questions naturally while continuously monitoring the video feed.`
        
        await connect(systemInstruction)
    }

    const handleStartStreaming = async () => {
        if (!isConnected) {
            await handleConnect()
        }
        await startStreaming()
    }

    const handleStopStreaming = () => {
        stopStreaming()
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (userMessage.trim() && isConnected) {
            setMessages(prev => [...prev, { role: 'user', content: userMessage }])
            sendMessage(userMessage)
            setUserMessage('')
        }
    }

    const handleQuickQuestion = (question) => {
        if (isConnected) {
            setMessages(prev => [...prev, { role: 'user', content: question }])
            sendMessage(question)
        }
    }

    const getHealthStatusBadge = () => {
        if (!analysisResult) return null
        
        const status = analysisResult.healthStatus?.toLowerCase()
        if (status?.includes('healthy')) {
            return <Badge className="bg-green-500">Healthy</Badge>
        } else if (status?.includes('moderate')) {
            return <Badge className="bg-yellow-500">Moderate Issues</Badge>
        } else if (status?.includes('severe')) {
            return <Badge className="bg-red-500">Severe Issues</Badge>
        }
        return <Badge className="bg-blue-500">Analyzing...</Badge>
    }

    const quickQuestions = [
        "What crop am I showing you?",
        "Is there any disease on this plant?",
        "What are these spots on the leaves?",
        "How can I treat this?",
        "What nutrients might be missing?",
        "Is this pest damage?"
    ]

    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <Activity className="h-6 w-6 text-green-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        Live Crop Doctor
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        Real-time AI-powered crop analysis
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isConnected && (
                                <div className="flex items-center gap-2 text-green-600">
                                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium">Connected</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Video Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Video Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-linear-to-r from-green-600 to-emerald-600 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        <CardTitle>Live Camera Feed</CardTitle>
                                    </div>
                                    {getHealthStatusBadge()}
                                </div>
                                <CardDescription className="text-green-100">
                                    Point your camera at the crop for real-time analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="relative bg-black aspect-video">
                                    {isStreaming ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-contain"
                                            onLoadedMetadata={(e) => {
                                                console.log('📹 Video metadata loaded:', {
                                                    width: e.target.videoWidth,
                                                    height: e.target.videoHeight,
                                                    duration: e.target.duration
                                                })
                                            }}
                                            onLoadedData={() => console.log('📹 Video data loaded')}
                                            onPlay={() => console.log('▶️ Video started playing')}
                                            onError={(e) => console.error('❌ Video error:', e)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                            <VideoOff className="h-16 w-16 mb-4 opacity-50" />
                                            <p className="text-lg font-medium">Camera not active</p>
                                            <p className="text-sm opacity-75">Start streaming to begin analysis</p>
                                        </div>
                                    )}
                                    
                                    {isStreaming && (
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <Badge className="bg-red-500 animate-pulse">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                    LIVE
                                                </div>
                                            </Badge>
                                            {isListening && (
                                                <Badge className="bg-blue-500">
                                                    <div className="flex items-center gap-1">
                                                        <Mic className="w-3 h-3 animate-pulse" />
                                                        Listening
                                                    </div>
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-3 items-center justify-center">
                                    {!isStreaming ? (
                                        <Button
                                            onClick={handleStartStreaming}
                                            disabled={!isConnected}
                                            className="bg-green-600 hover:bg-green-700"
                                            size="lg"
                                        >
                                            {!isConnected ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Video className="mr-2 h-5 w-5" />
                                                    Start Live Analysis
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleStopStreaming}
                                                variant="destructive"
                                                size="lg"
                                            >
                                                <VideoOff className="mr-2 h-5 w-5" />
                                                Stop Streaming
                                            </Button>
                                            
                                            {/* Camera Switch Button */}
                                            {availableDevices.video.length > 1 && (
                                                <div className="relative">
                                                    <Button
                                                        onClick={() => setShowCameraMenu(!showCameraMenu)}
                                                        variant="outline"
                                                        size="lg"
                                                    >
                                                        <SwitchCamera className="mr-2 h-5 w-5" />
                                                        Switch Camera
                                                    </Button>
                                                    
                                                    {showCameraMenu && (
                                                        <Card className="absolute top-full mt-2 right-0 z-50 w-64">
                                                            <CardContent className="p-2">
                                                                {availableDevices.video.map((device, index) => (
                                                                    <Button
                                                                        key={device.deviceId}
                                                                        onClick={() => {
                                                                            switchCamera(device.deviceId)
                                                                            setShowCameraMenu(false)
                                                                        }}
                                                                        variant={device.deviceId === selectedVideoDevice ? 'default' : 'ghost'}
                                                                        className="w-full justify-start mb-1"
                                                                        size="sm"
                                                                    >
                                                                        <Camera className="mr-2 h-4 w-4" />
                                                                        {device.label || `Camera ${index + 1}`}
                                                                    </Button>
                                                                ))}
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="space-y-1">
                                                <p className="font-semibold">{error}</p>
                                                {error.includes('API key') && (
                                                    <p className="text-sm mt-2">
                                                        Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.
                                                        <br />
                                                        Get your API key from: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>
                                                    </p>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Analysis Results */}
                        {analysisResult && (
                            <Card className="border-green-200 bg-green-50">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-green-600" />
                                        <CardTitle>Analysis Results</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {analysisResult.cropName && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Crop Type</p>
                                            <p className="text-lg font-semibold text-gray-900">{analysisResult.cropName}</p>
                                        </div>
                                    )}
                                    {analysisResult.disease && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Detected Issue</p>
                                            <p className="text-lg font-semibold text-red-600">{analysisResult.disease}</p>
                                        </div>
                                    )}
                                    {analysisResult.severity && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Severity</p>
                                            <p className="text-lg font-semibold">{analysisResult.severity}</p>
                                        </div>
                                    )}
                                    {analysisResult.recommendations && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Recommendations</p>
                                            <p className="text-gray-800">{analysisResult.recommendations}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Chat & Quick Questions */}
                    <div className="space-y-4">
                        {/* Quick Questions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Quick Questions
                                </CardTitle>
                                <CardDescription>
                                    Tap to ask common questions
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {quickQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 hover:bg-green-50"
                                        onClick={() => handleQuickQuestion(question)}
                                        disabled={!isConnected}
                                    >
                                        <Info className="h-4 w-4 mr-2 shrink-0" />
                                        <span className="text-sm">{question}</span>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Chat History */}
                        <Card className="flex flex-col" style={{ height: '500px' }}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Conversation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto space-y-3 p-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No messages yet</p>
                                        <p className="text-sm">Start streaming and ask questions!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                                                    msg.role === 'user'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                            
                            {/* Message Input */}
                            <div className="border-t p-4">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={userMessage}
                                        onChange={(e) => setUserMessage(e.target.value)}
                                        placeholder="Ask about the crop..."
                                        disabled={!isConnected}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={!isConnected || !userMessage.trim()}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Send
                                    </Button>
                                </form>
                            </div>
                        </Card>

                        {/* Info Card */}
                        <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div className="text-sm text-gray-700 space-y-2">
                                        <p className="font-medium text-blue-900">How it works:</p>
                                        <ul className="list-disc list-inside space-y-1 text-xs">
                                            <li>Start the live camera feed</li>
                                            <li>Point camera at your crop/plant</li>
                                            <li>🎤 Speak naturally - AI listens to you</li>
                                            <li>🔊 AI responds with voice + text</li>
                                            <li>AI auto-analyzes every 3 seconds</li>
                                            <li>Ask questions or use quick prompts</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LiveCropDoctor
