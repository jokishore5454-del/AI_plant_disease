import React from 'react';
import { Sprout, Code, Cpu, Database, Award, Shield, CheckCircle2 } from 'lucide-react';

export const AboutProject = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-agri-500 to-emerald-400 p-0.5 shadow-xl mx-auto">
          <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center">
            <Sprout className="w-9 h-9 text-agri-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">AgriVision AI</h1>
        <p className="text-sm text-agri-400 font-mono">
          An Integrated Machine Learning Framework for Crop Disease Detection, Crop Health Monitoring, and Yield Prediction Using CNN, Random Forest, and XGBoost
        </p>
      </div>

      {/* Developers Card */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
          <div className="text-xs font-mono uppercase text-agri-400 font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Lead Project Developer
          </div>
          <div className="text-xl font-bold text-white">Prem Kumar.S</div>
          <div className="text-xs text-gray-400 font-mono">Full-Stack AI Framework Architect</div>
        </div>

        <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-2">
          <div className="text-xs font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Sub-Developer
          </div>
          <div className="text-xl font-bold text-white">Kishore V A</div>
          <div className="text-xs text-gray-400 font-mono">ML Engineering & Pipeline Specialist</div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
          <Cpu className="w-5 h-5 text-agri-400" /> Technology Architecture Stack
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Frontend</div>
            <div className="text-gray-400">React 18 + Vite</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Styling</div>
            <div className="text-gray-400">Tailwind CSS</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Backend APIs</div>
            <div className="text-gray-400">FastAPI & Uvicorn</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Database</div>
            <div className="text-gray-400">SQLite + SQLAlchemy</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">CNN Model</div>
            <div className="text-gray-400">MobileNetV2 Transfer</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Health Model</div>
            <div className="text-gray-400">Scikit-Learn RF</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Yield Model</div>
            <div className="text-gray-400">XGBoost Regressor</div>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <div className="font-semibold text-white">Security</div>
            <div className="text-gray-400">JWT + Argon2 / Bcrypt</div>
          </div>
        </div>
      </div>
    </div>
  );
};
