import React, { useState } from 'react'
import { GoogleGenAI } from '@google/genai'

const BodyCropDoctor = () => {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const analyzeImage = async () => {
    if (!image) return

    setLoading(true)
    setAnalysis('')

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY })
      
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1]
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Analyze this crop/plant image. Identify any diseases, pests, or issues. Provide treatment recommendations.' },
                { inlineData: { mimeType: image.type, data: base64Image } }
              ]
            }
          ]
        })
        
        setAnalysis(response.text)
        setLoading(false)
      }
      
      reader.readAsDataURL(image)
    } catch (error) {
      console.error('Error analyzing image:', error)
      setAnalysis('Error analyzing image. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Crop Doctor</h1>
      
      <div className="mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        
        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Preview" className="max-w-md rounded shadow" />
          </div>
        )}
        
        <button
          onClick={analyzeImage}
          disabled={!image || loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Analyze Crop'}
        </button>
      </div>

      {analysis && (
        <div className="bg-gray-100 p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Analysis Results:</h2>
          <p className="whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  )
}

export default BodyCropDoctor