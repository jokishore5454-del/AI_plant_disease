import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Activity, 
  Sparkles, 
  Bot, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  BarChart2
} from 'lucide-react';

export const CropHealth = () => {
  const [formData, setFormData] = useState({
    soil_ph: 6.5,
    soil_moisture: 55.0,
    temperature: 26.5,
    humidity: 68.0,
    rainfall: 120.0,
    nitrogen: 85.0,
    phosphorus: 45.0,
    potassium: 50.0,
    electrical_conductivity: 1.2
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/health/predict', formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error running Random Forest Crop Health Classifier.');
    } finally {
      setLoading(false);
    }
  };

  const askAIAssistant = () => {
    if (!result) return;
    navigate('/ai-assistant', {
      state: {
        predictionType: 'health',
        context: result,
        initialQuestion: `My crop health status is "${result.predicted_health}". How can I adjust my N-P-K fertilizer and irrigation for optimal yields?`
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Scikit-Learn RandomForestClassifier</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Crop Health & Soil Telemetry Assessment</h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Enter soil chemical telemetry (pH, N-P-K, EC) and microclimate parameters. Our Random Forest Ensemble evaluates nutrient availability and stress categories with feature importance metrics.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
            <Sliders className="w-5 h-5 text-purple-400" /> Soil Telemetry Input Parameters
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Soil pH Level (0 - 14)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  name="soil_ph"
                  value={formData.soil_ph}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Soil Moisture (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  name="soil_moisture"
                  value={formData.soil_moisture}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rainfall (mm)</label>
                <input
                  type="number"
                  step="1"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Nitrogen (N) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Phosphorus (P) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Potassium (K) kg/ha</label>
                <input
                  type="number"
                  step="1"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Electrical Conductivity (dS/m)</label>
              <input
                type="number"
                step="0.1"
                name="electrical_conductivity"
                value={formData.electrical_conductivity}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-purple-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Random Forest Decision Trees...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Evaluate Crop Health Telemetry</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Output Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" /> Random Forest Evaluation
            </h2>

            {result ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-gray-950 to-purple-950/40 border border-purple-500/30 space-y-2">
                  <span className="text-xs font-mono uppercase text-purple-400">Assessed Crop Health Status</span>
                  <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-purple-400" />
                    {result.predicted_health}
                  </h3>
                </div>

                {/* Class Probabilities */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold">Classification Probability Distribution</h4>
                  {Object.entries(result.probabilities || {}).map(([cls, prob], i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-300">
                        <span>{cls}</span>
                        <span className="font-mono text-purple-400">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800">
                        <div 
                          className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feature Importances */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-purple-400" /> Random Forest Feature Importance Drivers
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(result.important_features || {}).map(([feat, imp], i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 flex justify-between items-center">
                        <span className="text-gray-400 capitalize">{feat.replace('_', ' ')}</span>
                        <span className="font-mono text-purple-300 font-bold">{(imp * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 space-y-3">
                <Activity className="w-12 h-12 mx-auto text-gray-700" />
                <p className="text-sm">No telemetry parameters evaluated yet.</p>
                <p className="text-xs text-gray-600">Fill in soil parameters to compute Random Forest health state.</p>
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={askAIAssistant}
              className="mt-6 w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-purple-300 font-semibold rounded-xl text-xs border border-purple-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant for Soil Amendment Advice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
