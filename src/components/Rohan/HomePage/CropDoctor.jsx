import React, { useEffect, useState } from 'react';
import { Leaf, Upload, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export default function CropDoctor({ className = '' }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onFileChange = (e) => {
        const f = e.target.files && e.target.files[0];
        if (f && f.type.startsWith('image/')) {
            setFile(f);
            setResult(null);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (f && f.type.startsWith('image/')) {
            setFile(f);
            setResult(null);
        }
    };

    const onAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setResult(null);
        // Placeholder: in future this will call the AI API with the image.
        // For now, simulate a short analysis and show mock results.
        setTimeout(() => {
            setLoading(false);
            setResult({
                diagnosis: 'Leaf Blight (mock)',
                confidence: '86%',
                medications: [
                    'Apply copper-based fungicide as per label',
                    'Remove severely affected leaves',
                    'Ensure good airflow and avoid overhead irrigation'
                ]
            });
        }, 1000);
    };

    return (
        <div className={`px-2 ${className}`}>
            <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Crop Doctor</h3>
                        <p className="text-xs text-gray-600">Upload a photo of damaged/diseased crop</p>
                    </div>
                </div>

                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-lg p-4 mb-3 transition-colors duration-200 ${preview ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
                >
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                        {preview ? (
                            <div className="relative w-full">
                                <img src={preview} alt="preview" className="max-h-32 object-contain mx-auto" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); setFile(null); setResult(null); }}
                                    className="absolute top-0 right-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                                >
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-green-500" />
                                <div className="text-sm text-gray-600">Drop image here, or click to browse</div>
                                <div className="text-xs text-gray-400">Supports: JPG, PNG</div>
                            </>
                        )}
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onAnalyze}
                        disabled={!file || loading}
                        className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                            !file || loading 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-500'
                        }`}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Leaf className="w-4 h-4" />
                                Analyze
                            </>
                        )}
                    </button>
                    {file && !loading && (
                        <button
                            onClick={() => { setFile(null); setResult(null); }}
                            className="flex items-center gap-2 px-4 py-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Clear
                        </button>
                    )}
                </div>

                {result && (
                    <div className="mt-4 rounded-lg border border-green-200 overflow-hidden">
                        <div className="bg-green-50 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-medium text-gray-900">{result.diagnosis}</span>
                            </div>
                            <div className="text-xs font-medium text-green-800 bg-green-100 px-2 py-1 rounded-full">
                                {result.confidence} Confidence
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">Recommended Actions:</div>
                            <ul className="space-y-2">
                                {result.medications.map((m, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{m}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}