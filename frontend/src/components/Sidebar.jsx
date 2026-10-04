import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Scan, 
  Camera,
  Activity, 
  TrendingUp, 
  Bot, 
  History, 
  BarChart3, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export const Sidebar = () => {
  const { isAdmin } = useAuth();

  const userNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Disease Detection', path: '/disease', icon: Scan },
    { label: 'Live Detection', path: '/live-detection', icon: Camera },
    { label: 'Crop Health', path: '/health', icon: Activity },
    { label: 'Yield Prediction', path: '/yield', icon: TrendingUp },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Prediction History', path: '/history', icon: History },
    { label: 'About Project', path: '/about', icon: Info },
  ];

  const adminNavItems = [
    { label: 'Admin Panel', path: '/admin', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 font-mono">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-agri-600 to-emerald-600 text-white shadow-md shadow-agri-950/40'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-gray-800">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider px-3 mb-2 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-950/40'
                          : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 text-xs text-gray-400 space-y-1">
        <div className="font-semibold text-gray-300">AgriVision AI System</div>
        <div>v1.0.0 • Production Ready</div>
        <div className="text-[10px] text-gray-500 font-mono">Dev: Prem Kumar.S</div>
      </div>
    </aside>
  );
};
