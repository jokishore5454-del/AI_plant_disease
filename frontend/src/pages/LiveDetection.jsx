import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Camera, 
  VideoOff, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  Bot, 
  Sliders, 
  CheckCircle2, 
  Scan,
  Settings,
  Info,
  History
} from 'lucide-react';

export const LiveDetection = () => {
  const [streamActive, setStreamActive] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [intervalMs, setIntervalMs] = useState(1000);
  const [lowConfThreshold, setLowConfThreshold] = useState(0.60);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [cameraPermissionError, setCameraPermissionError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const liveIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle live detection interval loop
  useEffect(() => {
    if (isLiveMode && streamActive) {
      liveIntervalRef.current = setInterval(() => {
        captureAndAnalyzeFrame('live');
      }, intervalMs);
    } else {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    }

    return () => {
      if (liveIntervalRef.current) {
        clearInterval(liveIntervalRef.current);
      }
    };
  }, [isLiveMode, streamActive, intervalMs]);

  const startCamera = async () => {
    setCameraPermissionError('');
    setError('');

    try {
      if (streamRef.current) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStreamActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermissionError("Camera permission is required for live crop detection. Please allow camera access in browser settings and try again.");
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    setIsLiveMode(false);
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStreamActive(false);
  };

  const switchCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (streamActive) {
      stopCamera();
      setTimeout(() => startCamera(), 300);
    }
  };

  const captureAndAnalyzeFrame = async (mode = 'capture') => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }

    // Set canvas dimension matching video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas frame to JPEG base64 string
    const base64Image = canvas.toDataURL('image/jpeg', 0.85);

    if (mode === 'capture') setLoading(true);

    try {
      const res = await api.post('/disease/predict/webcam', {
        image_data: base64Image,
        detection_mode: mode,
        low_confidence_threshold: lowConfThreshold
      });

      setResult(res.data);
      setError('');
    } catch (err) {
      if (mode === 'capture') {
        setError(err.response?.data?.detail || 'Failed to process webcam frame inference.');
      }
    } finally {
      if (mode === 'capture') setLoading(false);
    }
  };

  const askAIAssistant = () => {
    if (!result) return;
    navigate('/ai-assistant', {
      state: {
        predictionType: 'disease',
        context: result,
        initialQuestion: `I scanned a ${result.crop_name} leaf via Live Detection and found ${result.disease_name} (Confidence: ${(result.confidence*100).toFixed(1)}%). What detailed care steps do you recommend?`
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-agri-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Real-time Video Vision Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Webcam Live Crop Disease Detection</h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">
            Point your webcam or mobile camera directly at an affected leaf. Choose single frame capture or continuous live streaming inference using MobileNetV2 CNN.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {!streamActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2.5 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg flex items-center space-x-2 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </button>
          ) : (
            <>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 bg-red-600/80 hover:bg-red-500 text-white font-semibold rounded-xl text-xs shadow-lg flex items-center space-x-2 transition-all"
              >
                <VideoOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>

              <button
                onClick={switchCamera}
                className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 flex items-center space-x-1.5 transition-all"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Switch</span>
              </button>
            </>
          )}
        </div>
      </div>

      {cameraPermissionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{cameraPermissionError}</span>
        </div>
      )}

      {/* Main Grid: Video Stream HUD & Detection Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Video Preview & Live Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-4">
            
            {/* Camera Viewfinder Box */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 min-h-[360px] flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-[360px] object-cover ${!streamActive ? 'hidden' : ''}`}
              />

              {/* Hidden Canvas for Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />

              {!streamActive && (
                <div className="text-center p-8 text-gray-500 space-y-3">
                  <Camera className="w-16 h-16 mx-auto text-gray-700 animate-pulse" />
                  <div>
                    <p className="text-sm font-semibold text-gray-300">Camera is Offline</p>
                    <p className="text-xs text-gray-500 mt-1">Click "Start Camera" above to initiate live video telemetry.</p>
                  </div>
                </div>
              )}

              {/* Live Status Badge HUD Overlay */}
              {streamActive && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gray-950/80 backdrop-blur-md border border-gray-700 text-[11px] font-mono flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-agri-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span className="text-gray-200">
                    {isLiveMode ? `Live Inference (${intervalMs}ms)` : 'Camera Active'}
                  </span>
                </div>
              )}

              {/* HUD Overlaid Result Pill */}
              {streamActive && result && (
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-gray-950/90 backdrop-blur-md border border-agri-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-agri-400 font-mono uppercase">{result.crop_name}</div>
                    <div className="font-bold text-white">{result.disease_name}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-agri-400 font-mono">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-gray-400 block font-mono">Confidence</span>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Bar */}
            {streamActive && (
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => captureAndAnalyzeFrame('capture')}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Scan className="w-4 h-4" />
                    )}
                    <span>Capture & Analyze Frame</span>
                  </button>

                  <button
                    onClick={() => setIsLiveMode(!isLiveMode)}
                    className={`px-4 py-3 rounded-xl font-semibold text-xs border transition-all flex items-center space-x-2 ${
                      isLiveMode 
                        ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow-lg shadow-amber-950/40' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLiveMode ? 'animate-spin' : ''}`} />
                    <span>{isLiveMode ? 'Live Mode ON' : 'Enable Live Mode'}</span>
                  </button>
                </div>

                {/* Live Interval & Config Controls */}
                <div className="p-3.5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-mono flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-agri-400" /> Frame Capture Rate ({intervalMs} ms)
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">500ms - 2000ms</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="2000"
                    step="100"
                    value={intervalMs}
                    onChange={(e) => setIntervalMs(parseInt(e.target.value))}
                    className="w-full accent-agri-500 bg-gray-900 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Prediction Telemetry Results (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 h-full flex flex-col justify-between space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
                <Sparkles className="w-5 h-5 text-agri-400" /> Live Telemetry Results
              </h2>

              {result ? (
                <div className="space-y-5">
                  {/* Result Header Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 to-agri-950/40 border border-agri-600/30 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono uppercase text-agri-400">{result.crop_name}</span>
                        <h3 className="text-xl font-bold text-white">{result.disease_name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-agri-400 font-mono">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">Confidence</span>
                      </div>
                    </div>

                    {result.quality_warning && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{result.quality_warning}</span>
                      </div>
                    )}
                  </div>

                  {/* Top 3 Predictions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold">Top Probabilities</h4>
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
                  <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
                    <div className="font-mono text-agri-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Agronomic Guidance
                    </div>
                    <p className="text-gray-300 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500 space-y-3">
                  <Scan className="w-12 h-12 mx-auto text-gray-700" />
                  <p className="text-sm">No live frame analyzed yet.</p>
                  <p className="text-xs text-gray-600">Start the camera and press "Capture & Analyze" or "Enable Live Mode".</p>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <button
                  onClick={askAIAssistant}
                  className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-agri-400 font-semibold rounded-xl text-xs border border-agri-500/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask AI Assistant for Treatment Explanation</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
