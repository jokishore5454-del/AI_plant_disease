import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DiseaseDetection } from './pages/DiseaseDetection';
import { LiveDetection } from './pages/LiveDetection';
import { CropHealth } from './pages/CropHealth';
import { YieldPrediction } from './pages/YieldPrediction';
import { Analytics } from './pages/Analytics';
import { PredictionHistory } from './pages/PredictionHistory';
import { AIAssistant } from './pages/AIAssistant';
import { AboutProject } from './pages/AboutProject';
import { AdminPanel } from './pages/AdminPanel';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-agri-500/30 border-t-agri-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="disease" element={<DiseaseDetection />} />
            <Route path="live-detection" element={<LiveDetection />} />
            <Route path="health" element={<CropHealth />} />
            <Route path="yield" element={<YieldPrediction />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="history" element={<PredictionHistory />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="about" element={<AboutProject />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
