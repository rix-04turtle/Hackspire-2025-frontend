import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { GoogleGenAI } from '@google/genai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Loader2, Send, ArrowLeft, Leaf, Bot, User, Volume2, StopCircle, AlertTriangle, Sparkles, Mic } from 'lucide-react'
import MarkdownMessage from './MarkdownMessage'

const ChatbotCropDoctor = () => {
    const router = useRouter()
    const [initialAnalysis, setInitialAnalysis] = useState(null)
    const [language, setLanguage] = useState('English')
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [currentAudio, setCurrentAudio] = useState(null)
    const messagesEndRef = useRef(null)
    const chatHistoryRef = useRef([])

    // Initialize with analysis data from previous page
    useEffect(() => {
        const analysisData = sessionStorage.getItem('cropAnalysis')
        const selectedLang = sessionStorage.getItem('selectedLanguage')
        
        if (!analysisData) {
            // If no analysis data, redirect back
            router.push('/beta/image-upload')
            return
        }

        const analysis = JSON.parse(analysisData)
        setInitialAnalysis(analysis)
        setLanguage(selectedLang || 'English')

        // Create initial message with analysis summary
        const initialMessage = {
            role: 'assistant',
            content: `Hello! I'm your Crop Doctor AI assistant. I've analyzed your crop image and found:\n\n**Crop**: ${analysis.cropName}\n**Status**: ${analysis.healthStatus}\n**Confidence**: ${analysis.confidence}\n\nFeel free to ask me any questions about your crop, the identified issues, treatment recommendations, or general farming advice. I'm here to help!`,
            timestamp: new Date()
        }

        setMessages([initialMessage])

        // Initialize chat history for context
        const analysisContext = `Previous Analysis:
Crop: ${analysis.cropName}
Health Status: ${analysis.healthStatus}
Confidence: ${analysis.confidence}
${analysis.issues ? `Issues: ${JSON.stringify(analysis.issues)}` : ''}
${analysis.treatments ? `Treatments: ${JSON.stringify(analysis.treatments)}` : ''}
${analysis.preventiveMeasures ? `Preventive Measures: ${analysis.preventiveMeasures.join(', ')}` : ''}
${analysis.estimatedRecoveryTime ? `Recovery Time: ${analysis.estimatedRecoveryTime}` : ''}`

        chatHistoryRef.current = [
            { role: 'user', parts: [{ text: 'Here is my crop analysis data' }] },
            { role: 'model', parts: [{ text: analysisContext }] }
        ]
    }, [router])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const speakText = async (text) => {
        // Stop if already speaking
        if (isSpeaking && currentAudio) {
            currentAudio.pause()
            currentAudio.currentTime = 0
            setIsSpeaking(false)
            setCurrentAudio(null)
            return
        }

        setIsSpeaking(true)

        try {
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
            const API = `${BASE_URL}/apis/text-to-speech`

            const params = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            }

            const response = await fetch(API, params)

            if (!response.ok) {
                throw new Error('Failed to generate speech.')
            }

            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)
            setCurrentAudio(audio)

            audio.play()
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl)
                setIsSpeaking(false)
                setCurrentAudio(null)
            }
            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl)
                setIsSpeaking(false)
                setCurrentAudio(null)
            }
        } catch (error) {
            console.error('Error with TTS:', error)
            setIsSpeaking(false)
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || loading) return

        const userMessage = {
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputMessage('')
        setLoading(true)

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

            // Create a system prompt that restricts to crop-related queries
            const systemPrompt = `You are a specialized Crop Doctor AI assistant. Your ONLY purpose is to help with farming, crops, plants, agriculture, and related topics.

IMPORTANT RULES:
1. ONLY answer questions related to: crops, farming, agriculture, plant diseases, pests, soil health, fertilizers, pesticides, irrigation, weather impacts on crops, crop cultivation, harvesting, seeds, fruits, vegetables, and general farming practices.
2. If the user asks about ANYTHING else (like general knowledge, entertainment, sports, politics, etc.), politely decline and remind them you can only help with crop and farming-related queries.
3. Always respond in ${language} language.
4. Be helpful, friendly, and provide accurate agricultural advice.
5. Reference the previous crop analysis when relevant.

Previous crop analysis context is available in the conversation history.`

            // Build conversation history for context
            let conversationContext = systemPrompt + '\n\n'
            
            // Add previous crop analysis
            if (chatHistoryRef.current.length > 0) {
                conversationContext += chatHistoryRef.current.map(msg => {
                    if (msg.role === 'user') {
                        return `User: ${msg.parts[0].text}`
                    } else {
                        return `Assistant: ${msg.parts[0].text}`
                    }
                }).join('\n\n')
            }

            // Add current user message
            conversationContext += `\n\nUser: ${userMessage.content}\n\nAssistant:`

            // Use generateContent API
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: conversationContext }]
                    }
                ]
            })

            const responseText = response.text

            // Check if response indicates non-crop question
            const aiMessage = {
                role: 'assistant',
                content: responseText,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMessage])

            // Update chat history for context
            chatHistoryRef.current.push(
                { role: 'user', parts: [{ text: userMessage.content }] },
                { role: 'model', parts: [{ text: responseText }] }
            )

            // Keep chat history manageable (last 10 exchanges)
            if (chatHistoryRef.current.length > 22) {
                chatHistoryRef.current = chatHistoryRef.current.slice(-20)
            }

            setLoading(false)
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date(),
                isError: true
            }
            setMessages(prev => [...prev, errorMessage])
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
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
            <div className="container mx-auto p-4 md:p-8 max-w-5xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-green-700 hover:text-green-800 hover:bg-green-100"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Analysis
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={() => router.push('/beta/crop-voice-assistant')}
                            className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                            <Mic className="h-5 w-5 mr-2" />
                            Switch to Voice Mode
                        </Button>
                    </div>
                    
                    <Card className="bg-white border-green-200 shadow-lg">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Leaf className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl text-green-800">
                                            Chat with Crop Doctor AI
                                        </CardTitle>
                                        <CardDescription className="text-green-600 mt-1">
                                            Ask me anything about {initialAnalysis.cropName} or farming
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
                <Alert className="mb-6 border-green-300 bg-green-50">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 font-medium">
                        I can only answer questions related to crops, farming, and agriculture. Ask me about treatments, cultivation tips, pest control, and more!
                    </AlertDescription>
                </Alert>

                {/* Chat Messages */}
                <Card className="shadow-xl border-green-200 mb-6">
                    <CardContent className="p-6">
                        <div className="h-[500px] overflow-y-auto space-y-4 mb-4 pr-2">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="bg-green-600 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    
                                    <div className={`flex flex-col gap-2 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`rounded-2xl px-4 py-3 ${
                                                message.role === 'user'
                                                    ? 'bg-green-600 text-white'
                                                    : message.isError
                                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {message.role === 'user' ? (
                                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </p>
                                            ) : (
                                                <MarkdownMessage 
                                                    content={message.content} 
                                                    className="text-sm leading-relaxed"
                                                />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {message.role === 'assistant' && !message.isError && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0"
                                                    onClick={() => speakText(message.content)}
                                                >
                                                    {isSpeaking ? (
                                                        <StopCircle className="h-4 w-4" />
                                                    ) : (
                                                        <Volume2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="bg-green-600 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="bg-green-600 rounded-full p-2 h-10 w-10 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                                    </div>
                                </div>
                            )}
                            
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="flex gap-2">
                            <Input
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={`Ask about ${initialAnalysis.cropName} or farming...`}
                                disabled={loading}
                                className="flex-1 border-green-300 focus:ring-green-500 text-base"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-6"
                                size="lg"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Questions */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-green-800">Quick Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "What are the best fertilizers for this crop?",
                                "How can I prevent this issue in the future?",
                                "When is the best time to harvest?",
                                "What are the optimal growing conditions?",
                                "Tell me more about organic pest control methods"
                            ].map((question, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setInputMessage(question)}
                                    className="text-sm border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700"
                                    disabled={loading}
                                >
                                    {question}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ChatbotCropDoctor
