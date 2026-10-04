import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  TrendingUp, 
  Sparkles, 
  Bot, 
  Sliders, 
  AlertCircle, 
  Award, 
  BarChart3
} from 'lucide-react';

export const YieldPrediction = () => {
  const [formData, setFormData] = useState({
    crop_type: 'Wheat',
    season: 'Kharif',
    area_hectares: 5.0,
    rainfall_mm: 650.0,
    avg_temp_c: 24.0,
    fertilizer_kg_per_ha: 110.0,
    soil_quality_index: 78.0
  });

  const [options, setOptions] = useState({ crops: ["Wheat", "Rice", "Maize", "Potato", "Tomato"], seasons: ["Kharif", "Rabi", "Zaid"] });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/yield/options')
      .then(res => setOptions(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'crop_type' || name === 'season') ? value : (parseFloat(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/yield/predict', formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error running XGBoost Crop Yield Regressor.');
    } finally {
      setLoading(false);
    }
  };

  const askAIAssistant = () => {
    if (!result) return;
    navigate('/ai-assistant', {
      state: {
        predictionType: 'yield',
        context: result,
        initialQuestion: `My predicted harvest yield for ${formData.crop_type} is ${result.predicted_yield} tons/ha. What fertigation schedule will boost this yield?`
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>XGBoost XGBRegressor Machine Learning</span>
        </div>
        <h1 className="text-2xl font-bold text-white">XGBoost Crop Yield Forecasting</h1>
        <p className="text-xs text-gray-400 mt-1 max-w-2xl">
          Forecast total harvest output per hectare using gradient boosted decision trees. Adjust cultivated acreage, microclimatic precipitation, and fertilizer rates to optimize seasonal profitability.
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
            <Sliders className="w-5 h-5 text-amber-400" /> Agronomic Yield Inputs
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Crop Type</label>
                <select
                  name="crop_type"
                  value={formData.crop_type}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {options.crops.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Cultivation Season</label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  {options.seasons.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Cultivated Area (Hectares)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  name="area_hectares"
                  value={formData.area_hectares}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Rainfall (mm)</label>
                <input
                  type="number"
                  step="10"
                  name="rainfall_mm"
                  value={formData.rainfall_mm}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Average Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  name="avg_temp_c"
                  value={formData.avg_temp_c}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">Fertilizer Application (kg/ha)</label>
                <input
                  type="number"
                  step="5"
                  name="fertilizer_kg_per_ha"
                  value={formData.fertilizer_kg_per_ha}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1">Soil Quality Index (0 - 100)</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                name="soil_quality_index"
                value={formData.soil_quality_index}
                onChange={handleChange}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Computing Gradient Boosted Trees...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Forecast Crop Yield</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Box */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-amber-400" /> XGBoost Regressor Output
            </h2>

            {result ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-950 to-amber-950/40 border border-amber-500/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono uppercase text-amber-400">{formData.crop_type} ({formData.season} Season)</span>
                      <h3 className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                        {result.predicted_yield} <span className="text-base font-normal text-gray-400">{result.unit}</span>
                      </h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800/80 flex justify-between text-xs text-gray-300">
                    <span>Projected Harvest Total ({formData.area_hectares} ha):</span>
                    <span className="font-bold text-white font-mono">
                      {(result.predicted_yield * formData.area_hectares).toFixed(1)} Tons
                    </span>
                  </div>
                </div>

                {/* Feature Importances */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-amber-400" /> XGBoost Feature Weight Distribution
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(result.important_features || {}).map(([feat, imp], i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-300">
                          <span className="capitalize">{feat.replace('_', ' ')}</span>
                          <span className="font-mono text-amber-400">{(imp * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-950 rounded-full h-2 overflow-hidden border border-gray-800">
                          <div 
                            className="bg-gradient-to-r from-amber-600 to-orange-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${imp * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 space-y-3">
                <TrendingUp className="w-12 h-12 mx-auto text-gray-700" />
                <p className="text-sm">No yield regression performed yet.</p>
                <p className="text-xs text-gray-600">Configure cultivated crop & area to forecast harvest totals.</p>
              </div>
            )}
          </div>

          {result && (
            <button
              onClick={askAIAssistant}
              className="mt-6 w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-amber-300 font-semibold rounded-xl text-xs border border-amber-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Assistant for Yield Optimization Insights</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
