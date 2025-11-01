/**
 * Media processing utilities for Gemini Live API
 * Handles audio/video encoding, format conversion, and streaming
 */

/**
 * Convert a Float32Array audio buffer to 16-bit PCM format
 * @param {Float32Array} float32Array - Audio data in Float32 format (-1.0 to 1.0)
 * @returns {Int16Array} - Audio data in 16-bit PCM format
 */
export const float32ToPCM16 = (float32Array) => {
    const pcm16 = new Int16Array(float32Array.length)
    
    for (let i = 0; i < float32Array.length; i++) {
        // Clamp values to -1.0 to 1.0 range
        const s = Math.max(-1, Math.min(1, float32Array[i]))
        // Convert to 16-bit integer
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    
    return pcm16
}

/**
 * Convert PCM data to base64 string for transmission
 * @param {Int16Array|Uint8Array} pcmData - PCM audio data
 * @returns {string} - Base64 encoded string
 */
export const pcmToBase64 = (pcmData) => {
    const uint8Array = new Uint8Array(pcmData.buffer)
    let binary = ''
    
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i])
    }
    
    return btoa(binary)
}

/**
 * Convert base64 PCM audio to AudioBuffer for playback
 * @param {string} base64Audio - Base64 encoded PCM audio
 * @param {AudioContext} audioContext - Web Audio API context
 * @param {number} sampleRate - Sample rate (default: 24000 for Gemini output)
 * @returns {AudioBuffer} - Audio buffer ready for playback
 */
export const base64ToAudioBuffer = (base64Audio, audioContext, sampleRate = 24000) => {
    // Decode base64 to binary string
    const binaryString = atob(base64Audio)
    const bytes = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Convert PCM bytes to Float32 for AudioBuffer
    const audioBuffer = audioContext.createBuffer(1, bytes.length / 2, sampleRate)
    const channelData = audioBuffer.getChannelData(0)
    
    // Convert 16-bit PCM to Float32
    for (let i = 0; i < channelData.length; i++) {
        // Read little-endian 16-bit integer
        const int16 = (bytes[i * 2 + 1] << 8) | bytes[i * 2]
        // Convert to -1.0 to 1.0 range
        channelData[i] = int16 / (int16 < 0 ? 0x8000 : 0x7FFF)
    }
    
    return audioBuffer
}

/**
 * Capture a video frame from a video element as base64 JPEG
 * @param {HTMLVideoElement} videoElement - Video element to capture from
 * @param {number} quality - JPEG quality (0.0 to 1.0, default: 0.8)
 * @returns {string} - Base64 encoded JPEG (without data URL prefix)
 */
export const captureVideoFrame = (videoElement, quality = 0.8) => {
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement, 0, 0)
    
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    // Remove the data URL prefix (data:image/jpeg;base64,)
    return dataUrl.split(',')[1]
}

/**
 * Capture a video frame from a MediaStream as base64 JPEG
 * @param {MediaStream} stream - Media stream to capture from
 * @param {number} quality - JPEG quality (0.0 to 1.0, default: 0.8)
 * @returns {Promise<string>} - Base64 encoded JPEG (without data URL prefix)
 */
export const captureStreamFrame = async (stream, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video')
        video.srcObject = stream
        video.muted = true
        video.playsInline = true
        
        video.onloadedmetadata = () => {
            video.play()
            
            // Wait for the first frame to be ready
            requestAnimationFrame(() => {
                const frame = captureVideoFrame(video, quality)
                video.srcObject = null
                resolve(frame)
            })
        }
        
        video.onerror = (err) => {
            reject(err)
        }
    })
}

/**
 * Resample audio from one sample rate to another
 * @param {Float32Array} audioData - Input audio data
 * @param {number} fromRate - Input sample rate
 * @param {number} toRate - Output sample rate
 * @returns {Float32Array} - Resampled audio data
 */
export const resampleAudio = (audioData, fromRate, toRate) => {
    if (fromRate === toRate) {
        return audioData
    }
    
    const ratio = fromRate / toRate
    const outputLength = Math.round(audioData.length / ratio)
    const output = new Float32Array(outputLength)
    
    for (let i = 0; i < outputLength; i++) {
        const position = i * ratio
        const index = Math.floor(position)
        const fraction = position - index
        
        // Linear interpolation
        const sample1 = audioData[index] || 0
        const sample2 = audioData[index + 1] || 0
        output[i] = sample1 + (sample2 - sample1) * fraction
    }
    
    return output
}

/**
 * Create an audio recorder that captures audio in chunks
 * @param {MediaStream} stream - Media stream with audio track
 * @param {Function} onChunk - Callback for each audio chunk (base64 PCM)
 * @param {number} chunkDuration - Duration of each chunk in ms (default: 100ms)
 * @returns {Object} - Recorder control object with start/stop methods
 */
export const createAudioRecorder = (stream, onChunk, chunkDuration = 100) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // Gemini Live API expects 16kHz input
    })
    
    const source = audioContext.createMediaStreamSource(stream)
    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    
    let isRecording = false
    
    source.connect(processor)
    processor.connect(audioContext.destination)
    
    processor.onaudioprocess = (e) => {
        if (!isRecording) return
        
        const inputData = e.inputBuffer.getChannelData(0)
        const pcmData = float32ToPCM16(inputData)
        const base64Audio = pcmToBase64(pcmData)
        
        onChunk(base64Audio)
    }
    
    return {
        start: () => {
            isRecording = true
        },
        stop: () => {
            isRecording = false
            processor.disconnect()
            source.disconnect()
            audioContext.close()
        },
        pause: () => {
            isRecording = false
        },
        resume: () => {
            isRecording = true
        }
    }
}

/**
 * Create a video frame capturer that sends frames at a specified rate
 * @param {HTMLVideoElement} videoElement - Video element to capture from
 * @param {Function} onFrame - Callback for each frame (base64 JPEG)
 * @param {number} fps - Frames per second (default: 1)
 * @param {number} quality - JPEG quality (default: 0.8)
 * @returns {Object} - Capturer control object with start/stop methods
 */
export const createFrameCapturer = (videoElement, onFrame, fps = 1, quality = 0.8) => {
    let intervalId = null
    
    return {
        start: () => {
            const interval = 1000 / fps
            intervalId = setInterval(() => {
                if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
                    const frame = captureVideoFrame(videoElement, quality)
                    onFrame(frame)
                }
            }, interval)
        },
        stop: () => {
            if (intervalId) {
                clearInterval(intervalId)
                intervalId = null
            }
        },
        setFps: (newFps) => {
            if (intervalId) {
                clearInterval(intervalId)
                const interval = 1000 / newFps
                intervalId = setInterval(() => {
                    if (videoElement.readyState >= 2) {
                        const frame = captureVideoFrame(videoElement, quality)
                        onFrame(frame)
                    }
                }, interval)
            }
        }
    }
}

/**
 * Check if browser supports required media APIs
 * @returns {Object} - Support status for various features
 */
export const checkMediaSupport = () => {
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasWebSocket = typeof WebSocket !== 'undefined'
    const hasAudioContext = typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined'
    const hasCanvas = !!document.createElement('canvas').getContext
    
    return {
        getUserMedia: hasGetUserMedia,
        webSocket: hasWebSocket,
        audioContext: hasAudioContext,
        canvas: hasCanvas,
        allSupported: hasGetUserMedia && hasWebSocket && hasAudioContext && hasCanvas
    }
}

/**
 * Request camera and microphone permissions
 * @param {Object} constraints - Media constraints
 * @returns {Promise<MediaStream>} - Media stream with video and audio tracks
 */
export const requestMediaPermissions = async (constraints = {
    video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'environment'
    },
    audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    }
}) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        return stream
    } catch (err) {
        console.error('Error accessing media devices:', err)
        throw new Error(`Failed to access camera/microphone: ${err.message}`)
    }
}

/**
 * Get available media devices (cameras and microphones)
 * @returns {Promise<Object>} - Object with video and audio device arrays
 */
export const getMediaDevices = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        
        return {
            videoDevices: devices.filter(d => d.kind === 'videoinput'),
            audioDevices: devices.filter(d => d.kind === 'audioinput'),
            allDevices: devices
        }
    } catch (err) {
        console.error('Error enumerating devices:', err)
        return {
            videoDevices: [],
            audioDevices: [],
            allDevices: []
        }
    }
}
