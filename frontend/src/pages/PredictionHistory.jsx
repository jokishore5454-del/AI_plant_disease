import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  History, 
  Trash2, 
  Scan, 
  Activity, 
  TrendingUp, 
  Filter, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const PredictionHistory = () => {
  const [filterType, setFilterType] = useState('all');
  const [data, setData] = useState({ disease: [], health: [], yield: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/history?prediction_type=${filterType}`);
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch prediction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterType]);

  const handleDelete = async (recordType, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${recordType} prediction record?`)) return;

    try {
      await api.delete(`/history/${recordType}/${id}`);
      setDeleteMsg(`Deleted ${recordType} record #${id}`);
      fetchHistory();
      setTimeout(() => setDeleteMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete record.');
    }
  };

  const allRecords = [
    ...(data.disease || []),
    ...(data.health || []),
    ...(data.yield || [])
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-agri-400 text-xs font-mono uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>User Isolated Data Records</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Prediction History</h1>
          <p className="text-xs text-gray-400 mt-1">
            Your personal record repository for crop disease scans, soil health assessments, and yield forecasts.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 p-1.5 rounded-2xl shrink-0">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
          {['all', 'disease', 'health', 'yield'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === type 
                  ? 'bg-agri-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {deleteMsg && (
        <div className="p-3.5 rounded-xl bg-agri-500/10 border border-agri-500/20 text-agri-400 text-xs font-mono">
          {deleteMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-agri-500/30 border-t-agri-500 rounded-full animate-spin" />
        </div>
      ) : allRecords.length > 0 ? (
        <div className="space-y-4">
          {allRecords.map((rec) => (
            <div 
              key={`${rec.type}-${rec.id}`}
              className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  rec.type === 'disease' ? 'bg-agri-500/10 text-agri-400' :
                  rec.type === 'health' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {rec.type === 'disease' ? <Scan className="w-6 h-6" /> :
                   rec.type === 'health' ? <Activity className="w-6 h-6" /> :
                   <TrendingUp className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800 text-gray-300">
                      {rec.type}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(rec.created_at).toLocaleString()}
                    </span>
                  </div>

                  {rec.type === 'disease' && (
                    <div>
                      <div className="text-base font-bold text-white">{rec.crop_name} - {rec.disease_name}</div>
                      <div className="text-xs text-gray-400 font-mono">Confidence: {(rec.confidence * 100).toFixed(1)}%</div>
                    </div>
                  )}

                  {rec.type === 'health' && (
                    <div>
                      <div className="text-base font-bold text-white">Soil Health: {rec.predicted_health}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        pH: {rec.input_parameters?.soil_ph} | Moisture: {rec.input_parameters?.soil_moisture}% | N: {rec.input_parameters?.nitrogen}
                      </div>
                    </div>
                  )}

                  {rec.type === 'yield' && (
                    <div>
                      <div className="text-base font-bold text-white">Forecast: {rec.predicted_yield} {rec.unit}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        Crop: {rec.input_parameters?.crop_type} ({rec.input_parameters?.season}) | Area: {rec.input_parameters?.area_hectares} ha
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => handleDelete(rec.type, rec.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-gray-900 border border-gray-800 text-center space-y-3">
          <FileText className="w-12 h-12 mx-auto text-gray-700" />
          <p className="text-sm text-gray-300 font-semibold">No records found for current filter.</p>
          <p className="text-xs text-gray-500">Run disease scans, soil health tests, or yield predictions to populate history.</p>
        </div>
      )}
    </div>
  );
};
