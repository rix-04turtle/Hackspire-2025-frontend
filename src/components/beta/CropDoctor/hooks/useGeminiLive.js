import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook for managing Gemini Live API connection
 * Handles WebSocket connection, audio/video streaming, and real-time responses
 */
export const useGeminiLive = () => {
    const [isConnected, setIsConnected] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState(null)
    const [transcript, setTranscript] = useState('')
    const [audioResponse, setAudioResponse] = useState(null)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [availableDevices, setAvailableDevices] = useState({ video: [], audio: [] })
    const [selectedVideoDevice, setSelectedVideoDevice] = useState(null)
    const [isListening, setIsListening] = useState(false) // Mic active indicator
    
    const wsRef = useRef(null)
    const mediaStreamRef = useRef(null)
    const videoRef = useRef(null)
    const audioContextRef = useRef(null)
    const frameIntervalRef = useRef(null)
    const captureVideoRef = useRef(null) // For frame capture
    const processorRef = useRef(null) // Store processor for cleanup

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    /**
     * Initialize WebSocket connection to Gemini Live API
     */
    const connect = useCallback(async (systemInstruction) => {
        try {
            if (!API_KEY) {
                const errorMsg = 'Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in .env.local'
                console.error('❌', errorMsg)
                console.log('📝 Steps to fix:')
                console.log('1. Create a file named .env.local in the frontend directory')
                console.log('2. Add: NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here')
                console.log('3. Get your API key from: https://aistudio.google.com/apikey')
                console.log('4. Restart your dev server')
                throw new Error(errorMsg)
            }

            // Close existing connection if any
            if (wsRef.current) {
                wsRef.current.close()
            }

            // WebSocket URL for Gemini Live API (v1alpha for native audio support)
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${API_KEY}`
            
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('✅ WebSocket Connected to Gemini Live API')
                console.log('📡 API Key present:', API_KEY ? 'Yes (length: ' + API_KEY.length + ')' : 'No')
                setError(null)

                // Send setup message with correct format for Live API
                // Enable both TEXT and AUDIO responses
                const setupMessage = {
                    setup: {
                        model: 'models/gemini-2.0-flash-exp',
                        generationConfig: {
                            responseModalities: ['AUDIO'] // Enable audio output
                        },
                        systemInstruction: {
                            parts: [{
                                text: systemInstruction || `You are an expert agricultural AI assistant specializing in crop health analysis. 
                                Analyze images of crops in real-time to identify:
                                - Crop type and variety
                                - Plant health status
                                - Visible diseases, pests, or deficiencies
                                - Nutritional deficiencies (yellowing, spots, wilting)
                                - Environmental stress indicators
                                - Actionable recommendations for treatment
                                
                                Provide clear, concise responses suitable for farmers. 
                                Be specific about diseases and treatments.`
                            }]
                        }
                    }
                }

                console.log('📤 Sending setup message:', JSON.stringify(setupMessage, null, 2))
                ws.send(JSON.stringify(setupMessage))
            }

            ws.onmessage = async (event) => {
                try {
                    // Handle Blob data from WebSocket
                    let data = event.data
                    if (data instanceof Blob) {
                        data = await data.text()
                    }
                    
                    const response = JSON.parse(data)
                    console.log('📥 Received from Gemini:', response)

                    // Handle setup completion
                    if (response.setupComplete) {
                        console.log('✅ Setup complete - Ready to stream!')
                        setIsConnected(true) // Set connected after setup completes
                    }

                    // Handle server content (text, audio responses)
                    if (response.serverContent) {
                        const { modelTurn, turnComplete } = response.serverContent

                        if (modelTurn && modelTurn.parts) {
                            modelTurn.parts.forEach(part => {
                                // Handle text response
                                if (part.text) {
                                    setTranscript(prev => prev + part.text)
                                    
                                    // Try to parse structured analysis
                                    try {
                                        if (part.text.includes('{') && part.text.includes('}')) {
                                            const jsonMatch = part.text.match(/\{[\s\S]*\}/)
                                            if (jsonMatch) {
                                                const parsed = JSON.parse(jsonMatch[0])
                                                setAnalysisResult(parsed)
                                            }
                                        }
                                    } catch (e) {
                                        // Not JSON, just text
                                    }
                                }

                                // Handle audio response
                                if (part.inlineData && part.inlineData.mimeType === 'audio/pcm') {
                                    const audioData = part.inlineData.data
                                    setAudioResponse(audioData)
                                    playAudioResponse(audioData)
                                }
                            })
                        }

                        if (turnComplete) {
                            console.log('Turn complete')
                        }
                    }

                    // Handle interruption
                    if (response.serverContent && response.serverContent.interrupted) {
                        console.log('Generation interrupted')
                    }

                    // Handle tool calls if any
                    if (response.toolCall) {
                        console.log('Tool call received:', response.toolCall)
                    }

                } catch (err) {
                    console.error('❌ Error parsing WebSocket message:', err)
                    console.error('Raw data type:', typeof event.data)
                    console.error('Raw data:', event.data)
                }
            }

            ws.onerror = (err) => {
                console.error('WebSocket error:', err)
                setError('Connection error occurred')
                setIsConnected(false)
            }

            ws.onclose = (event) => {
                console.log('WebSocket connection closed', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                })
                setIsConnected(false)
                
                if (event.code !== 1000) {
                    setError(`Connection closed unexpectedly (${event.code}): ${event.reason || 'Unknown reason'}`)
                }
            }

        } catch (err) {
            console.error('Connection error:', err)
            setError(err.message)
        }
    }, [API_KEY])

    /**
     * Play audio response from Gemini
     */
    const playAudioResponse = useCallback((base64Audio) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
            }

            const audioContext = audioContextRef.current
            
            console.log('🔊 Playing audio response...')
            
            // Decode base64 to array buffer
            const binaryString = atob(base64Audio)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
            }

            // Convert PCM to AudioBuffer (24kHz, 16-bit, mono - Gemini's output format)
            const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, 24000)
            const channelData = audioBuffer.getChannelData(0)
            
            for (let i = 0; i < channelData.length; i++) {
                // Little-endian 16-bit PCM
                const int16 = (bytes[i * 2 + 1] << 8) | bytes[i * 2]
                // Convert to -1.0 to 1.0 range
                channelData[i] = int16 < 0 ? int16 / 32768.0 : int16 / 32767.0
            }

            // Play audio
            const source = audioContext.createBufferSource()
            source.buffer = audioBuffer
            source.connect(audioContext.destination)
            source.onended = () => {
                console.log('✅ Audio playback finished')
            }
            source.start(0)

        } catch (err) {
            console.error('❌ Error playing audio:', err)
        }
    }, [])

    /**
     * Get available media devices
     */
    const getDevices = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const videoDevices = devices.filter(d => d.kind === 'videoinput')
            const audioDevices = devices.filter(d => d.kind === 'audioinput')
            
            setAvailableDevices({ video: videoDevices, audio: audioDevices })
            
            if (videoDevices.length > 0 && !selectedVideoDevice) {
                setSelectedVideoDevice(videoDevices[0].deviceId)
            }
            
            return { video: videoDevices, audio: audioDevices }
        } catch (err) {
            console.error('Error getting devices:', err)
            return { video: [], audio: [] }
        }
    }, [selectedVideoDevice])

    /**
     * Start streaming video and audio to Gemini
     */
    const startStreaming = useCallback(async (deviceId = null) => {
        try {
            const videoDeviceId = deviceId || selectedVideoDevice
            
            console.log('🎥 Starting stream with device:', videoDeviceId)
            
            // Request camera and microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoDeviceId ? 
                    { deviceId: { exact: videoDeviceId } } : 
                    { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user' // Start with front camera
                    },
                audio: {
                    channelCount: 1,
                    sampleRate: 16000,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            console.log('✅ Got media stream:', {
                video: stream.getVideoTracks(),
                audio: stream.getAudioTracks()
            })

            mediaStreamRef.current = stream
            setIsStreaming(true)

            // Wait a bit for React to render the video element
            await new Promise(resolve => setTimeout(resolve, 100))

            // Attach video stream to display video element
            if (videoRef.current) {
                console.log('📺 Attaching stream to video element')
                videoRef.current.srcObject = stream
                videoRef.current.muted = true
                videoRef.current.playsInline = true
                
                try {
                    await videoRef.current.play()
                    console.log('▶️ Video playing')
                } catch (playErr) {
                    console.error('Error playing video:', playErr)
                }
            } else {
                console.error('❌ videoRef.current is null!')
            }

            // Start capturing video frames
            startVideoFrameCapture(stream)

            // Start capturing audio for voice input
            startAudioCapture(stream)
            
            console.log('✅ Started video and audio capture. Analysis will happen every 3 seconds or when you speak.')

        } catch (err) {
            console.error('❌ Error starting stream:', err)
            setError('Failed to access camera/microphone: ' + err.message)
        }
    }, [selectedVideoDevice])

    /**
     * Switch camera
     */
    const switchCamera = useCallback(async (deviceId) => {
        if (isStreaming) {
            // Stop current stream
            stopStreaming()
            // Wait a bit for cleanup
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        setSelectedVideoDevice(deviceId)
        // Start with new device
        await startStreaming(deviceId)
    }, [isStreaming, startStreaming])

    /**
     * Capture and send video frames to Gemini
     */
    const startVideoFrameCapture = useCallback((stream) => {
        // Use the existing video element for capture
        if (!captureVideoRef.current) {
            captureVideoRef.current = document.createElement('video')
        }
        
        const video = captureVideoRef.current
        video.srcObject = stream
        video.play()

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        let frameCount = 0

        // Send frames at 1 FPS (adjust as needed for performance)
        frameIntervalRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && video.readyState >= 2) {
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                ctx.drawImage(video, 0, 0)

                // Convert to base64 JPEG
                const imageData = canvas.toDataURL('image/jpeg', 0.7)
                const base64Data = imageData.split(',')[1]

                frameCount++
                
                // Send video frame with text prompt every 3 seconds to trigger analysis
                if (frameCount % 3 === 0) {
                    console.log('📸 Sending frame with analysis request')
                    const message = {
                        clientContent: {
                            turns: [{
                                role: 'user',
                                parts: [
                                    {
                                        inlineData: {
                                            mimeType: 'image/jpeg',
                                            data: base64Data
                                        }
                                    },
                                    {
                                        text: 'What do you see in this image? Analyze the crop health, identify any diseases, pests, or issues. Be specific and concise.'
                                    }
                                ]
                            }],
                            turnComplete: true
                        }
                    }
                    wsRef.current.send(JSON.stringify(message))
                } else {
                    // Just send frame without triggering response
                    const message = {
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: 'image/jpeg',
                                data: base64Data
                            }]
                        }
                    }
                    wsRef.current.send(JSON.stringify(message))
                }
            }
        }, 1000) // 1 frame per second

    }, [])

    /**
     * Capture and send audio to Gemini
     */
    const startAudioCapture = useCallback((stream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000
            })
        }

        const audioContext = audioContextRef.current
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        
        processorRef.current = processor

        source.connect(processor)
        processor.connect(audioContext.destination)
        
        setIsListening(true)
        console.log('🎤 Microphone active - speak to interact!')

        processor.onaudioprocess = (e) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const inputData = e.inputBuffer.getChannelData(0)
                
                // Check audio level for visual feedback
                let sum = 0
                for (let i = 0; i < inputData.length; i++) {
                    sum += Math.abs(inputData[i])
                }
                const average = sum / inputData.length
                
                // Only send if there's actual audio (noise gate)
                if (average > 0.01) {
                    // Convert Float32Array to Int16Array (PCM 16-bit)
                    const pcmData = new Int16Array(inputData.length)
                    for (let i = 0; i < inputData.length; i++) {
                        const s = Math.max(-1, Math.min(1, inputData[i]))
                        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
                    }

                    // Convert to base64
                    const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(pcmData.buffer)))

                    // Send audio chunk via realtimeInput
                    const message = {
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64Audio
                            }]
                        }
                    }

                    wsRef.current.send(JSON.stringify(message))
                }
            }
        }
    }, [])

    /**
     * Send a text message to Gemini
     */
    const sendMessage = useCallback((text) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log('💬 Sending message:', text)
            
            const message = {
                clientContent: {
                    turns: [{
                        role: 'user',
                        parts: [{ text }]
                    }],
                    turnComplete: true
                }
            }
            
            wsRef.current.send(JSON.stringify(message))
            setTranscript('')
        } else {
            console.error('❌ WebSocket not ready. State:', wsRef.current?.readyState)
        }
    }, [])

    /**
     * Stop streaming
     */
    const stopStreaming = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop())
            mediaStreamRef.current = null
        }

        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current)
        }
        
        if (processorRef.current) {
            processorRef.current.disconnect()
            processorRef.current = null
        }

        setIsStreaming(false)
        setIsListening(false)
    }, [])

    /**
     * Disconnect from Gemini Live API
     */
    const disconnect = useCallback(() => {
        stopStreaming()

        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }

        setIsConnected(false)
        setTranscript('')
        setAnalysisResult(null)
    }, [stopStreaming])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect()
        }
    }, [disconnect])

    // Load available devices on mount
    useEffect(() => {
        getDevices()
    }, [getDevices])

    return {
        isConnected,
        isStreaming,
        isListening,
        error,
        transcript,
        audioResponse,
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
    }
}
