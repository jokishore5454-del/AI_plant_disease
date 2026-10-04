import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Eye, EyeOff, Lock, User, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        await register(username, email, password);
        // Auto login after registration
        await login(username, password);
      } else {
        await login(username, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 selection:bg-agri-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-agri-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-gray-900/80 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 backdrop-blur-xl">
        
        {/* Left Branding Side */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-agri-950 via-gray-900 to-gray-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-800/80">
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-500 to-emerald-400 p-0.5 shadow-lg shadow-agri-950/60">
                <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-agri-400" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white">AgriVision <span className="text-agri-400">AI</span></span>
                <span className="text-xs text-gray-400 block font-mono">Precision Agriculture Platform</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-4 leading-tight font-sans">
              Integrated Machine Learning Framework for Smart Agriculture
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              AI-driven Crop Disease Detection via MobileNetV2 CNN, Soil Health Classification via Random Forest, and Crop Yield Forecasting via XGBoost.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-agri-400 shrink-0" />
                <span>Real-time Transfer Learning CNN Leaf Diagnosis</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-agri-400 shrink-0" />
                <span>Random Forest Soil Telemetry & Microclimate Analysis</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-agri-400 shrink-0" />
                <span>XGBoost Harvest Yield & Fertilizer Optimizers</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800/60 text-[11px] text-gray-500 flex justify-between font-mono">
            <span>Developer: Prem Kumar.S</span>
            <span>Sub-Developer: Kishore V A</span>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {isRegister ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-gray-400">
              {isRegister 
                ? 'Register to access precision crop analytics and AI tools.' 
                : 'Sign in to access your crop dashboard and models.'}
            </p>
          </div>

          {localError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono uppercase">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-agri-500 focus:ring-1 focus:ring-agri-500 transition-all"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agrivision.ai"
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-agri-500 focus:ring-1 focus:ring-agri-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 font-mono uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-gray-950/80 border border-gray-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-agri-500 focus:ring-1 focus:ring-agri-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-800 bg-gray-950 text-agri-500 focus:ring-agri-500 focus:ring-offset-gray-900"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-agri-600 to-emerald-600 hover:from-agri-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-agri-950/50 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In to Platform'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800/80 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setLocalError('');
              }}
              className="text-xs text-agri-400 hover:text-agri-300 font-medium transition-colors"
            >
              {isRegister 
                ? 'Already have an account? Log in' 
                : "Don't have an account? Register here"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
