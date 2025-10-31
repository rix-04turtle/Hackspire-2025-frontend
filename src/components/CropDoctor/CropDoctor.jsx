import React, { useEffect, useState } from 'react';

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
    <div className={`px-2 py-4 ${className}`}>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Crop Doctor</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a photo of the damaged or diseased crop.</p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="border-2 border-dashed border-green-200 rounded-md p-4 mb-4"
        >
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <div className="text-sm text-gray-600">Drag & drop an image here, or click to browse</div>
            {preview ? (
              <img src={preview} alt="preview" className="mt-3 max-h-48 object-contain" />
            ) : (
              <div className="mt-3 text-xs text-gray-400">Supported formats: JPG, PNG</div>
            )}
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAnalyze}
            disabled={!file || loading}
            className={`bg-green-600 text-white px-4 py-2 rounded ${(!file || loading) ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-500'}`}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={() => { setFile(null); setResult(null); }}
            className="px-4 py-2 rounded border border-gray-200"
          >
            Clear
          </button>
        </div>

        {result && (
          <div className="mt-4 bg-green-50 p-3 rounded">
            <div className="text-sm text-gray-800 font-semibold">Diagnosis: {result.diagnosis}</div>
            <div className="text-xs text-gray-600">Confidence: {result.confidence}</div>
            <div className="mt-2 text-sm text-gray-700">Recommended actions:</div>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {result.medications.map((m, i) => <li key={i}>{m}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
