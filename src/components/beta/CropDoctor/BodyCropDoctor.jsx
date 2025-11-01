import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { GoogleGenAI } from '@google/genai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, Leaf, FlaskConical, ShieldCheck, Clock, AlertTriangle, Bug, TestTube, Volume2, StopCircle, X, ShoppingCart, ExternalLink, MessageCircle, Camera, ImageIcon, RefreshCw } from 'lucide-react'

// Mock marketplace data - Replace with your actual API/data source
const marketplaceProducts = [
    {
        name: "Mancozeb", marketPlaceName: "AgriBegri", link: "https://agribegri.com/products/buy-katyayani-chatur-mancozeb-azoxystrobin-fungicide-online.php",
        img: "https://dujjhct8zer0r.cloudfront.net/media/prod_image/6282905051728638332.webp", price: 1075
    },
    { name: "Mancozeb", marketPlaceName: "Spray Karo", link: "https://www.spraykaro.com/product/hpm-natraj-azoxystrobin-11-5-mancozeb-30-wp-1", img: "https://www.spraykaro.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fstrapi-spraykaro%2Fimage%2Fupload%2Ff_auto%2Cq_auto%2Fv1%2Fspraykaro%2F3093468721737636652_2a6a90ebd1&w=640&q=75", price: 830 },
]

const BodyCropDoctor = () => {
    const router = useRouter()
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [language, setLanguage] = useState('English')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [currentAudio, setCurrentAudio] = useState(null)
    const [captureMode, setCaptureMode] = useState('upload') // 'upload' or 'camera'
    const [isCameraActive, setIsCameraActive] = useState(false)
    const [stream, setStream] = useState(null)
    const [facingMode, setFacingMode] = useState('environment') // 'environment' (back) or 'user' (front)
    const fileInputRef = useRef(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const resultsRef = useRef(null)

    // Function to find all matching products from marketplace
    const findMarketplaceProducts = (pesticideName) => {
        return marketplaceProducts.filter(product =>
            product.name.toLowerCase().includes(pesticideName.toLowerCase()) ||
            pesticideName.toLowerCase().includes(product.name.toLowerCase())
        )
    }

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
                const errorBody = await response.json().catch(() => ({ error: 'Failed to parse error from backend.' }))
                throw new Error(errorBody.error || 'Failed to generate speech.')
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
                alert('Error playing audio.')
            }
        } catch (error) {
            console.error('Error with TTS fetch:', error)
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                alert('Could not connect to the backend server. Please ensure it is running and accessible.')
            } else {
                alert(`Sorry, we could not generate the speech. Error: ${error.message}`)
            }
            setIsSpeaking(false)
        }
    }

    const startCamera = async () => {
        // Stop any existing stream first
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            
            // Wait for next tick to ensure ref is available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 0);
            
            setIsCameraActive(true);
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Could not access camera. Please ensure you have granted camera permissions.');
            setIsCameraActive(false);
        }
    }

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            setStream(null);
        }
        setIsCameraActive(false);
    }

    const switchCamera = () => {
        // Toggle facing mode - this will trigger the useEffect
        setFacingMode(prevMode => (prevMode === 'environment' ? 'user' : 'environment'));
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Check if video is actually playing
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                alert('Camera not ready. Please wait a moment and try again.');
                return;
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Canvas to Blob conversion failed');
                    alert('Could not capture photo. Please try again.');
                    return;
                }
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                setImage(file);
                setPreview(URL.createObjectURL(blob));
                setAnalysis(null);
                stopCamera();
            }, 'image/jpeg', 0.95);
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreview(URL.createObjectURL(file))
            setAnalysis(null)
        }
    }

    const handleModeChange = (mode) => {
        setCaptureMode(mode)
        if (mode === 'camera' && !isCameraActive && !preview) {
            startCamera()
        } else if (mode === 'upload' && isCameraActive) {
            stopCamera()
        }
    }

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Effect to restart camera when facing mode changes
    React.useEffect(() => {
        if (isCameraActive) {
            startCamera();
        }
    }, [facingMode]);

    const analyzeImage = async () => {
        if (!image) return

        setLoading(true)
        setAnalysis(null)

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Image = reader.result.split(',')[1]

                const prompt = `Analyze this crop/plant image and return your response in the following JSON format. The entire response, including keys and values in the JSON, must be in ${language}, EXCEPT for the "chemicalPesticideNames" array which must ALWAYS be in English (as these are used for product matching in our marketplace database).
{
  "cropName": "name of the crop/plant",
  "healthStatus": "healthy/diseased/pest-infested",
  "confidence": "percentage (e.g., 85%)",
  "issues": [
    {
      "type": "disease/pest/nutrient-deficiency",
      "name": "specific name",
      "severity": "mild/moderate/severe",
      "description": ["detailed point-wise description of the issue and why it happens. No Paragraphy text"]
    }
  ],
  "treatments": {
    "natural": [
      {
        "method": "Name of the natural/homemade remedy",
        "details": ["Detailed point-wise instructions on how to prepare and apply it"]
      }
    ],
    "chemical": [
      {
        "pesticideName": "Name of the chemical pesticide/fertilizer",
        "application": ["Detailed point-wise instructions on how and when to apply"]
      }
    ],
    "chemicalPesticideNames": ["Array of ENGLISH ONLY chemical pesticide/fertilizer names as strings - these must be in English regardless of the selected language"]
  },
  "preventiveMeasures": ["list of preventive measures"],
  "estimatedRecoveryTime": "time estimate"
}

IMPORTANT: The "chemicalPesticideNames" array must contain only English names of pesticides/fertilizers for product database matching. All other fields should be in ${language}.

Provide accurate and detailed analysis. If the image is not a crop/plant, indicate that in the response.`

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                { text: prompt },
                                { inlineData: { mimeType: image.type, data: base64Image } }
                            ]
                        }
                    ]
                })

                // Parse JSON response
                const responseText = response.text.replace(/```json\n?|\n?```/g, '').trim()
                const parsedAnalysis = JSON.parse(responseText)
                setAnalysis(parsedAnalysis)
                setLoading(false)

                // Auto-scroll to results after a brief delay to ensure DOM is updated
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }, 100)
            }

            reader.readAsDataURL(image)
        } catch (error) {
            console.error('Error analyzing image:', error)
            setAnalysis({ error: 'Error analyzing image. Please try again.' })
            setLoading(false)

            // Also scroll to error message
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        }
    }

    const getHealthStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy': return 'success'
            case 'diseased': return 'destructive'
            case 'pest-infested': return 'warning'
            default: return 'secondary'
        }
    }

    const getSeverityVariant = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'severe': return 'destructive'
            case 'moderate': return 'warning'
            case 'mild': return 'secondary'
            default: return 'secondary'
        }
    }

    const getIssueIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'disease': return <Bug className="h-5 w-5 text-red-500" />
            case 'pest': return <Bug className="h-5 w-5 text-orange-500" />
            case 'nutrient-deficiency': return <TestTube className="h-5 w-5 text-yellow-500" />
            default: return <AlertTriangle className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
            <div className="container mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold tracking-tight text-green-800 mb-3">🌾 Crop Doctor</h1>
                    <p className="text-lg text-green-700 max-w-2xl mx-auto">
                        AI-powered crop diagnosis and treatment recommendations
                    </p>
                    
                    {/* New Live Mode Banner */}
                    {/* <div className="mt-6 max-w-2xl mx-auto">
                        <Alert className="bg-linear-to-r from-blue-50 to-cyan-50 border-blue-200">
                            <AlertDescription className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <MessageCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-blue-900">Try Live Crop Doctor!</p>
                                        <p className="text-sm text-blue-700">Real-time video analysis with Gemini Live API</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => router.push('/live-crop-doctor')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    size="sm"
                                >
                                    Try Live Mode
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </div> */}

                </div>

                {/* Main Card */}
                <Card className="max-w-4xl mx-auto shadow-xl border-green-200">
                    <CardContent className="p-8">
                        {/* Language Selector - Top Right */}
                        <div className="flex justify-end mb-6">
                            <div className="w-48">
                                <label className="text-xs font-medium text-green-700 mb-1.5 block">Language</label>
                                <Select onValueChange={setLanguage} defaultValue={language}>
                                    <SelectTrigger className="bg-white border-green-300 focus:ring-green-500">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">🇬🇧 English</SelectItem>
                                        <SelectItem value="Hindi">🇮🇳 Hindi</SelectItem>
                                        <SelectItem value="Bengali">🇧🇩 Bengali</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Mode Selector - Upload vs Camera */}
                        {!preview && (
                            <div className="flex gap-3 mb-6">
                                <Button
                                    variant={captureMode === 'upload' ? 'default' : 'outline'}
                                    className={`flex-1 h-12 ${captureMode === 'upload' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 hover:bg-green-50'}`}
                                    onClick={() => handleModeChange('upload')}
                                >
                                    <ImageIcon className="h-5 w-5 mr-2" />
                                    Upload Image
                                </Button>
                                <Button
                                    variant={captureMode === 'camera' ? 'default' : 'outline'}
                                    className={`flex-1 h-12 ${captureMode === 'camera' ? 'bg-green-600 hover:bg-green-700' : 'border-green-300 hover:bg-green-50'}`}
                                    onClick={() => handleModeChange('camera')}
                                >
                                    <Camera className="h-5 w-5 mr-2" />
                                    Capture Photo
                                </Button>
                            </div>
                        )}

                        {/* Upload Section */}
                        {!preview && captureMode === 'upload' && (
                            <div
                                className="border-2 border-dashed border-green-300 rounded-2xl p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/50 transition-all group relative overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="relative z-10">
                                    <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                        <Upload className="h-12 w-12 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 mb-2">Upload Your Crop Image</h3>
                                    <p className="text-green-600 mb-3">Click to browse or drag and drop your image here</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-500">
                                        <span className="px-3 py-1 bg-green-100 rounded-full">JPG</span>
                                        <span className="px-3 py-1 bg-green-100 rounded-full">PNG</span>
                                        <span className="px-3 py-1 bg-green-100 rounded-full">JPEG</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 via-transparent to-green-200/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {/* Camera Section */}
                        {!preview && captureMode === 'camera' && (
                            <div className="border-2 border-green-300 rounded-2xl overflow-hidden bg-black relative">
                                {isCameraActive ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-auto max-h-[500px] object-contain"
                                        />
                                        {/* Camera Switch Button - Top Right */}
                                        <Button
                                            onClick={switchCamera}
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm z-10"
                                        >
                                            <RefreshCw className="h-5 w-5 text-green-700" />
                                        </Button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                            <div className="flex justify-center gap-4">
                                                <Button
                                                    onClick={capturePhoto}
                                                    className="bg-green-600 hover:bg-green-700 text-white h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                                    size="lg"
                                                >
                                                    <Camera className="h-5 w-5 mr-2" />
                                                    Capture Photo
                                                </Button>
                                                <Button
                                                    onClick={stopCamera}
                                                    variant="destructive"
                                                    className="h-14 px-6 rounded-full shadow-lg"
                                                    size="lg"
                                                >
                                                    <X className="h-5 w-5 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-12 text-center">
                                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 shadow-lg">
                                            <Camera className="h-12 w-12 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-800 mb-2">Camera Ready</h3>
                                        <p className="text-green-600 mb-6">Click below to start your camera</p>
                                        <Button
                                            onClick={startCamera}
                                            className="bg-green-600 hover:bg-green-700 text-white h-12 px-8"
                                            size="lg"
                                        >
                                            <Camera className="h-5 w-5 mr-2" />
                                            Start Camera
                                        </Button>
                                    </div>
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                        )}

                        {/* Image Preview Section */}
                        {preview && (
                            <div className="space-y-4">
                                {/* Image Preview */}
                                <div className="relative group">
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-green-200">
                                        <img src={preview} alt="Preview" className="w-full h-auto max-h-[500px] object-contain bg-gray-50" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImage(null);
                                            setPreview(null);
                                            setAnalysis(null);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Analyze Button */}
                                <Button
                                    onClick={analyzeImage}
                                    disabled={!image || loading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg font-semibold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    size="lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                            Analyzing Your Crop...
                                        </>
                                    ) : (
                                        <>
                                            <Leaf className="mr-3 h-6 w-6" />
                                            Analyze Crop Now
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysis && !analysis.error && (
                    <div ref={resultsRef} className="max-w-4xl mx-auto mt-8 space-y-6 scroll-mt-8">
                        <Card className="backdrop-blur-sm bg-white/90 border-green-100 shadow-lg overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent pointer-events-none" />
                            <CardHeader className="relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl text-green-800">{analysis.cropName}</CardTitle>
                                        <CardDescription className="text-green-600">Confidence: {analysis.confidence}</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-green-200 hover:bg-green-50"
                                        onClick={() => speakText(`Crop name: ${analysis.cropName}. Health status: ${analysis.healthStatus}. Confidence: ${analysis.confidence}.`)}
                                    >
                                        {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <Badge
                                    variant={getHealthStatusVariant(analysis.healthStatus)}
                                    className="text-sm px-4 py-1 font-medium"
                                >
                                    {analysis.healthStatus}
                                </Badge>
                            </CardContent>
                        </Card>

                        {analysis.issues?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identified Issues</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {analysis.issues.map((issue, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div>{getIssueIcon(issue.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-semibold">{issue.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getSeverityVariant(issue.severity)}>{issue.severity}</Badge>
                                                        <Button variant="ghost" size="icon" onClick={() => speakText(`Issue: ${issue.name}. Severity: ${issue.severity}. Description: ${issue.description.join('. ')}.`)}>
                                                            {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-1">
                                                    {issue.description.map((point, i) => <li key={i}>{point}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {analysis.treatments && (analysis.treatments.natural?.length > 0 || analysis.treatments.chemical?.length > 0) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Treatment Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {analysis.treatments.natural?.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold flex items-center gap-2"><Leaf className="h-5 w-5 text-green-500" /> Natural Remedies</h4>
                                                <Button variant="ghost" size="icon" onClick={() => speakText(`Natural Remedies. ${analysis.treatments.natural.map(rec => `${rec.method}: ${rec.details.join('. ')}`).join('. ')}`)}>
                                                    {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {analysis.treatments.natural.map((rec, index) => (
                                                    <div key={index} className="text-sm pl-7">
                                                        <p className="font-semibold">{rec.method}</p>
                                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                                                            {rec.details.map((point, i) => <li key={i}>{point}</li>)}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {analysis.treatments.chemical?.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5 text-orange-500" /> Chemical Treatments</h4>
                                                <Button variant="ghost" size="icon" onClick={() => speakText(`Chemical Treatments. ${analysis.treatments.chemical.map(rec => `${rec.pesticideName}: ${rec.application.join('. ')}`).join('. ')}`)}>
                                                    {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {analysis.treatments.chemical.map((rec, index) => (
                                                    <div key={index} className="text-sm pl-7">
                                                        <p className="font-semibold">{rec.pesticideName}</p>
                                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                                                            {rec.application.map((point, i) => <li key={i}>{point}</li>)}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {analysis.treatments?.chemicalPesticideNames?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Buy Chemical Products
                                    </CardTitle>
                                    <CardDescription>Purchase recommended pesticides and fertilizers online</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {analysis.treatments.chemicalPesticideNames.map((pesticideName, index) => {
                                            const products = findMarketplaceProducts(pesticideName)

                                            // Only render if products are found
                                            if (products.length === 0) return null

                                            return (
                                                <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                                                    <h5 className="font-semibold text-lg mb-4 text-gray-800">{pesticideName}</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {products.map((product, pIndex) => (
                                                            <div key={pIndex} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                                                                {/* Product Image */}
                                                                <div className="relative bg-gray-100 h-48 flex items-center justify-center">
                                                                    <img
                                                                        src={product.img}
                                                                        alt={product.name}
                                                                        className="max-h-full max-w-full object-contain p-4"
                                                                    />
                                                                    {/* Marketplace Badge */}
                                                                    <Badge className="absolute top-2 right-2 bg-blue-600">
                                                                        {product.marketPlaceName}
                                                                    </Badge>
                                                                </div>

                                                                {/* Product Details */}
                                                                <div className="p-4">
                                                                    <h6 className="font-semibold text-sm text-gray-800 mb-2 line-clamp-2">
                                                                        {product.name}
                                                                    </h6>

                                                                    {/* Price Section */}
                                                                    <div className="flex items-baseline gap-2 mb-3">
                                                                        <span className="text-2xl font-bold text-gray-900">
                                                                            ₹{product.price.toLocaleString('en-IN')}
                                                                        </span>
                                                                        <span className="text-sm text-gray-500">
                                                                            Inclusive of all taxes
                                                                        </span>
                                                                    </div>

                                                                    {/* Buy Button */}
                                                                    <a
                                                                        href={product.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="block w-full"
                                                                    >
                                                                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                                                            Buy Now
                                                                            <ExternalLink className="h-3 w-3 ml-2" />
                                                                        </Button>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {analysis.preventiveMeasures?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Preventive Measures</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => speakText(`Preventive Measures. ${analysis.preventiveMeasures.join('. ')}`)}>
                                            {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        {analysis.preventiveMeasures.map((measure, index) => (
                                            <li key={index}>{measure}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {analysis.estimatedRecoveryTime && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Estimated Recovery Time</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => speakText(`Estimated Recovery Time: ${analysis.estimatedRecoveryTime}`)}>
                                            {isSpeaking ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-medium">{analysis.estimatedRecoveryTime}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Know More / Chat Button */}
                        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-none shadow-xl">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="h-8 w-8" />
                                        <div>
                                            <h3 className="text-xl font-bold">Have More Questions?</h3>
                                            <p className="text-green-100 text-sm">Chat with our AI expert about your crop and get personalized advice</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            // Store analysis in sessionStorage for the chatbot page
                                            sessionStorage.setItem('cropAnalysis', JSON.stringify(analysis))
                                            sessionStorage.setItem('selectedLanguage', language)
                                            router.push('/beta/crop-chatbot')
                                        }}
                                        className="bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-3 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                        size="lg"
                                    >
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        Know More
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Error Display */}
                {analysis && analysis.error && (
                    <Alert ref={resultsRef} variant="destructive" className="max-w-4xl mx-auto mt-8 border-red-300 scroll-mt-8">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-semibold">Analysis Error</AlertTitle>
                        <AlertDescription className="text-base">{analysis.error}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );
};

export default BodyCropDoctor;