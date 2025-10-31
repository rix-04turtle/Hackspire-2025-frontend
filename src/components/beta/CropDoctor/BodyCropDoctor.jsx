import React, { useState, useRef } from 'react'
import { GoogleGenAI } from '@google/genai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload, Leaf, FlaskConical, ShieldCheck, Clock, AlertTriangle, Bug, TestTube, Volume2, StopCircle, X } from 'lucide-react'

const BetaBodyCropDoctor = () => {
    const [image, setImage] = useState(null)
    const [preview, setPreview] = useState(null)
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [language, setLanguage] = useState('English')
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [currentAudio, setCurrentAudio] = useState(null)
    const fileInputRef = useRef(null)

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

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreview(URL.createObjectURL(file))
            setAnalysis(null)
        }
    }

    const analyzeImage = async () => {
        if (!image) return

        setLoading(true)
        setAnalysis(null)

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })

            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Image = reader.result.split(',')[1]

                const prompt = `Analyze this crop/plant image and return your response in the following JSON format. The entire response, including keys and values in the JSON, must be in ${language}.
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
    ]
  },
  "preventiveMeasures": ["list of preventive measures"],
  "estimatedRecoveryTime": "time estimate"
}

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
            }

            reader.readAsDataURL(image)
        } catch (error) {
            console.error('Error analyzing image:', error)
            setAnalysis({ error: 'Error analyzing image. Please try again.' })
            setLoading(false)
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
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold tracking-tight text-green-800 mb-4">Crop Doctor</h1>
                    <p className="text-lg text-green-700 max-w-2xl mx-auto">
                        Upload an image of your crop and let our AI-powered system diagnose and provide treatment recommendations.
                    </p>
                    <div className="max-w-xs mx-auto mt-6">
                        <Select onValueChange={setLanguage} defaultValue={language}>
                            <SelectTrigger className="bg-white/80 backdrop-blur-sm border-green-200">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Bengali">Bengali</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div
                        className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center cursor-pointer hover:bg-green-50/50 transition-all group relative overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="relative z-10">
                            <div className="bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                <Upload className="h-10 w-10 text-green-600 group-hover:scale-110 transition-transform" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Upload Your Crop Image</h3>
                            <p className="text-green-600">Click to upload or drag and drop</p>
                            <p className="text-sm text-green-500 mt-2">Supports: JPG, PNG</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {preview && (
                        <div className="mt-6 relative group">
                            <div className="relative rounded-xl overflow-hidden shadow-lg">
                                <img src={preview} alt="Preview" className="max-w-full mx-auto" />
                                <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setImage(null);
                                    setPreview(null);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <Button
                        onClick={analyzeImage}
                        disabled={!image || loading}
                        className={`w-full mt-6 text-lg font-semibold h-12 ${!image ? 'opacity-50' : 'hover:scale-[1.02]'}`}
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Leaf className="mr-2 h-5 w-5" />
                                Analyze Crop
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {analysis && !analysis.error && (
                <div className="max-w-2xl mx-auto mt-8 space-y-6">
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
                </div>
            )}

            {analysis && analysis.error && (
                <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{analysis.error}</AlertDescription>
                </Alert>
            )}
            </div>
        </div>
    );
};

export default BetaBodyCropDoctor;