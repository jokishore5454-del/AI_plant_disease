import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Scan, 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Database, 
  Cpu, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setData(res.data);
      } catch (err) {
        setError('Failed to fetch dashboard telemetry summary.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-agri-500/30 border-t-agri-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const isRoleAdmin = data?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-agri-950 via-gray-900 to-emerald-950 p-8 border border-agri-600/20 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-agri-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-500/10 border border-agri-500/20 text-agri-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AgriVision AI Platform Active</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-sm text-gray-300 mt-1 max-w-xl">
              {isRoleAdmin 
                ? 'System Administrator Telemetry Hub. Monitor user activity, active ML model metrics, and dataset health.'
                : 'Access your integrated crop disease detection, soil telemetry health analysis, and yield prediction tools.'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/disease')}
              className="px-4 py-2.5 bg-agri-600 hover:bg-agri-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center space-x-2 transition-all"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Leaf Image</span>
            </button>
            <button
              onClick={() => navigate('/health')}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 flex items-center space-x-2 transition-all"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Assess Soil Health</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isRoleAdmin ? (
          <>
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Total Registered Users</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400"><Users className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.total_users || 0}</div>
              <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {data?.stats?.active_users || 0} Active Accounts
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">System Disease Scans</span>
                <div className="p-2 rounded-xl bg-agri-500/10 text-agri-400"><Scan className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.total_disease_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">MobileNetV2 CNN Model</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Soil Health Records</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Activity className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.total_health_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">RandomForest Classifier</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Yield Predictions</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><TrendingUp className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.total_yield_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">XGBoost Regressor</div>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Personal Predictions</span>
                <div className="p-2 rounded-xl bg-agri-500/10 text-agri-400"><Cpu className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.total_personal_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">Across All ML Models</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Leaf Disease Scans</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><Scan className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.user_disease_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">CNN Disease Classifier</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Soil Health Diagnostics</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400"><Activity className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.user_health_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">Soil Telemetry Model</div>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-xs font-mono uppercase">Yield Forecasts</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><TrendingUp className="w-5 h-5" /></div>
              </div>
              <div className="text-3xl font-bold text-white">{data?.stats?.user_yield_predictions || 0}</div>
              <div className="text-xs text-gray-400 font-mono">XGBoost Regressor</div>
            </div>
          </>
        )}
      </div>

      {/* Models Status & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ML Framework Engine Status */}
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-agri-400" /> Active ML Models
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-agri-500/10 text-agri-400 text-[10px] font-mono border border-agri-500/20">
              Online
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                <span>Crop Disease CNN</span>
                <span className="text-agri-400">MobileNetV2</span>
              </div>
              <div className="text-[11px] text-gray-400">10 Plant Class Categories • Transfer Learning</div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                <span>Crop Health Model</span>
                <span className="text-purple-400">RandomForest</span>
              </div>
              <div className="text-[11px] text-gray-400">Soil pH, N-P-K, Moisture & Climate Telemetry</div>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-950/60 border border-gray-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-200">
                <span>Crop Yield Regressor</span>
                <span className="text-amber-400">XGBoost</span>
              </div>
              <div className="text-[11px] text-gray-400">Regional Harvest Projections & Optimization</div>
            </div>
          </div>
        </div>

        {/* Activity & History Quick Panel */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> 
              {isRoleAdmin ? 'System Activity Log' : 'Recent Personal Predictions'}
            </h2>
            <Link to="/history" className="text-xs text-agri-400 hover:underline flex items-center gap-1">
              View History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isRoleAdmin ? (
            <div className="space-y-2">
              {data?.recent_activity?.length > 0 ? (
                data.recent_activity.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-gray-950/50 border border-gray-800/60 flex items-center justify-between text-xs">
                    <div className="space-x-2">
                      <span className="font-semibold text-agri-400">[{log.username}]</span>
                      <span className="text-gray-300">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 py-6 text-center">No system logs recorded yet.</div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recent_activity?.disease?.length > 0 ? (
                data.recent_activity.disease.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-xl bg-gray-950/50 border border-gray-800/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-gray-200">{rec.crop} - {rec.disease}</div>
                      <div className="text-[11px] text-gray-400">Confidence: {(rec.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(rec.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-gray-950/40 border border-gray-800 text-center text-xs text-gray-400">
                  No prediction history found. Start by uploading a crop leaf image!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
