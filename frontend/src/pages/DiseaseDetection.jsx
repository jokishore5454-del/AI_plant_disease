import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  UploadCloud, 
  Scan, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  Sparkles,
  Info,
  Image as ImageIcon
} from 'lucide-react';

export const DiseaseDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [supportedClasses, setSupportedClasses] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/disease/classes')
      .then(res => setSupportedClasses(res.data.classes || []))
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10 MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10 MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drag a leaf image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/disease/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error executing MobileNetV2 CNN crop disease detection model.');
    } finally {
      setLoading(false);
    }
  };

  const askAIAssistant = () => {
    if (!result) return;
    navigate('/ai-assistant', {
      state: {
        predictionType: 'disease',
        context: result,
        initialQuestion: `Can you explain the diagnosis for my ${result.crop_name} showing ${result.disease_name}? What organic and chemical steps should I take?`
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-agri-400 text-xs font-mono uppercase tracking-wider mb-1">
          <Scan className="w-4 h-4" />
          <span>MobileNetV2 Transfer Learning CNN</span>
        </div>
        <h1 className="text-2xl font-bold text-white">CNN Crop Disease Detection</h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Upload a clear photograph of an affected leaf surface. Our MobileNetV2 convolutional neural network analyzes visual symptoms, spot patterns, and discoloration across 10 target crop categories.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <UploadCloud className="w-5 h-5 text-agri-400" /> Upload Leaf Image
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-800 hover:border-agri-500/60 rounded-2xl p-8 text-center transition-all bg-gray-950/40 relative cursor-pointer group"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img 
                    src={previewUrl} 
                    alt="Uploaded leaf preview" 
                    className="max-h-56 mx-auto rounded-xl shadow-lg border border-gray-800 object-cover"
                  />
                  <p className="text-xs text-gray-400 font-mono">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-3 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-agri-950/80 border border-agri-600/30 flex items-center justify-center mx-auto text-agri-400 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Drag & drop your leaf image here</p>
                    <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP (Max 10 MB)</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-agri-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing MobileNetV2 Pipeline...</span>
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  <span>Execute Disease Diagnosis</span>
                </>
              )}
            </button>
          </form>

          {/* Supported crop classes preview */}
          <div className="pt-4 border-t border-gray-800/80">
            <div className="text-xs font-semibold text-gray-400 mb-2 font-mono flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-agri-400" /> Supported Model Classes ({supportedClasses.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {supportedClasses.map((cls, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800 text-[10px] text-gray-300">
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Results Display Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-agri-400" /> Diagnostic Result Output
            </h2>

            {result ? (
              <div className="space-y-6">
                {/* Primary Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 to-agri-950/40 border border-agri-600/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono uppercase text-agri-400">{result.crop_name}</span>
                      <h3 className="text-xl font-bold text-white">{result.disease_name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-agri-400">
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">Confidence</span>
                    </div>
                  </div>

                  {/* Confidence warning */}
                  {result.confidence < 0.60 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Low confidence diagnosis. Recommended: Inspect leaf in high resolution.</span>
                    </div>
                  )}
                </div>

                {/* Top 3 Predictions Bar */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold">Top Model Softmax Probabilities</h4>
                  {result.top_predictions.map((pred, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-300">
                        <span>{pred.label}</span>
                        <span className="font-mono text-agri-400">{(pred.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-gradient-to-r from-agri-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
                  <h4 className="text-xs font-mono uppercase text-agri-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Agronomic Treatment Plan
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 space-y-3">
                <Scan className="w-12 h-12 mx-auto text-gray-700" />
                <p className="text-sm">No leaf image processed yet.</p>
                <p className="text-xs text-gray-600">Upload a leaf sample to display classification telemetry.</p>
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={askAIAssistant}
              className="mt-6 w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-agri-400 font-semibold rounded-xl text-xs border border-agri-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant for Treatment Explanation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
